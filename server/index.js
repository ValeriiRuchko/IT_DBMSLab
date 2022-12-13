const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({extended: true}));

// our REST-API
app.route("/")
    .get((req, res) => {        
            //sends a response
        });

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})