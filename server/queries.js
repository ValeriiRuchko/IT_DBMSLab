const Pool = require('pg').Pool;
// const Client = require('pg').Client;

const createPool = (database_name) => {
    // creating new pool to connect to our db
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: `${database_name}`,
        password: 'g2923133g',
        port: 5432,
    })

    return pool;
};

// const createClient = (database_name) => {
//     // creating new client to connect to our db
//     const client = new Client({
//         user: 'postgres',
//         host: 'localhost',
//         database: `${database_name}`,
//         password: 'g2923133g',
//         port: 5432,
//     })

//     return client;
// };

// --------------------------------------------------------------------------------------------------------------------------------

// our queries for route "/databases/:id"
// const getTables = (request, response) => {
//     const db_identifier = parseInt(request.params.id); 

//     pool.query('SELECT * FROM virtual_tables_list WHERE belongs_to_db = $1', [db_identifier], (error, results) => {
//         if (error) {
//             throw error;
//         }
//         response.status(200).json(results.rows[0].table_name);
//     })
// }

// const createTable = (request, response) => {
//     const req_data = request.body;
//     const db_identifier = parseInt(request.params.id);

//     pool.query('INSERT INTO virtual_tables_list (belongs_to_db, table_name) VALUES ($1, $2) RETURNING *', [db_identifier, req_data.table_name], (error, results) => {
//         if (error) {
//             throw error;
//         }
//         response.status(200).send(`Table with name ${results.rows[0].table_name} is added`);
//     })
// }

// const deleteTable = (request, response) => {
//     // getting our db name from form-data
//     const req_data = request.body;

//     pool.query('INSERT INTO virtual_databases (db_name) VALUES ($1) RETURNING *', [req_data.db_name], (error, results) => {
//         if (error) {
//             throw error;
//         }
//         response.status(200).send(`Database with name ${results.rows[0].db_name} is added`);
//     })
// }

// --------------------------------------------------------------------------------------------------------------------------------

//exporting our dynamic poolCreator to index.js
module.exports = {
    createPool
    // createClient
}