const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'it_dbms_lab',
    password: 'g2923133g',
    port: 5432,
})
// our queries for database:
const getUsers = (request, response) => {
    pool.query('SELECT * FROM virtual_databases', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    })
}
//exporting all queries to index.js
module.exports = {
    getUsers
}