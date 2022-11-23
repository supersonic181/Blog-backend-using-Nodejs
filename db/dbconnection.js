const mysql = require('mysql');

const { dbConfig } = require("../config/appConfig");

const connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port
});

connection.connect((err) => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    // console.log('connected as id ' + connection.threadId);
    console.log('connnected to database');
});

module.exports = {connection};