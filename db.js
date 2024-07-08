const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'iot',
    // multipleStatements: true


    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
})

module.exports = pool;