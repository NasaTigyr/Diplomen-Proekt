const queries = require('./src/users/queries'); 
const clubQueries = require('./src/clubs/queries'); 
const eventQueries = require('./src/events/queries'); 
const categoryQueries = require('./src/categories/queries'); 

const bcrypt = require('bcrypt'); 

const jwt = require('jsonwebtoken'); 
const db = require('./db');
const path = require('path'); 

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
            user_type: user.user_type, // Mapping role to user_type
            contact_number: user.contact_number,
            profile_picture: user.profile_picture // Add this if it exists in your DB
        };
      console.log("The registration form(userForSession) is : ", JSON.stringify(userForSession)); 
        
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
            
            console.log('this is the path: ', user.profilePicturePath); 
            
            return res.status(200).json({ 
                message: "Logged in successfully", 
                token, 
                user: { 
                    id: user.id, 
                    email: user.email, 
                    name: user.name, 
                    role: user.role, 
                    family_name: user.family_name,
                    contact_number: user.contact_number,
                    profilePicturePath: user.profilePicturePath
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
        console.log("the contact number: ",contact_number); 
        console.log("the profile picture name: ", profile_picture); 
        
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
        // In controller.js, register function
          let profilePicturePath = null;
          if (req.file) {
              // Change this path to be consistent
              profilePicturePath = '/uploads/' + req.file.filename;
              console.log('Profile picture saved at:', profilePicturePath);
          }
        // Insert user into database using your specific query
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
        console.log("Full session:", req.session);
        
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
// This is the updated updateProfile function for controller.js

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
                    const oldPicturePath = path.join(__dirname, 'public', req.session.user.profile_picture);
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
async function createClub(req, res) {
    try {
        // Ensure user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'You must be logged in to create a club' });
        }
        
        const userId = req.session.user.id;
        const { 
            name, 
            description, 
            address, 
            phone, 
            email, 
            website, 
            established_date,
            federation_affiliation,
            other_federation,
            registration_code
        } = req.body;
        
        // Handle club logo if uploaded
        let logoPath = null;
        if (req.files && req.files.logo) {
            logoPath = '/uploads/' + req.files.logo[0].filename;
        }
        
        const currentDate = new Date();
      console.log('the query is this: ' + clubQueries.addClub); 
        // Insert club into database
        const result = await db.query(clubQueries.addClub,[name,description,logoPath,userId, address,currentDate, currentDate, registration_code,
                  phone,
                  email,
                  website,
                  established_date || null,
                  federation_affiliation === 'other' ? other_federation : federation_affiliation,
                  req.files && req.files.certification ? '/uploads/' + req.files.certification[0].filename : null,
                  req.files && req.files.coach_certification ? '/uploads/' + req.files.coach_certification[0].filename : null,
                  'pending' // status
              ]
          );
        
        const clubId = result[0].insertId;
        
        // Update user type to coach
        await db.query('UPDATE users SET user_type = ? WHERE id = ?', ['coach', userId]);
        
        // Update session user_type
        req.session.user.user_type = 'coach';
        
        return res.status(200).json({ 
            message: 'Club created successfully! You are now a coach.',
            clubId: clubId
        });
    } catch (error) {
        console.error('Club creation error:', error);
        return res.status(500).json({ message: 'An error occurred while creating the club' });
    }
}

async function createEvent(req, res) {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).json({ message: 'You must be logged in to create an event' });
    }
    
    console.log('User is authenticated');
    console.log('Account type:', req.session.user.user_type);
    
    // Check if user is a coach
    if (req.session.user.user_type !== 'coach') {
      return res.status(401).json({ message: 'You must be a coach to be able to create an event' });
    }
    
    console.log('User has coach privileges');
    
    // Extract event data from request body
    const {
      name,
      description,
      address,
      event_type,
      start_date,
      end_date,
      registration_start,
      registration_end,
      categories
    } = req.body;
    
    console.log('Form data received:', req.body);
    
    // Process file uploads
    let timetable_file = null;
    let banner_image = null;
    
    if (req.files) {
      // Handle timetable file
      if (req.files.timetable_file && req.files.timetable_file.length > 0) {
        timetable_file = '/uploads/' + req.files.timetable_file[0].filename;
        console.log('Timetable file saved at:', timetable_file);
      }
      
      // Handle banner image file
      if (req.files.banner_image_file && req.files.banner_image_file.length > 0) {
        banner_image = '/uploads/' + req.files.banner_image_file[0].filename;
        console.log('Banner image saved at:', banner_image);
      }
    }
    
    const creatorId = req.session.user.id;
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Create the event
    console.log('Creating event with name:', name);
    
    const result = await db.query(eventQueries.addEvent, [
      name, 
      description, 
      banner_image, 
      address, 
      start_date, 
      end_date, 
      registration_start, 
      registration_end, 
      event_type, 
      creatorId, 
      timetable_file, 
      currentDate, 
      currentDate
    ]);
    
    // Extract the event ID (depends on how your db.query returns results)
    const eventId = result[0].insertId;
    console.log('Event created with ID:', eventId);
    
    // Process categories if provided
    if (categories) {
      let parsedCategories = [];
      
      // Parse categories data if it's a string
      if (typeof categories === 'string') {
        try {
          parsedCategories = JSON.parse(categories);
          console.log('Parsed categories:', parsedCategories);
        } catch (e) {
          console.error('Error parsing categories JSON:', e);
          // Continue processing even if categories fail
          console.log('Continuing without categories due to parsing error');
        }
      } else if (Array.isArray(categories)) {
        parsedCategories = categories;
      } else {
        console.error('Categories is neither a string nor an array:', categories);
        // Continue processing even if categories data is invalid
        console.log('Continuing without categories due to invalid format');
      }
      
      console.log('Processing', parsedCategories.length, 'categories');
      
      // Create each category
      for (const category of parsedCategories) {
        try {
          console.log('Creating category:', category.name);
          
          // Store additional category details in description if they're not in the database schema
          let enhancedDescription = category.description || '';
          
          // Collect additional fields that aren't in the database schema
          const additionalFields = [];
          
          if (category.weight_class) {
            additionalFields.push(`Weight Class: ${category.weight_class}`);
          }
          
          if (category.rules) {
            additionalFields.push(`Special Rules: ${category.rules}`);
          }
          
          if (category.fee) {
            additionalFields.push(`Registration Fee: $${parseFloat(category.fee).toFixed(2)}`);
          }
          
          if (category.status && category.status !== 'active') {
            additionalFields.push(`Status: ${category.status}`);
          }
          
          // Append additional fields to description if they exist
          if (additionalFields.length > 0) {
            enhancedDescription += (enhancedDescription ? '\n\n' : '') + 
              additionalFields.join('\n\n');
          }
          
          // Check the available query to ensure we're using it correctly
          console.log('Using addCategory query:', eventQueries.addCategory);
          
          // Execute query to add category
          await db.query(categoryQueries.addCategory, [
            eventId,
            category.name,
            category.age_group || 'senior', // Default to senior if not specified
            category.gender || 'mixed',      // Default to mixed if not specified
            enhancedDescription,
            category.max_participants || null,
            null, // draw_file_path is null initially
            currentDate,
            currentDate
          ]);
          
          console.log(`Category "${category.name}" created successfully`);
        } catch (categoryError) {
          // Log error but continue with next category
          console.error(`Error creating category "${category.name}":`, categoryError);
        }
      }
    }
    
    // Return success response
    return res.status(200).json({ 
      message: 'Event created successfully', 
      id: eventId 
    });
    
  } catch (error) {
    console.error('Event creation error:', error);
    return res.status(500).json({ 
      message: 'An error occurred while creating the event', 
      error: error.message 
    });
  }
}

async function getEvents() {
  try {
    const [rows] = await db.query(eventQueries.getEvents);
    
    // Transform the database fields to match frontend expectations
    return rows.map(event => ({
      id: event.id,
      title: event.name,
      description: event.description,
      event_date: event.start_date,
      location: event.address,
      banner_url: event.banner_image,
      registration_open_date: event.registration_start,
      registration_close_date: event.registration_end,
      sport_type: event.sport_type,
      creator_id: event.creator_id,
      organizer_id: event.organizer_id,
      status: event.status || 'active',
      created_at: event.created_at
    }));
  } catch (error) {
    console.error('Error in getEvents:', error);
    throw error;
  }
}

async function getEventDetailsPage(req, res) {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).render('error', { 
        message: 'Invalid event ID', 
        error: { status: 400 },
        user: req.session.user 
      });
    }
    
    // Fetch the event
    const event = await getEventById(eventId);
    
    if (!event) {
      return res.status(404).render('error', { 
        message: 'Event not found', 
        error: { status: 404 },
        user: req.session.user 
      });
    }
    
    // Fetch categories if needed
    // const [categories] = await db.query('SELECT * FROM categories WHERE event_id = ?', [eventId]);
    
    // Fetch timetable if needed
    // const [timetable] = await db.query('SELECT * FROM timetable_entries WHERE event_id = ?', [eventId]);
    
    // Fetch user registrations if user is logged in
    let userRegistrations = [];
    if (req.session.user) {
      const [registrations] = await db.query(
        'SELECT r.*, c.event_id FROM individual_registrations r JOIN categories c ON r.category_id = c.id WHERE r.user_id = ? AND c.event_id = ?',
        [req.session.user.id, eventId]
      );
      userRegistrations = registrations;
    }
    
    // Render the page with all data needed
    res.render('eventDetails', {
      eventId,
      event,
      // categories,
      // timetable,
      // userRegistrations,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error loading event details:', error);
    res.status(500).render('error', { 
      message: 'Internal server error', 
      error: { status: 500 },
      user: req.session.user 
    });
  }
}

async function registerForCategory(req, res) {
  try {
    const { categoryId } = req.body;
    const userId = req.session.user.id;
    
    // First, get the category details to check max participants
    const [categoryData] = await db.query(
      'SELECT c.*, event_id FROM categories c WHERE id = ?',
      [categoryId]
    );
    
    if (!categoryData || categoryData.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const category = categoryData[0];
    const eventId = category.event_id;
    
    // Check if category has max_participants defined
    if (category.max_participants) {
      // Get current approved participant count for this category
      const [participantCount] = await db.query(
        'SELECT COUNT(*) as count FROM individual_registrations WHERE category_id = ? AND status = "approved"',
        [categoryId]
      );
      
      // Check if category is already full
      if (participantCount[0].count >= category.max_participants) {
        return res.status(400).json({ error: 'This category is full, registration is closed' });
      }
    }
    // Check if already registered
    const [existingReg] = await db.query(
      'SELECT * FROM individual_registrations WHERE category_id = ? AND athlete_id = ?',
      [categoryId, userId]
    );
    
    if (existingReg.length > 0) {
      return res.status(400).json({ error: 'Already registered for this category' });
    }
    
    // Create registration with event_id
    const [result] = await db.query(
      'INSERT INTO individual_registrations (event_id, category_id, athlete_id, status, registration_date) VALUES (?, ?, ?, ?, ?)',
      [eventId, categoryId, userId, 'pending', new Date()]
    );
    
    // Get the new registration
    const [newReg] = await db.query(
      'SELECT * FROM individual_registrations WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newReg[0]);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
}

async function cancelRegistration(req, res) {
  try {
    const { registrationId } = req.body;
    
    // Check if registration exists and belongs to user
    const [regCheck] = await db.query(
      'SELECT * FROM individual_registrations WHERE id = ? AND athlete_id = ?',
      [registrationId, req.session.user.id]
    );
    
    if (regCheck.length === 0) {
      return res.status(404).json({ error: 'Registration not found or unauthorized' });
    }
    
    // Delete registration
    await db.query('DELETE FROM individual_registrations WHERE id = ?', [registrationId]);
    
    res.json({ success: true, message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(500).json({ error: error.message });
  }
}
async function getEventById(eventId) {
  try {
    console.log("Fetching event with ID:", eventId);
    // Validate eventId
    if (isNaN(parseInt(eventId))) {
      throw new Error("Invalid event ID");
    }
    // Fetch event from database
    const [rows] = await db.query(
      "SELECT * FROM events WHERE id = ?",
      [eventId]
    );
    console.log("The event i have here: ", rows);
    if (rows.length === 0) {
      return null; // No event found
    }
    return rows[0]; // Return event details
  } catch (error) {
    console.error("Error in getEventById:", error);
    throw error;
  }
}

// New functions for event details page
async function getCategoriesByEventId(eventId) {
  try {
    // Validate eventId
    if (isNaN(parseInt(eventId))) {
      throw new Error("Invalid event ID");
    }
    
    // Fetch categories from database
    const [rows] = await db.query(
      "SELECT * FROM categories WHERE event_id = ?",
      [eventId]
    );
    
    return rows; // Return all categories
  } catch (error) {
    console.error("Error in getCategoriesByEventId:", error);
    throw error;
  }
}

async function getTimetableByEventId(eventId) {
  try {
    // Validate eventId
    if (isNaN(parseInt(eventId))) {
      throw new Error("Invalid event ID");
    }
    
    // Fetch timetable file from events table
    const [rows] = await db.query(
      "SELECT timetable_file FROM events WHERE id = ?", 
      [eventId]
    );
    
    // Return the timetable file path if it exists
    return rows && rows.length > 0 ? rows : [];
  } catch (error) {
    console.error("Error in getTimetableByEventId:", error);
    throw error;
  }
}
async function getUserRegistrations(userId) {
  try {
    // Validate userId
    if (isNaN(parseInt(userId))) {
      throw new Error("Invalid user ID");
    }
    
    // Fetch user registrations

    const [rows] = await db.query(
      "SELECT r.*, c.event_id FROM individual_registrations r JOIN categories c ON r.category_id = c.id WHERE r.athlete_id = ?",
      [userId] // Make sure userId actually refers to the athlete's ID
    );
    
    return rows; // Return all registrations
  } catch (error) {
    console.error("Error in getUserRegistrations:", error);
    throw error;
  }
}

async function registerUserForCategory(userId, categoryId) {
  try {
    // Validate inputs
    if (isNaN(parseInt(userId)) || isNaN(parseInt(categoryId))) {
      throw new Error("Invalid user ID or category ID");
    }
    
    // Get user details
    const [userData] = await db.query(
      "SELECT id, gender, date_of_birth FROM users WHERE id = ?",
      [userId]
    );
    
    if (!userData || userData.length === 0) {
      throw new Error("User not found");
    }
    
    const user = userData[0];
    
    // Calculate user's age
    const birthDate = new Date(user.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Get category details
    const [categoryData] = await db.query(
      "SELECT * FROM categories WHERE id = ?",
      [categoryId]
    );
    
    if (!categoryData || categoryData.length === 0) {
      throw new Error("Category not found");
    }
    
    const category = categoryData[0];
    
    // Gender validation
    if (category.gender !== 'mixed' && category.gender !== user.gender) {
      throw new Error(`This category is only for ${category.gender} participants`);
    }
    
    // Age group validation logic
    const ageGroupRestrictions = {
      'under_8': { minAge: 0, maxAge: 7 },
      'under_12': { minAge: 8, maxAge: 11 },
      'under_14': { minAge: 12, maxAge: 13 },
      'under_16': { minAge: 14, maxAge: 15 }, // Cadet
      'under_18': { minAge: 16, maxAge: 17 }, // Junior
      'under_21': { minAge: 18, maxAge: 20 },
      'senior': { minAge: 21, maxAge: 100 }
    };
    
    // Check if the age falls exactly within the category
    const restriction = ageGroupRestrictions[category.age_group];
    if (!restriction || age < restriction.minAge || age > restriction.maxAge) {
      throw new Error(`You are not eligible for the ${category.age_group} age group`);
    }
    
    // Get category details to check max participants
    const [eventData] = await db.query(
      "SELECT * FROM events WHERE id = ?",
      [category.event_id]
    );
    
    if (!eventData || eventData.length === 0) {
      throw new Error("Event not found");
    }
    
    const event = eventData[0];
    
    // Check if category has max_participants defined
    if (category.max_participants) {
      // Get current approved participant count for this category
      const [participantCount] = await db.query(
        "SELECT COUNT(*) as count FROM individual_registrations WHERE category_id = ? AND status = 'approved'",
        [categoryId]
      );
      
      // Check if category is already full
      if (participantCount[0].count >= category.max_participants) {
        throw new Error("This category is full. Registration is closed until space becomes available.");
      }
    }
    
    // Check if already registered
    const [existingReg] = await db.query(
      "SELECT * FROM individual_registrations WHERE athlete_id = ? AND category_id = ?",
      [userId, categoryId]
    );
    
    if (existingReg.length > 0) {
      throw new Error("Already registered for this category");
    }
    
    // Create registration record
    const currentDate = new Date();
    const [result] = await db.query(
      "INSERT INTO individual_registrations (event_id, athlete_id, category_id, status, registration_date) VALUES (?, ?, ?, ?, ?)",
      [category.event_id, userId, categoryId, "pending", currentDate]
    );
    
    // Get the newly created registration
    const [newReg] = await db.query(
      "SELECT * FROM individual_registrations WHERE id = ?",
      [result.insertId]
    );
    
    return newReg[0]; // Return the new registration
  } catch (error) {
    console.error("Error in registerUserForCategory:", error);
    throw error;
  }
}

async function getRegistrationById(registrationId) {
  try {
    // Validate registrationId
    if (isNaN(parseInt(registrationId))) {
      throw new Error("Invalid registration ID");
    }
    
    // Fetch registration
    const [rows] = await db.query(
      "SELECT * FROM individual_registrations WHERE id = ?",
      [registrationId]
    );
    
    if (rows.length === 0) {
      return null; // No registration found
    }
    
    return rows[0]; // Return registration details
  } catch (error) {
    console.error("Error in getRegistrationById:", error);
    throw error;
  }
}
// You can add this to your controller.js for automatically checking and handling past events
async function cleanupPastEvents() {
  try {
    const currentDate = new Date();
    
    // Find all events that have ended
    const [pastEvents] = await db.query(
      "SELECT id FROM events WHERE end_date < ?", 
      [currentDate]
    );
    
    if (pastEvents.length > 0) {
      console.log(`Found ${pastEvents.length} past events to clean up`);
      
      // Delete or archive the events as needed
      // await db.query("DELETE FROM events WHERE id IN (?)", 
      //   [pastEvents.map(e => e.id)]
      // );
      
      // Or mark them as archived instead of deleting
      await db.query(
        "UPDATE events SET status = 'archived' WHERE id IN (?)", 
        [pastEvents.map(e => e.id)]
      );
      
      console.log(`Archived ${pastEvents.length} past events`);
    }
  } catch (error) {
    console.error("Error cleaning up past events:", error);
  }
}
// Add these functions to your controller.js file
async function getEventRegistrations(eventId, userId) {
  try {
    // Verify user is the event creator
    const event = await getEventById(eventId);
    if (!event || event.creator_id != userId) {
      throw new Error('Not authorized to view these registrations');
    }
    
    // Get all registrations for the event with user details
    const [registrations] = await db.query(`
      SELECT 
        r.id, 
        r.event_id,
        r.category_id,
        r.athlete_id,
        r.status, 
        r.registration_date,
        c.name as category_name, 
        c.age_group,
        c.gender,
        u.first_name, 
        u.last_name, 
        u.email 
      FROM individual_registrations r
      JOIN categories c ON r.category_id = c.id
      JOIN users u ON r.athlete_id = u.id
      WHERE r.event_id = ?
      ORDER BY 
        c.name ASC,
        FIELD(r.status, 'approved', 'pending', 'rejected'),
        r.registration_date ASC
    `, [eventId]);
    
    return registrations;
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }
}

async function updateRegistrationStatus(registrationId, status, userId) {
  try {
    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new Error('Invalid status value');
    }
    
    // Get registration details first to check permissions
    const [registrationDetails] = await db.query(`
      SELECT r.*, e.creator_id, c.id as category_id, c.max_participants
      FROM individual_registrations r
      JOIN events e ON r.event_id = e.id
      JOIN categories c ON r.category_id = c.id
      WHERE r.id = ?
    `, [registrationId]);
    
    if (!registrationDetails || registrationDetails.length === 0) {
      throw new Error('Registration not found');
    }
    
    const registration = registrationDetails[0];
    
    // Verify user is the event creator
    if (registration.creator_id != userId) {
      throw new Error('Not authorized to update this registration');
    }
    
    // If changing to approved, check if the category is at max capacity
    if (status === 'approved' && registration.max_participants) {
      // Get current approved count
      const [approvedCountResult] = await db.query(`
        SELECT COUNT(*) as count 
        FROM individual_registrations 
        WHERE category_id = ? AND status = 'approved'
      `, [registration.category_id]);
      
      const currentApprovedCount = approvedCountResult[0].count;
      
      // Check if we're already at or over the max (shouldn't exceed but checking anyway)
      if (currentApprovedCount >= registration.max_participants) {
        throw new Error('Category is already at maximum capacity. Remove an approved registration first.');
      }
    }
    
    // Update the registration status
    await db.query('UPDATE individual_registrations SET status = ? WHERE id = ?', 
      [status, registrationId]
    );
    
    return { success: true, message: 'Registration status updated' };
  } catch (error) {
    console.error('Error updating registration status:', error);
    throw error;
  }
}

async function updateEvent(eventId, userId, eventData, files) {
  try {
    // Validate input
    if (!eventId || isNaN(parseInt(eventId))) {
      throw new Error('Invalid event ID');
    }
    
    // Check if user is the creator of the event
    const event = await getEventById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Convert IDs to integers for reliable comparison
    const eventCreatorId = parseInt(event.creator_id);
    const currentUserId = parseInt(userId);
    
    // Verify user is authorized to update this event
    if (eventCreatorId !== currentUserId) {
      throw new Error('Not authorized to update this event');
    }
    
    // Process updated fields
    const {
      name,
      description,
      address,
      event_type,
      start_date,
      end_date,
      registration_start,
      registration_end,
      current_banner_image,
      current_timetable_file
    } = eventData;
    
    // Validate required fields
    if (!name || !address || !start_date || !end_date || !registration_start || !registration_end) {
      throw new Error('Missing required fields');
    }
    
    // Handle file uploads
    let banner_image = current_banner_image;
    let timetable_file = current_timetable_file;
    
    if (files) {
      // Process banner image if uploaded
      if (files.banner_image_file && files.banner_image_file.length > 0) {
        banner_image = '/uploads/' + files.banner_image_file[0].filename;
        console.log('New banner image saved at:', banner_image);
        
        // Delete old banner image if it exists
        if (current_banner_image && current_banner_image !== banner_image) {
          try {
            const fs = require('fs');
            const path = require('path');
            const oldImagePath = path.join(__dirname, 'public', current_banner_image);
            
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
              console.log('Deleted old banner image:', current_banner_image);
            }
          } catch (e) {
            console.error('Error deleting old banner image:', e);
            // Continue with update even if delete fails
          }
        }
      }
      
      // Process timetable file if uploaded
      if (files.timetable_file && files.timetable_file.length > 0) {
        timetable_file = '/uploads/' + files.timetable_file[0].filename;
        console.log('New timetable file saved at:', timetable_file);
        
        // Delete old timetable file if it exists
        if (current_timetable_file && current_timetable_file !== timetable_file) {
          try {
            const fs = require('fs');
            const path = require('path');
            const oldFilePath = path.join(__dirname, 'public', current_timetable_file);
            
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
              console.log('Deleted old timetable file:', current_timetable_file);
            }
          } catch (e) {
            console.error('Error deleting old timetable file:', e);
            // Continue with update even if delete fails
          }
        }
      }
    }
    
    // Update the event in the database
    const query = `
      UPDATE events 
      SET 
        name = ?, 
        description = ?, 
        banner_image = ?, 
        address = ?, 
        start_date = ?, 
        end_date = ?, 
        registration_start = ?, 
        registration_end = ?, 
        event_type = ?,
        timetable_file = ?,
        updated_at = ?
      WHERE id = ?
    `;
    
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await db.query(query, [
      name,
      description,
      banner_image,
      address,
      start_date,
      end_date,
      registration_start,
      registration_end,
      event_type,
      timetable_file,
      currentDate,
      eventId
    ]);
    
    // Return success response
    return {
      success: true,
      message: 'Event updated successfully',
      id: eventId
    };
  } catch (error) {
    console.error('Error updating event:', error);

    throw new Error(error.message || 'Falied to update the event'); 
  }
}

async function getCategoryStats(eventId, status = null) {
  try {
    // Validate eventId
    if (isNaN(parseInt(eventId))) {
      throw new Error("Invalid event ID");
    }
    
    let query = `
      SELECT 
        c.id as category_id, 
        COUNT(ir.id) as participant_count 
      FROM 
        categories c 
      LEFT JOIN 
        individual_registrations ir ON c.id = ir.category_id 
      WHERE 
        c.event_id = ?`;
    
    const params = [eventId];
    
    // Add status filter if provided
    if (status) {
      query += ` AND ir.status = ?`;
      params.push(status);
    }
    
    // Add GROUP BY clause
    query += ` GROUP BY c.id`;
    
    // Execute query
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error("Error in getCategoryStats:", error);
    throw error;
  }
}

async function sendClubInvitation(userId, clubId, invitationData) {
    try {
        const { email, message } = invitationData;
        
        // Check if user is the club coach
        const [clubCheck] = await db.query(
            "SELECT * FROM clubs WHERE id = ? AND coach_id = ?",
            [clubId, userId]
        );
        
        if (!clubCheck || clubCheck.length === 0) {
            throw new Error('Not authorized to send invitations');
        }
        
        // Check if email already exists in users table
        const [existingUser] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        
        if (!existingUser || existingUser.length === 0) {
            throw new Error('No user found with this email');
        }
        
        const targetUserId = existingUser[0].id;
        
        // Check if user is already in the club
        const [existingMembership] = await db.query(
            "SELECT * FROM club_athletes WHERE club_id = ? AND athlete_id = ?",
            [clubId, targetUserId]
        );
        
        if (existingMembership.length > 0) {
            throw new Error('User is already a member of this club');
        }
        
        // Check for existing pending invitations
        const [existingInvitation] = await db.query(
            "SELECT * FROM club_invitations WHERE club_id = ? AND athlete_id = ? AND status = 'pending'",
            [clubId, targetUserId]
        );
        
        if (existingInvitation.length > 0) {
            throw new Error('An invitation is already pending for this user');
        }
        
        // Create invitation
        await db.query(
            "INSERT INTO club_invitations (club_id, athlete_id, message, status, sent_date) VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)",
            [clubId, targetUserId, message || null]
        );
        
        return { success: true, message: 'Invitation sent successfully' };
    } catch (error) {
        console.error('Error sending club invitation:', error);
        throw error;
    }
}
async function getClubAthletes(clubId) {
    try {
        const [athletes] = await db.query(`
            SELECT u.id, u.first_name, u.last_name, u.email, u.date_of_birth, 
                   u.gender, u.profile_picture, u.contact_number, 
                   ca.status, ca.join_date 
            FROM club_athletes ca 
            JOIN users u ON ca.athlete_id = u.id 
            WHERE ca.club_id = ? AND ca.status = 'active'
        `, [clubId]);
        
        return athletes;
    } catch (error) {
        console.error('Error fetching club athletes:', error);
        throw error;
    }
}

async function removeAthleteFromClub(clubId, athleteId, coachId) {
    try {
        // Verify the coach owns the club
        const [clubCheck] = await db.query(
            "SELECT * FROM clubs WHERE id = ? AND coach_id = ?",
            [clubId, coachId]
        );
        
        if (!clubCheck || clubCheck.length === 0) {
            throw new Error('Not authorized to remove athletes');
        }
        
        // Remove athlete from club
        await db.query(
            "DELETE FROM club_athletes WHERE club_id = ? AND athlete_id = ?",
            [clubId, athleteId]
        );
        
        return { success: true, message: 'Athlete removed from club successfully' };
    } catch (error) {
        console.error('Error removing athlete from club:', error);
        throw error;
    }
}

async function getClubJoinRequests(clubId) {
    try {
        const [requests] = await db.query(`
            SELECT u.id as athlete_id, u.first_name, u.last_name, u.email, 
                   u.date_of_birth, u.gender, 
                   ca.id as request_id, ca.join_date as request_date 
            FROM club_athletes ca 
            JOIN users u ON ca.athlete_id = u.id 
            WHERE ca.club_id = ? AND ca.status = 'pending'
        `, [clubId]);
        
        return requests;
    } catch (error) {
        console.error('Error fetching join requests:', error);
        throw error;
    }
}


async function processJoinRequest(clubId, requestId, coachId, action) {
    try {
        // Verify the coach owns the club
        const [clubCheck] = await db.query(
            "SELECT * FROM clubs WHERE id = ? AND coach_id = ?",
            [clubId, coachId]
        );
        
        if (!clubCheck || clubCheck.length === 0) {
            throw new Error('Not authorized to process join requests');
        }
        
        // Get the join request details
        const [requestDetails] = await db.query(
            "SELECT * FROM club_athletes WHERE id = ? AND club_id = ? AND status = 'pending'",
            [requestId, clubId]
        );
        
        if (!requestDetails || requestDetails.length === 0) {
            throw new Error('Join request not found');
        }
        
        const athleteId = requestDetails[0].athlete_id;
        
        // Start a transaction
        await db.query('START TRANSACTION');
        
        try {
            if (action === 'approve') {
                // Update request status to active
                await db.query(
                    "UPDATE club_athletes SET status = 'active' WHERE id = ? AND club_id = ?",
                    [requestId, clubId]
                );
                
                // Update user type to athlete (if not already a coach)
                await db.query(
                    "UPDATE users SET user_type = 'athlete' WHERE id = ? AND user_type != 'coach'",
                    [athleteId]
                );
            } else if (action === 'reject') {
                // Delete the join request
                await db.query(
                    "DELETE FROM club_athletes WHERE id = ? AND club_id = ?",
                    [requestId, clubId]
                );
            }
            
            // Commit the transaction
            await db.query('COMMIT');
            
            return { 
                success: true, 
                message: action === 'approve' 
                    ? 'Join request approved successfully' 
                    : 'Join request rejected successfully' 
            };
        } catch (updateError) {
            // Rollback the transaction if any error occurs
            await db.query('ROLLBACK');
            throw updateError;
        }
    } catch (error) {
        console.error('Error processing join request:', error);
        throw error;
    }
}

// Create new methods that use the unified method
async function approveJoinRequest(clubId, requestId, coachId) {
    return processJoinRequest(clubId, requestId, coachId, 'approve');
}

async function rejectJoinRequest(clubId, requestId, coachId) {
    return processJoinRequest(clubId, requestId, coachId, 'reject');
}

// Add these functions to your controller.js file

async function addCategory(req, res) {
  try {
    const eventId = req.params.eventId;
    const { name, description, age_group, gender, max_participants, weight_class, rules, fee, status } = req.body;
    
    // Validate required fields
    if (!name || !age_group || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate event exists and user is authorized
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (parseInt(event.creator_id) !== parseInt(req.session.user.id)) {
      return res.status(403).json({ error: 'Not authorized to modify this event' });
    }
    
    // Enhanced description to store additional fields
    let enhancedDescription = description || '';
    
    // Collect additional fields
    const additionalFields = [];
    
    if (weight_class) {
      additionalFields.push(`Weight Class: ${weight_class}`);
    }
    
    if (rules) {
      additionalFields.push(`Special Rules: ${rules}`);
    }
    
    if (fee) {
      additionalFields.push(`Registration Fee: $${parseFloat(fee).toFixed(2)}`);
    }
    
    if (status && status !== 'active') {
      additionalFields.push(`Status: ${status}`);
    }
    
    // Append additional fields to description
    if (additionalFields.length > 0) {
      enhancedDescription += (enhancedDescription ? '\n\n' : '') + 
        additionalFields.join('\n\n');
    }
    
    // Current timestamp
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Add category to database
    const [result] = await db.query(
      'INSERT INTO categories (event_id, name, age_group, gender, description, max_participants, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        eventId,
        name,
        age_group,
        gender,
        enhancedDescription,
        max_participants || null,
        currentDate,
        currentDate
      ]
    );
    
    // Return success response with new category ID
    res.status(201).json({ 
      success: true,
      id: result.insertId,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
}

async function updateCategory(req, res) {
  try {
    const categoryId = req.params.categoryId;
    const { name, description, age_group, gender, max_participants, weight_class, rules, fee, status } = req.body;
    
    // Validate required fields
    if (!name || !age_group || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get the category to check authorization
    const [categoryResult] = await db.query(
      'SELECT c.*, e.creator_id FROM categories c JOIN events e ON c.event_id = e.id WHERE c.id = ?',
      [categoryId]
    );
    
    if (!categoryResult || categoryResult.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const category = categoryResult[0];
    
    // Check if user is authorized to update this category
    if (parseInt(category.creator_id) !== parseInt(req.session.user.id)) {
      return res.status(403).json({ error: 'Not authorized to modify this category' });
    }
    
    // Enhanced description to store additional fields
    let enhancedDescription = description || '';
    
    // Collect additional fields
    const additionalFields = [];
    
    if (weight_class) {
      additionalFields.push(`Weight Class: ${weight_class}`);
    }
    
    if (rules) {
      additionalFields.push(`Special Rules: ${rules}`);
    }
    
    if (fee) {
      additionalFields.push(`Registration Fee: $${parseFloat(fee).toFixed(2)}`);
    }
    
    if (status && status !== 'active') {
      additionalFields.push(`Status: ${status}`);
    }
    
    // Append additional fields to description
    if (additionalFields.length > 0) {
      enhancedDescription += (enhancedDescription ? '\n\n' : '') + 
        additionalFields.join('\n\n');
    }
    
    // Current timestamp
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Update category in database
    await db.query(
      'UPDATE categories SET name = ?, age_group = ?, gender = ?, description = ?, max_participants = ?, updated_at = ? WHERE id = ?',
      [
        name,
        age_group,
        gender,
        enhancedDescription,
        max_participants || null,
        currentDate,
        categoryId
      ]
    );
    
    // Return success response
    res.json({ 
      success: true,
      id: parseInt(categoryId),
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
}

async function deleteCategory(req, res) {
  try {
    const categoryId = req.params.categoryId;
    
    // Get the category to check authorization
    const [categoryResult] = await db.query(
      'SELECT c.*, e.creator_id FROM categories c JOIN events e ON c.event_id = e.id WHERE c.id = ?',
      [categoryId]
    );
    
    if (!categoryResult || categoryResult.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const category = categoryResult[0];
    
    // Check if user is authorized to delete this category
    if (parseInt(category.creator_id) !== parseInt(req.session.user.id)) {
      return res.status(403).json({ error: 'Not authorized to delete this category' });
    }
    
    // Delete the category
    await db.query('DELETE FROM categories WHERE id = ?', [categoryId]);
    
    // Return success response
    res.json({ 
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}


// Update and delete functions would follow a similar approach

const controller = {
    login,
    register,
    updateProfile,
    changePassword,
    createClub,
    createEvent,
    getEvents,
    getEventById,
    getEventDetailsPage,
    cancelRegistration,
    registerForCategory,
    getCategoriesByEventId,
    getTimetableByEventId,
    getUserRegistrations,
    cleanupPastEvents,
    getRegistrationById,
    registerUserForCategory,
    getEventRegistrations,
    updateRegistrationStatus,
    updateEvent ,// Add this new function,
    getCategoryStats,
    sendClubInvitation,
    getClubAthletes,
    removeAthleteFromClub,
    getClubJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    addCategory,
    updateCategory,
    deleteCategory,
    approveJoinRequest,
    rejectJoinRequest
  

};

module.exports = controller; 
