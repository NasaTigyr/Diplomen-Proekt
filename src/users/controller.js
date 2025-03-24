// Import the queries and other dependencies
const queries = require('./queries.js');
const bcrypt = require('bcrypt');
const db = require('../../db'); 

// Modify your db.js file to use the promise version
// In db.js, change: const mysql = require('mysql2');
// To: const mysql = require('mysql2/promise');

// User creation
const addUser = async (req, res) => { 
  try { 
    const { email, password, first_name, last_name, date_of_birth, gender, user_type = 'regular', profile_picture, contact_number } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); 
    const profilePic = profile_picture ? profile_picture : null; 
    const contactNum = contact_number ? contact_number : null; 
    const [result] = await db.query(queries.addUser, [email, hashedPassword, first_name, last_name, date_of_birth, gender, user_type, profilePic, contactNum]);
    res.status(201).json({message: 'User added successfully'}); 
  } catch (error) { 
    console.error('Error adding user:', error);
    res.status(500).json({error: error.message});
  }
};

// Get all users
const getUsers = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getUsers); 
    console.log(rows); 
    res.json(rows); 
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({error: error.message }); 
  }
};

// Get users by role
const getUsersByRole = async (req, res) => { 
  try {
    const role = req.params.role || req.query.role;
    const [rows] = await db.query(queries.getUsersByRole, [role]); 
    console.log(rows); 
    res.json(rows); 
  } catch (error) {
    console.error('Error getting users by role:', error);
    res.status(500).json({error: error.message }); 
  }
};

// User login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await db.query(queries.login, [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Login successful
    res.status(200).json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type
      }
    });
    
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => { 
  try {
    const id = req.params.id;
    const [rows] = await db.query(queries.getUserById, [id]); 
    console.log(rows); 
    res.json(rows); 
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({error: error.message }); 
  }
};

// Get user by name
const getUserByName = async (req, res) => { 
  try {
    const name = req.params.name || req.query.name;
    const [rows] = await db.query(queries.getUserByName, [name]); 
    console.log(rows); 
    res.json(rows); 
  } catch (error) {
    console.error('Error getting user by name:', error);
    res.status(500).json({error: error.message }); 
  }
};

// Get user by email
const getUserByEmail = async (req, res) => { 
  try {
    const email = req.params.email || req.query.email;
    const [rows] = await db.query(queries.getUserByEmail, [email]); 
    console.log(rows); 
    res.json(rows); 
  } catch (error) {
    console.error('Error getting user by email:', error);
    res.status(500).json({error: error.message }); 
  }
};

// Delete user
const deleteUser = async (req, res) => { 
  try {
    const id = req.params.id;
    const [result] = await db.query(queries.deleteUser, [id]); 
    console.log(result); 
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' }); 
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({error: error.message }); 
  }
};

// Update user
const updateUser = async (req, res) => { 
  try {
    const id = req.params.id;
    const { email, first_name, last_name, date_of_birth, gender, user_type, profile_picture, contact_number } = req.body;
    
    const [result] = await db.query(
      queries.updateUser, 
      [email, first_name, last_name, date_of_birth, gender, user_type, profile_picture, contact_number, id]
    ); 
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully' }); 
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({error: error.message }); 
  }
};

// Update password
const updatePassword = async (req, res) => { 
  try {
    const id = req.params.id;
    const { password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(queries.updatePassword, [hashedPassword, id]); 
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Password updated successfully' }); 
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({error: error.message }); 
  }
};

// Get password (you might want to remove this for security reasons)
const getPassword = async (req, res) => { 
  try {
    const id = req.params.id;
    // Uncomment the getPassword query in queries.js before using this
    const [rows] = await db.query(queries.getPassword, [id]); 
    console.log(rows); 
    res.json(rows); 
  } catch (error) {
    console.error('Error getting password:', error);
    res.status(500).json({error: error.message }); 
  }
};

module.exports = {
  addUser, 
  getUsers,
  getUsersByRole,
  getUserById,
  getUserByName,
  getUserByEmail,
  updatePassword,
  getPassword,
  login,
  deleteUser,
  updateUser
};
