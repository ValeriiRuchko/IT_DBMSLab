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
app.get("/", (request, response) => {
            //sends a response
            response.json({info: "It's starting page of our app"});
        });

// collection of HTTP-requests for our /databases route /// we implement getting databases list and creating new database
app.route("/databases")
    .get( (request, response) => {
        pools.get("it_dbms_lab").query('SELECT * FROM virtual_databases', (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        })
    })
    .post ( (request, response) => {
        // getting our db name from form-data
        const user_db_name = request.body.db_name;
        let db_exists = true;

        pools.get("it_dbms_lab").connect((err, client, release) => {
            if (err) {
                return console.error('Error acquiring clien', err.stack)
            }; 
            client.query('SELECT datname FROM pg_database WHERE datname = ($1)', [user_db_name] ,(error, results) => {
                if (error) {
                    throw error;
                }
                if (results.rows[0] === undefined) {
                    db_exists = false;
                }
                //console.log(results.rows[0]);
                console.log(results.rows[0] === undefined);
                release();
           })  
        })
        
        
        if(!db_exists === false) {
            // creating new database if it doesn't exist
            pools.get("it_dbms_lab").connect((err, client, release) => {
                if (err) {
                    return console.error('Error acquiring clien', err.stack)
                }; 
                client.query(`CREATE DATABASE ${user_db_name}`, (error, results) => {
                    if (error) {
                        console.log(error.stack);
                        response.status(400).send('DB already exists');
                    } else {
                        console.log(`Database ${user_db_name} was created successfully`);
                        response.status(200).json({db_name: user_db_name});
                    }
                })
                // inserting db name to our main db
                client.query('INSERT INTO virtual_databases (db_name) VALUES ($1) RETURNING *', [user_db_name], (error, results) => {
                    if (error) {
                        console.log(error.stack.error);
                    }
                })
                release();
            })
        }
        pools.set(user_db_name, db.createPool("user_db_name"));
        console.log(pools);
    });

// app.route("/databases/:id")
//     .get(db.getTables)
//     .post(db.createTable)
//     .delete(db.deleteTable);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})