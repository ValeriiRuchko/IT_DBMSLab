const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require("body-parser");

//our imported files:
const db = require('./queries');
const { request, response } = require('express');
// dictionary to store all of our pools //// key is name of db, as a string
const pools = new Map();
// creating new pool to connect to our starting database:
const mainPool = db.createPool("it_dbms_lab");
// adding new pool to our map
pools.set("it_dbms_lab", mainPool);



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
    })
);
// now we can serve static files to the client
app.use(express.static("public"));

// our REST-API
// GET-request to root path
app.get("/", (request, response) => {
            // sending a response in json format
            response.json({info: "It's starting page of our app"});
        });

// --------------------------------------------------------------------------------------------------------------------------------

// collection of HTTP-requests for our /databases route /// we implement getting databases list and creating new database
// (or simply GET/POST request for /databases)
app.route("/databases")
    .get( (request, response) => {
        pools.get("it_dbms_lab").query('SELECT db_name FROM virtual_databases', (error, results) => {
            if (error) {
                throw error;
            }
            for (let i = 0; i < results.rows.length; ++i) {
                pools.set(results.rows[i].db_name, db.createPool(results.rows[i].db_name));
            }
            // console.log(pools);
            // console.log(results.rows);
            response.status(200).json(results.rows);
        })
    })
    .post ( (request, response) => {
        // getting db_name to be created from form-data sent in json format
        const user_db_name = request.body.db_name;
        // variable to check if db is already created or not
        let db_exists;
        // acquiring client from a pool of main database which stores info about all user's databases
        const checkExistence = async () => {
            const client = await pools.get("it_dbms_lab").connect();
            try {
                // checking database existence by comparing names of all db's which are on current db-server to user's db name
                const res = await client.query('SELECT datname FROM pg_database WHERE datname = ($1)', [user_db_name]);
                // console.log(res.rows[0] === undefined);
                if (res.rows[0] === undefined) {
                    db_exists = false;
                    response.status(200).json({db_name: user_db_name});
                } else {
                    db_exists = true;
                    response.status(200).json({info: "DB already exists"});
                }
            } catch (err) {
                console.error('Error quering with', err.stack)
            } finally {
                client.release();   // releasing our client after going through query back to pool
            }
        };
        // creating new database if it doesn't exist
        const createDB = async () => {
            const client = await pools.get("it_dbms_lab").connect();
            try {
                const res = await client.query(`CREATE DATABASE ${user_db_name}`);
                // inserting db_name to our main db which holds info about other databases
                const res2 = await client.query('INSERT INTO virtual_databases (db_name) VALUES ($1) RETURNING *', [user_db_name]);
                console.log(`Database ${user_db_name} was created successfully`);
                // console.log(pools);
            } catch (err) {
                console.error('Error creating DB', err.stack)
            } finally {
                client.release();
            }
        };

        checkExistence().then( () => {
            // console.log(`dbexists = ${db_exists}`);
            if(db_exists == false) {
                createDB();
            }
        });
        pools.set(user_db_name, db.createPool(user_db_name)); // adding new db pool to our pools array
        // console.log(pools);
    });

app.route("/databases/:db_name")
    // get list of all tables which belong to database with db_name
    .get( (request, response) => {
        let db_name = request.params.db_name;
        pools.get("it_dbms_lab").query(
            `SELECT v.table_name FROM virtual_tables_list v
            JOIN virtual_databases vd ON v.belongs_to_db = vd.id
            WHERE vd.db_name = ($1)`, [db_name],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        })
    })
    .post( (request, response) => {
        let db_name = request.params.db_name;
        // table name which client sends
        const user_table_name = request.body.table_name;
        // creating asynchronous function to create new table in db with db_name
        const createTable = async () => {
            const client = await pools.get(db_name).connect();
            try {
                // creating our table if it doesn't exist
                const res = await client.query(`CREATE TABLE IF NOT EXISTS ${user_table_name} (id SERIAL PRIMARY KEY)`);
                // inserting info about our table in our list of all tables
                await pools.get("it_dbms_lab").query(`INSERT INTO virtual_tables_list (table_name, belongs_to_db) VALUES (($1), 
                (SELECT id FROM virtual_databases WHERE db_name = ($2)))`, [user_table_name, db_name],
                (error, results) => {
                    if (error) {
                        throw error;
                    }
                });
                response.status(200).json({info: `Table ${user_table_name} has been created all it already exists`});
            } catch (err) {
                response.status(200).json({info: "Error while creating table, error occured"});
                console.error('Error creating table', err.stack)
            } finally {
                client.release();   // releasing our client after going through query back to pool
            }
        }
        // calling our function
        createTable();
    })
    .delete( (request, response) => {
        let db_name = request.params.db_name;
        // table name which client sends
        const user_table_name = request.body.table_name;
        // creating asynchronous function to delete table in db with db_name
        const deleteTable = async () => {
            const client = await pools.get(db_name).connect();
            try {
                // deleting table if it exists
                const res = await client.query(`DROP TABLE IF EXISTS ${user_table_name}`);
                // also deleting record from our main db
                await pools.get("it_dbms_lab").query(`DELETE FROM virtual_tables_list WHERE table_name = ($1)`,
                [user_table_name],
                (error, results) => {
                    if (error) {
                        throw error;
                    }
                });
                response.status(200).json({info: `Table ${user_table_name} has been successfully deleted`});
            } catch (err) {
                response.status(200).json({info: "Error while deleting table, error occured"});
                console.error('Error deleting table', err.stack)
            } finally {
                client.release();   // releasing our client after going through query back to pool
            }
        }
        // calling our function
        deleteTable();
    });

app.route("/databases/:db_name/:table_name")
    .get();

// app.route("/databases/:db_name/:table_name/create_column")
// .post();

// post (create row) delete patch(change row)

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})