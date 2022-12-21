const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require("body-parser");

//our imported files:
const db = require('./queries');
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

// app.route("/databases/:id")
//     .get(db.getTables)
//     .post(db.createTable)
//     .delete(db.deleteTable);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})