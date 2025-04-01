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
        let profilePicturePath = null;
        if (req.file) {
            profilePicturePath = '/uploads/profile_picture/' + req.file.filename;
          console.log('this is the photo path', profilePicturePath); 
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
async function updateProfile(req, res) {
    try {
        // Ensure the user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'You must be logged in to update your profile' });
        }
        
        const userId = req.session.user.id;
        const { first_name, last_name, email, contact_number } = req.body;
        
        // Handle profile picture if uploaded
        let profilePicturePath = req.session.user.profile_picture;
        if (req.file) {
            profilePicturePath = '/uploads/' + req.file.filename;
            
            // Delete old profile picture if it exists
            if (req.session.user.profile_picture) {
                const oldPicturePath = path.join(__dirname, 'public', req.session.user.profile_picture);
                if (fs.existsSync(oldPicturePath)) {
                    fs.unlinkSync(oldPicturePath);
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
            first_name: updatedUser.name,
            last_name: updatedUser.family_name,
            user_type: updatedUser.role,
            profile_picture: updatedUser.profile_picture
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
        'SELECT r.*, c.event_id FROM registrations r JOIN categories c ON r.category_id = c.id WHERE r.user_id = ? AND c.event_id = ?',
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
    
 const [existingReg] = await db.query(
  'SELECT * FROM individual_registrations WHERE category_id = ? AND athlete_id = ?',
  [categoryId, userId] // Replaced user_id with athlete_id
);   
    
    if (existingReg.length > 0) {
      return res.status(400).json({ error: 'Already registered for this category' });
    }
    
    // Create registration
    const [result] = await db.query(
      'INSERT INTO registrations (category_id, user_id, status, registration_date) VALUES (?, ?, ?, ?)',
      [categoryId, userId, 'pending', new Date()]
    );
    
    // Get the new registration
    const [newReg] = await db.query(
      'SELECT * FROM registrations WHERE id = ?',
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
    
    // Fetch timetable entries from database
//    const [rows] = await db.query(
//      "SELECT * FROM timetable_entries WHERE event_id = ?",
//      [eventId]
//    );
    
    const [rows] = await db.query(eventQueries.getTimetableFileFromEventId, [eventId]); 
      
    
    return rows; // Return all timetable entries
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
    
    // Check if already registered
    const [existingReg] = await db.query(
      "SELECT * FROM registrations WHERE athlete_id = ? AND category_id = ?",
      [userId, categoryId]
    );
    
    if (existingReg.length > 0) {
      throw new Error("Already registered for this category");
    }
    
    // Create registration record
    const currentDate = new Date();
    const [result] = await db.query(
      "INSERT INTO registrations (user_id, category_id, status, registration_date) VALUES (?, ?, ?, ?)",
      [userId, categoryId, "pending", currentDate]
    );
    
    // Get the newly created registration
    const [newReg] = await db.query(
      "SELECT * FROM registrations WHERE id = ?",
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
      "SELECT * FROM registrations WHERE id = ?",
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
    getUserRegistrations
};
module.exports = controller;
