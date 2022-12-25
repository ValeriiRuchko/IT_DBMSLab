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

//exporting our dynamic poolCreator to index.js
module.exports = {
    createPool
    // createClient
}