// models/User.js
const db = require('../db');
const bcrypt = require('bcryptjs');

class User {
  static async findById(id) {
    const [rows] = await db.promise().query(
      'SELECT id, username, email, full_name, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }
  
  static async findByEmail(email) {
    const [rows] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }
  
  static async findByUsername(username) {
    const [rows] = await db.promise().query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }
  
  static async create(userData) {
    const { username, email, password, full_name } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.promise().query(
      'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, full_name]
    );
    
    return {
      id: result.insertId,
      username,
      email,
      full_name
    };
  }
  
  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }
  
  static async update(id, userData) {
    const { username, email, full_name } = userData;
    
    const [result] = await db.promise().query(
      'UPDATE users SET username = ?, email = ?, full_name = ? WHERE id = ?',
      [username, email, full_name, id]
    );
    
    return result.affectedRows > 0;
  }
  
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const [result] = await db.promise().query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = User;
