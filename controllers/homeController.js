// Import the model (if needed for business logic)
const path = require('path');  // Import path module

// Controller for the home page
exports.index = (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'index.html'));
};

// Controller for the register page
exports.register = (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'register.html'));
};

const userModel = require('../modules/userModel');

// Controller for the home page
exports.login = (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'login.html'));
};

// Controller for the register page
exports.events = (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'events.html'));
};

