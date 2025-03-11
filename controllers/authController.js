// controllers/authController.js
const User = require('../modules/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;
    
    // Validate input
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create user
    const user = await User.create({
      username,
      email,
      password,
      full_name
    });
    
    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name
    };
    
    // For API requests
    if (req.path.startsWith('/api/')) {
      return res.status(201).json({ message: 'Registration successful', user: req.session.user });
    }
    
    // For form submissions
    return res.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await User.verifyPassword(user, password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name
    };
    
    // For API requests
    if (req.path.startsWith('/api/')) {
      return res.status(200).json({ message: 'Login successful', user: req.session.user });
    }
    
    // For form submissions
    return res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  
  // For API requests
  if (req.path.startsWith('/api/')) {
    return res.status(200).json({ message: 'Logout successful' });
  }
  
  // For web routes
  return res.redirect('/');
};

exports.getCurrentUser = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  res.status(200).json(req.session.user);
};
