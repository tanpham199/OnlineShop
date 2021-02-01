const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-server',
    password: 'root',
});

module.exports = pool.promise();
