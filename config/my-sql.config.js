const mysql = require('mysql2/promise');

const conn = mysql.createPool({
    host: 'db4free.net',
    user: 'shmarina',
    password: 'A@_$GJG!Ukc@82*',
    database: 'planetariumxdb',
});

module.exports = conn;