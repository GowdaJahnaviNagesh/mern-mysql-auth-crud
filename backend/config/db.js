// backend/config/db.js
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host:              process.env.DB_HOST || 'localhost',
  port:              parseInt(process.env.DB_PORT) || 3306,
  user:              process.env.DB_USER || 'root',
  password:          process.env.DB_PASSWORD || '',
  database:          process.env.DB_NAME || 'mern_auth_db',
  waitForConnections: true,
  connectionLimit:   10,
  queueLimit:        0,
});

// Promote pool to use Promises
const promisePool = pool.promise();

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL Connection Error:', err.message);
    return;
  }
  console.log('✅ MySQL Connected Successfully');
  connection.release();
});

module.exports = promisePool;