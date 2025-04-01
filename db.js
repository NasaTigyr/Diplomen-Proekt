const mysql = require('mysql2/promise');  // Note: using the promise version

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'serverUser',
  password: 'password',
  database: 'test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection (optional)
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to the database.');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
};

testConnection();  // Run the test

module.exports = pool;
