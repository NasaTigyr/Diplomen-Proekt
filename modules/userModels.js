const db = require('../db');

const User = {
  findByName: (name, callback) => {
    const query = 'SELECT * FROM users WHERE name = ?';
    db.query(query, [name], callback);
  },

  create: (name, hashedPassword, callback) => {
    const query = 'INSERT INTO users (name, password) VALUES (?, ?)';
    db.query(query, [name, hashedPassword], callback);
  }
};

module.exports = User;

