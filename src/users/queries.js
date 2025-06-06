// src/users/queries.js
const getUsers = 'SELECT * FROM users';
const getUserByEmail = 'SELECT * FROM users WHERE email = ?'; 
const getUsersByRole = 'SELECT * FROM users WHERE role = ?';
const getUserById = 'SELECT * FROM users WHERE id = ?';
const getUserByName = 'SELECT * FROM users WHERE name = ?';
const getPassword = 'SELECT password_hash FROM users WHERE id = ?';

const login = 'SELECT id, email, password_hash, first_name, last_name, user_type FROM users WHERE email = ?';

const addUser = `INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth, gender, user_type, profile_picture, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const deleteUser = 'DELETE FROM users WHERE id = ?';

const updateUser = 'UPDATE users SET first_name = ?, last_name = ?, email = ?, contact_number = ?, profile_picture = ? WHERE id = ?';

const updatePassword = 'UPDATE users SET password_hash = ? WHERE id = ?';

module.exports = {
  getUsers,
  getUsersByRole, 
  getUserById, 
  getUserByName,
  getUserByEmail,
  addUser, 
  deleteUser,
  updateUser,
  updatePassword,
  getPassword,
  login
};
