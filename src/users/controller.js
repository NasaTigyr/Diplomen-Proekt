// src/users/controller.js
const queries = require('./queries');
const bcrypt = require('bcrypt');
const db = require('../../db');
const jwt = require('jsonwebtoken');

// User Authentication
async function login(req, res) {
    const { email, password, remember } = req.body;
    try {
        console.log("Received login request for email:", email);
        const userResult = await db.query(queries.getUserByEmail, [email]);
        const users = userResult[0]; 
        
        if (!users || users.length === 0) {
            console.error("No user found with the given email");
            
            // Check if this is a form submit or API request
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(401).json({ message: "Invalid credentials" });
            } else {
                return res.redirect('/login?error=' + encodeURIComponent('Invalid email or password'));
            }
        }
        
        const user = users[0];
        console.log("User found:", user);
        
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            // Check if this is a form submit or API request
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(401).json({ message: "Invalid credentials" });
            } else {
                return res.redirect('/login?error=' + encodeURIComponent('Invalid email or password'));
            }
        }
        
        // Create a clean user object for the session
        const userForSession = {
            id: user.id,
            email: user.email,
            first_name: user.first_name, 
            last_name: user.last_name,
            user_type: user.user_type,
            contact_number: user.contact_number,
            profile_picture: user.profile_picture
        };
        console.log("Session user:", JSON.stringify(userForSession)); 
        
        // Set the session
        req.session.user = userForSession;
        
        // Handle "remember me" if it exists
        if (remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }
        
        // For API requests, still return a JWT
        if (req.xhr || req.path.startsWith('/api/')) {
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                "your_jwt_secret", 
                { expiresIn: "3h" }
            );
            
            return res.status(200).json({ 
                message: "Logged in successfully", 
                token, 
                user: { 
                    id: user.id, 
                    email: user.email, 
                    first_name: user.first_name,
                    last_name: user.last_name,
                    user_type: user.user_type,
                    contact_number: user.contact_number,
                    profile_picture: user.profile_picture
                } 
            });
        }
        
        // For form submissions, redirect to the home page
        return res.redirect('/');
        
    } catch (error) {
        console.error("Error during login:", error);
        
        // Check if this is a form submit or API request
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({ message: "Internal server error" });
        } else {
            return res.redirect('/login?error=' + encodeURIComponent('An error occurred during login'));
        }
    }
}

async function register(req, res) {
    try {
        const { 
            first_name, 
            last_name, 
            email, 
            date_of_birth, 
            gender, 
            profile_picture,
            contact_number, 
            password, 
            confirm_password 
        } = req.body;
        
        console.log("Registration attempt for:", email);
        
        // Validate inputs
        if (!first_name || !last_name || !email || !password) {
            console.log("Missing required fields");
            return res.redirect('/register?error=' + encodeURIComponent('All required fields must be filled'));
        }
        
        if (password !== confirm_password) {
            console.log("Passwords don't match");
            return res.redirect('/register?error=' + encodeURIComponent('Passwords do not match'));
        }
        
        // Check if user already exists
        const existingUserResult = await db.query(queries.getUserByEmail, [email]);
        const existingUsers = existingUserResult[0];
        
        if (existingUsers && existingUsers.length > 0) {
            console.log("User already exists");
            return res.redirect('/register?error=' + encodeURIComponent('User with this email already exists'));
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Handle profile picture if uploaded
        let profilePicturePath = null;
        if (req.file) {
            profilePicturePath = '/uploads/' + req.file.filename;
            console.log('Profile picture saved at:', profilePicturePath);
        }
        
        // Insert user into database
        const result = await db.query(
            queries.addUser, 
            [
                email,               // 1st parameter
                hashedPassword,      // 2nd parameter
                first_name,          // 3rd parameter
                last_name,           // 4th parameter
                date_of_birth || null, // 5th parameter
                gender || null,      // 6th parameter
                'regular',           // 7th parameter (user_type)
                profilePicturePath,  // 8th parameter
                contact_number || null // 9th parameter
            ]
        );
        
        console.log("User created in database, result:", result);
        
        // Get inserted user ID
        const userId = result[0].insertId;
        
        // Create session user
        const sessionUser = {
            id: userId,
            email: email,
            first_name: first_name,
            last_name: last_name,
            user_type: 'regular',
            profile_picture: profilePicturePath,
            contact_number: contact_number 
        };
        
        // Set the session
        req.session.user = sessionUser;
        
        console.log("Session user set:", req.session.user);
        
        // Make sure session is saved before redirect
        req.session.save((err) => {
            if (err) {
                console.error("Error saving session:", err);
            }
            // Redirect with success message
            return res.redirect('/?success=' + encodeURIComponent('Registration successful! Welcome to Martial Arts Competitions.'));
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.redirect('/register?error=' + encodeURIComponent('An error occurred during registration: ' + error.message));
    }
}

async function updateProfile(req, res) {
    try {
        // Ensure the user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'You must be logged in to update your profile' });
        }
        
        const userId = req.session.user.id;
        const { first_name, last_name, email, contact_number } = req.body;
        
        // Validate required fields
        if (!first_name || !last_name || !email) {
            return res.status(400).json({ message: 'Name and email are required fields' });
        }
        
        // Handle profile picture if uploaded
        let profilePicturePath = req.session.user.profile_picture;
        
        if (req.file) {
            profilePicturePath = '/uploads/' + req.file.filename;
            console.log('New profile picture saved at:', profilePicturePath);
            
            // Delete old profile picture if it exists
            if (req.session.user.profile_picture) {
                try {
                    const fs = require('fs');
                    const path = require('path');
                    const oldPicturePath = path.join(__dirname, '../../public', req.session.user.profile_picture);
                    if (fs.existsSync(oldPicturePath)) {
                        fs.unlinkSync(oldPicturePath);
                        console.log('Deleted old profile picture:', req.session.user.profile_picture);
                    }
                } catch (e) {
                    console.error('Error deleting old profile picture:', e);
                    // Continue with update even if delete fails
                }
            }
        }
        
        // Update the database
        await db.query(
            queries.updateUser,
            [first_name, last_name, email, contact_number, profilePicturePath, userId]
        );
        
        // Get updated user data
        const updatedUserResult = await db.query(queries.getUserById, [userId]);
        const updatedUser = updatedUserResult[0][0];
        
        // Update session with new user data
        req.session.user = {
            id: updatedUser.id,
            email: updatedUser.email,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            user_type: updatedUser.user_type,
            profile_picture: updatedUser.profile_picture,
            contact_number: updatedUser.contact_number,
            date_of_birth: updatedUser.date_of_birth,
            gender: updatedUser.gender
        };
        
        return res.status(200).json({ 
            message: 'Profile updated successfully',
            user: req.session.user
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({ message: 'An error occurred while updating your profile' });
    }
}

async function changePassword(req, res) {
    try {
        // Ensure user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'You must be logged in to change your password' });
        }
        
        const userId = req.session.user.id;
        const { current_password, new_password, confirm_password } = req.body;
        
        // Validate inputs
        if (new_password !== confirm_password) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }
        
        if (new_password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        
        // Get current user with password
        const userResult = await db.query(queries.getUserById, [userId]);
        const user = userResult[0][0];
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Verify current password
        const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        // Update password in database
        await db.query(queries.updatePassword, [hashedPassword, userId]);
        
        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        return res.status(500).json({ message: 'An error occurred while changing your password' });
    }
}

// Add this function to src/users/controller.js
async function deleteAccount(req, res) {
    try {
        // Ensure user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'You must be logged in to delete your account' });
        }
        
        const userId = req.session.user.id;
        const { password } = req.body;
        
        // Get current user with password hash
        const userResult = await db.query(queries.getUserById, [userId]);
        const user = userResult[0][0];
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        
        // Start a transaction to handle cascading deletes properly
        await db.query('START TRANSACTION');
        
        try {
            // Delete the user
            const [result] = await db.query(queries.deleteUser, [userId]);
            
            if (result.affectedRows === 0) {
                await db.query('ROLLBACK');
                return res.status(404).json({ message: 'Failed to delete user' });
            }
            
            // Commit the transaction
            await db.query('COMMIT');
            
            // Destroy the session
            req.session.destroy();
            
            return res.status(200).json({ message: 'Account deleted successfully' });
        } catch (error) {
            // Rollback the transaction in case of error
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Account deletion error:', error);
        return res.status(500).json({ message: 'An error occurred while deleting your account' });
    }
}

// Update the module.exports to include deleteAccount
module.exports = {
    login,
    register,
    updateProfile,
    changePassword,
    deleteAccount,  // Add this line
    // ... other exported functions
};
// Export all functions
module.exports = {
    login,
    register,
    updateProfile,
    changePassword,
    deleteAccount,
    // Include other functions from original users controller
    addUser: async (req, res) => {
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
    },
    getUsers: async (req, res) => { 
        try {
            const [rows] = await db.query(queries.getUsers); 
            res.json(rows); 
        } catch (error) {
            res.status(500).json({error: error.message }); 
        }
    },
    getUserById: async (req, res) => { 
        try {
            const id = req.params.id;
            const [rows] = await db.query(queries.getUserById, [id]); 
            res.json(rows); 
        } catch (error) {
            res.status(500).json({error: error.message }); 
        }
    },
    getUserByEmail: async (req, res) => { 
        try {
            const email = req.params.email || req.query.email;
            const [rows] = await db.query(queries.getUserByEmail, [email]); 
            res.json(rows); 
        } catch (error) {
            res.status(500).json({error: error.message }); 
        }
    },
    deleteUser: async (req, res) => { 
        try {
            const id = req.params.id;
            const [result] = await db.query(queries.deleteUser, [id]); 
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            res.json({ message: 'User deleted successfully' }); 
        } catch (error) {
            res.status(500).json({error: error.message }); 
        }
    }
};
