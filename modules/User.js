// models/User.js
const db = require('../db');
const bcrypt = require('bcryptjs');

class User {
  static async findById(id) {
    const [rows] = await db.promise().query(
      `SELECT id, email, first_name, last_name, date_of_birth, gender, 
      user_type, profile_picture, contact_number, created_at 
      FROM users WHERE id = ?`,
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
  
  static async create(userData) {
    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      date_of_birth, 
      gender, 
      user_type = 'regular', 
      profile_picture = null, 
      contact_number = null 
    } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.promise().query(
      `INSERT INTO users (
        email, password_hash, first_name, last_name, 
        date_of_birth, gender, user_type, profile_picture, contact_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email, 
        hashedPassword, 
        first_name, 
        last_name, 
        date_of_birth, 
        gender, 
        user_type, 
        profile_picture, 
        contact_number
      ]
    );
    
    return {
      id: result.insertId,
      email,
      first_name,
      last_name,
      date_of_birth,
      gender,
      user_type,
      profile_picture,
      contact_number
    };
  }
  
  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }
  
  static async update(id, userData) {
    const { 
      email, 
      first_name, 
      last_name,
      contact_number,
      profile_picture 
    } = userData;
    
    const [result] = await db.promise().query(
      `UPDATE users 
       SET email = ?, first_name = ?, last_name = ?, 
       contact_number = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [email, first_name, last_name, contact_number, profile_picture, id]
    );
    
    return result.affectedRows > 0;
  }
  
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const [result] = await db.promise().query(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );
    
    return result.affectedRows > 0;
  }
  
  static async updateUserType(id, newUserType) {
    const [result] = await db.promise().query(
      'UPDATE users SET user_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newUserType, id]
    );
    
    return result.affectedRows > 0;
  }
  
  static async getCoachClubs(coachId) {
    const [rows] = await db.promise().query(
      'SELECT * FROM clubs WHERE coach_id = ?',
      [coachId]
    );
    return rows;
  }
  
  static async getAthleteClubs(athleteId) {
    const [rows] = await db.promise().query(
      `SELECT c.* FROM clubs c
       JOIN club_athletes ca ON c.id = ca.club_id
       WHERE ca.athlete_id = ? AND ca.status = 'active'`,
      [athleteId]
    );
    return rows;
  }
  
  static async calculateAgeGroup(dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    
    // Adjust age if birthday hasn't occurred yet this year
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Determine age group
    if (age < 8) return 'under_8';
    if (age < 12) return 'under_12';
    if (age < 14) return 'under_14';
    if (age < 16) return 'under_16';
    if (age < 18) return 'under_18';
    if (age < 21) return 'under_21';
    return 'senior';
  }
}

module.exports = User;
