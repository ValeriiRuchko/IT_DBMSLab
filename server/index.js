const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require("body-parser")

//our imported files:
const db = require('./queries');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
    })
);
// now we can serve static files to the client
app.use(express.static("public"));

// our REST-API
app.get("/", (req, res) => {        
            console.log("GET-request on root route");   //sends a response
            res.json({info: "Node.js, Postgress and myass"});
        });

app.get("/all-dbs", db.getUsers);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})