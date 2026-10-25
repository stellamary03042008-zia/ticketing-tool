require('dotenv').config();

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
host: process.env.DB_HOST || 'localhost',
user: process.env.DB_USER || 'root',
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME || 'ticketflow_db',
port: Number(process.env.DB_PORT) || 3306,
waitForConnections: true,
connectionLimit: 10,
queueLimit: 0
});

pool.getConnection()
.then((connection) => {
console.log('MySQL connected successfully!');
connection.release();
})
.catch((error) => {
console.error('MySQL connection failed:', error.message);
});

module.exports = pool;
