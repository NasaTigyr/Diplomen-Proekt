// controllers/authController.js
const User = require('../modules/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const db = require('../db'); 

exports.register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      confirm_password,
      first_name, 
      last_name, 
      date_of_birth,
      gender,
      user_type = 'regular',
      contact_number,
      profile_picture,
      // Club info for coaches
      club_name,
      club_description,
      club_logo,
      club_address
    } = req.body;
    
    // Validate required input
    if (!email || !password || !first_name || !last_name || !date_of_birth || !gender) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }
    
    // Check if passwords match
    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create user
    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      date_of_birth,
      gender,
      user_type,
      contact_number,
      profile_picture
    });
    
    // If registering as a coach and club info is provided, create a club
    if (user_type === 'coach' && club_name && club_address) {
      // Import and use Club model
      const Club = require('../modules/Club');
      
      await Club.create({
        name: club_name,
        description: club_description || null,
        logo: club_logo || null,
        coach_id: user.id,
        address: club_address
      });
    }
    
    // Set session
    req.session.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      user_type: user.user_type,
      gender: user.gender,
      date_of_birth: user.date_of_birth
    };
    
    // For API requests
    if (req.path.startsWith('/api/')) {
      return res.status(201).json({ 
        message: 'Registration successful', 
        user: req.session.user 
      });
    }
    
    // For form submissions, redirect with success message
    return res.redirect('/?success=' + encodeURIComponent('Registration successful'));
  } catch (error) {
    console.error('Registration error:', error);
    
    // For API requests
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({ message: 'Registration failed: ' + error.message });
    }
    
    // For form submissions
    return res.redirect('/register?error=' + encodeURIComponent('Registration failed: ' + error.message));
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, remember } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      // For API requests
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // For form submissions
      return res.redirect('/login?error=' + encodeURIComponent('Invalid email or password'));
    }
    
    // Verify password
    const isMatch = await User.verifyPassword(user, password);
    if (!isMatch) {
      // For API requests
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // For form submissions
      return res.redirect('/login?error=' + encodeURIComponent('Invalid email or password'));
    }
    
    // Set session cookie expiration if "remember me" is checked
    if (remember) {
      // Set to 30 days
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    }
    
    // Set session
    req.session.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      user_type: user.user_type,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      profile_picture: user.profile_picture
    };
    
    // For API requests
    if (req.path.startsWith('/api/')) {
      return res.status(200).json({ 
        message: 'Login successful', 
        user: req.session.user 
      });
    }
    
    // For form submissions
    return res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    
    // For API requests
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({ message: 'Login failed: ' + error.message });
    }
    
    // For form submissions
    return res.redirect('/login?error=' + encodeURIComponent('Login failed: ' + error.message));
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

exports.updateProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { 
      email, 
      first_name, 
      last_name, 
      contact_number,
      profile_picture
    } = req.body;
    
    // Validate required fields
    if (!email || !first_name || !last_name) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }
    
    // If email is changing, check if new email is already in use
    if (email !== req.session.user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== req.session.user.id) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }
    
    // Update user
    const updated = await User.update(req.session.user.id, {
      email,
      first_name,
      last_name,
      contact_number,
      profile_picture
    });
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update profile' });
    }
    
    // Update session data
    req.session.user = {
      ...req.session.user,
      email,
      first_name,
      last_name,
      contact_number,
      profile_picture
    };
    
    // For API requests
    if (req.path.startsWith('/api/')) {
      return res.status(200).json({ 
        message: 'Profile updated successfully', 
        user: req.session.user 
      });
    }
    
    // For form submissions
    return res.redirect('/profile?success=' + encodeURIComponent('Profile updated successfully'));
  } catch (error) {
    console.error('Update profile error:', error);
    
    // For API requests
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({ message: 'Update failed: ' + error.message });
    }
    
    // For form submissions
    return res.redirect('/profile?error=' + encodeURIComponent('Update failed: ' + error.message));
  }
};

exports.changePassword = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { current_password, new_password, confirm_password } = req.body;
    
    // Validate input
    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (new_password !== confirm_password) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }
    
    // Get user with password hash
    const user = await User.findByEmail(req.session.user.email);
    
    // Verify current password
    const isMatch = await User.verifyPassword(user, current_password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    const updated = await User.updatePassword(req.session.user.id, new_password);
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update password' });
    }
    
    // For API requests
    if (req.path.startsWith('/api/')) {
      return res.status(200).json({ message: 'Password updated successfully' });
    }
    
    // For form submissions
    return res.redirect('/profile?success=' + encodeURIComponent('Password updated successfully'));
  } catch (error) {
    console.error('Change password error:', error);
    
    // For API requests
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({ message: 'Password update failed: ' + error.message });
    }
    
    // For form submissions
    return res.redirect('/profile?error=' + encodeURIComponent('Password update failed: ' + error.message));
  }
};

exports.becomeCoach = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Only regular users or athletes can become coaches
    if (req.session.user.user_type === 'coach') {
      return res.status(400).json({ message: 'You are already a coach' });
    }
    
    // Update user type to coach
    const updated = await User.updateUserType(req.session.user.id, 'coach');
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update user type' });
    }
    
    // Update session
    req.session.user.user_type = 'coach';
    
    // For API requests
    if (req.path.startsWith('/api/')) {
      return res.status(200).json({ 
        message: 'User type updated to coach successfully', 
        user: req.session.user 
      });
    }
    
    // For form submissions
    return res.redirect('/myClub?success=' + encodeURIComponent('You are now a coach! Create your club.'));
  } catch (error) {
    console.error('Become coach error:', error);
    
    // For API requests
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({ message: 'Update failed: ' + error.message });
    }
    
    // For form submissions
    return res.redirect('/becomeCoach?error=' + encodeURIComponent('Update failed: ' + error.message));
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { first_name, last_name, email, contact_number } = req.body;
    
    // Validate input
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }
    
    // Check if email already exists (if changed)
    if (email !== req.session.user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
    }
    
    // Build update data
    const userData = {
      first_name,
      last_name,
      email,
      contact_number: contact_number || null
    };
    
    // If a file was uploaded, add the path to the update data
    if (req.file) {
      userData.profile_picture = `/uploads/profile_pictures/${req.file.filename}`;
      
      // Optionally delete old profile picture if it exists
      if (req.session.user.profile_picture) {
        const oldPicturePath = path.join(__dirname, '..', 'public', req.session.user.profile_picture);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }
    }
    
    // Update the user in the database
    const updated = await User.update(userId, userData);
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update profile' });
    }
    
    // Get the updated user data
    const user = await User.findById(userId);
    
    // Update session data
    req.session.user = {
      ...req.session.user,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      contact_number: userData.contact_number
    };
    
    // Add profile picture to session if it was updated
    if (userData.profile_picture) {
      req.session.user.profile_picture = userData.profile_picture;
    }
    
    res.status(200).json({ 
      message: 'Profile updated successfully', 
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        contact_number: user.contact_number,
        profile_picture: user.profile_picture,
        user_type: user.user_type
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile: ' + error.message });
  }
};
