const getUsers = 'SELECT * FROM users';
const getUsersByRole = 'SELECT * FROM users WHERE role = ?';
const getUserById = 'SELECT * FROM users WHERE id = ?';
const getUserByName = 'SELECT * FROM users WHERE name = ?';
const getUserByEmail = 'SELECT * FROM users WHERE email = ?';
//const getPassword = ' SELECT password FROM users WHERE id = ?';

const addUser = `INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth, gender, user_type, profile_picture, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const deleteUser = 'DELETE FROM users WHERE id = ?';
const updateUser = 'Update users SET email = ?, first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, user_type = ?, profile_picture = ?, contact_number = ? WHERE id = ?';

const updatePassword = 'UPDATE users set password_hash = ? WHERE id = ?';


const queries = { 
  getUsers,
  getUsersByRole, 
  getUserById, 
  getUserByName,
  getUserByEmail,
  addUser, 
  deleteUser,
  updateUser,
  updatePassword,
  //getPassword
};

