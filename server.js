// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const controller = require('./controller.js');
const db = require('./db.js'); 

// Import routes
// Initialize express app
const app = express();
const PORT = 3000;

//middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'martial_arts_session_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Add this near the top of your main server file
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
const clubUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'certification', maxCount: 1 },
  { name: 'coach_certification', maxCount: 1 }
]);

// Session debug middleware (optional - remove in production)
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session User:', req.session.user ? req.session.user.email : 'Not logged in');
  next();
});

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login?error=' + encodeURIComponent('Please login to access this page'));
}

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const eventUpload = upload.fields([
  {name: 'timetable_file', maxCount: 1},
  {name: 'banner_image_file', maxCount: 1}
]); 

// Direct routes for form submissions
app.post('/login', controller.login); // Keep this as your form submits to /login
app.post('/register', upload.single('profile_picture'), controller.register); 
app.post('/clubs', clubUpload, controller.createClub); // Add the club creation route here
app.post('/profile', controller.updateProfile); 
app.post('/createEvent',eventUpload, controller.createEvent); 

// Add these routes to your app.js file
app.post('/register-category', isAuthenticated, controller.registerForCategory);
app.post('/cancel-registration', isAuthenticated, controller.cancelRegistration);

// View routes
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user || null });
});

app.get('/login', (req, res) => {
  // If user is already logged in, redirect to home
  if (req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
  // If user is already logged in, redirect to home
  if (req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { user: req.session.user });
});

app.get('/createEvent', isAuthenticated, (req, res) => { 
  res.render('createEvent', { user: req.session.user });
});


app.get('/createClub', isAuthenticated, (req, res) => {
  res.render('createClub', { user: req.session.user });
});

app.get('/events', async (req, res) => {
    try {
        const events = await controller.getEvents();  // Changed to getEvents (capital E)
        
        // Check if the request wants JSON (likely an AJAX request)
        // or HTML (direct browser navigation)
        if (req.xhr || req.headers.accept.indexOf('json') !== -1) {  // Changed indexof to indexOf
            // If it's an AJAX request or specifically requesting JSON, return JSON data
            return res.json(events);
        }
        
        // Otherwise render the page with the events data included
        res.render('events', { 
            user: req.session.user,
            userId: req.session.user ? req.session.user.id : null,  // Changed userid to userId
            initialEvents: JSON.stringify(events)  // Changed initialevents to initialEvents
        });
    } catch (error) {
        console.error('Error fetching events:', error);  // Changed error to Error
        
        // Similar handling for errors
        if (req.xhr || req.headers.accept.indexOf('json') !== -1) {  // Changed indexof to indexOf
            return res.status(500).json({ error: 'Failed to load events' });  // Changed failed to Failed
        }
        
      console.log('the userId is this: ', req.session.user.id); 
        res.render('events', { 
            user: req.session.user,
            userId: req.session.user ? req.session.user.id : null,  // Changed userid to userId
            initialEvents: '[]',  // Changed initialevents to initialEvents
            error: 'Failed to load events'  // Changed failed to Failed
        });

    }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// Main route for the event details page
app.get('/eventDetails/:id', async (req, res) => {
  try {
    console.log("1. Route handler started");
    const eventId = req.params.id;
    console.log("2. Event ID:", eventId);
    
   res.render('eventDetails', {
      eventId: parseInt(eventId),
      user: req.session.user || null
    });
    console.log("5. Render function called");
  } catch (error) {
    console.error("ERROR in event details route:", error);
    res.status(500).send("Error: " + error.message);
  }
});

// API endpoint for event data
app.get('/eventDetails/:id/data', async (req, res) => {
  try {
    const eventId = req.params.id;
    const eventData = await controller.getEventById(eventId);
    const event = Array.isArray(eventData) ? eventData[0] : eventData;
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error("ERROR fetching event data:", error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for categories
app.get('/eventDetails/:id/categories', async (req, res) => {
  try {
    const eventId = req.params.id;
    const categories = await controller.getCategoriesByEventId(eventId);
    
    res.json(categories);
  } catch (error) {
    console.error("ERROR fetching categories:", error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for timetable
app.get('/eventDetails/:id/timetable', async (req, res) => {
  try {
    const eventId = req.params.id;
    console.log('the eventId is: ', eventId); 
    const timetable = await controller.getTimetableByEventId(eventId);
    
    if (!timetable || timetable.length === 0) {
      return res.status(404).json([]); // Return empty array with 404 status
    }
    
    res.json(timetable);
  } catch (error) {
    console.error("ERROR fetching timetable:", error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for user registrations (requires authentication)
app.get('/eventDetails/:id/registrations', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = req.session.user.id;
    const eventId = req.params.id;
    
    // Get all registrations for the user (not just for this event)
    // Frontend will filter for the specific event
    const registrations = await controller.getUserRegistrations(userId);
    
    res.json(registrations);
  } catch (error) {
    console.error("ERROR fetching user registrations:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for registering for a category
app.post('/register-category', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = req.session.user.id;
    const { categoryId } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required' });
    }
    
    // Register user for the category
    const registration = await controller.registerUserForCategory(userId, categoryId);
    
    res.json(registration);
  } catch (error) {
    console.error("ERROR registering for category:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for cancelling a registration
app.post('/cancel-registration', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = req.session.user.id;
    const { registrationId } = req.body;
    
    if (!registrationId) {
      return res.status(400).json({ error: 'Registration ID is required' });
    }
    
    // Verify this registration belongs to the user
    const registration = await controller.getRegistrationById(registrationId);
    if (!registration || registration.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this registration' });
    }
    
    // Cancel the registration
    const result = await controller.cancelRegistration(registrationId);
    
    res.json({ success: true, message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error("ERROR cancelling registration:", error);
    res.status(500).json({ error: error.message });
  }
});

//app.get('/manageClub', isAuthenticated, async (req, res) => {
//  try {
//    const userId = req.session.user.id;
//    
//    // Query to get the club associated with this user
//    const [clubs] = await db.query(
//        "SELECT * FROM clubs WHERE coach_id = ?",
//        [userId]
//    );
//    
//    const club = clubs && clubs.length > 0 ? clubs[0] : null;
//    
//    res.render('manageClub', { 
//      user: req.session.user,
//      initialClubData: JSON.stringify(club)
//    });
//  } catch (error) {
//    console.error('Error loading club data:', error);
//    res.render('manageClub', { 
//      user: req.session.user,
//      initialClubData: null
//    });
//  }
//});
app.get('/manageClub', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        // Query to get the club associated with this user
        const [clubs] = await db.query(
            "SELECT * FROM clubs WHERE coach_id = ?",
            [userId]
        );
        
        const club = clubs && clubs.length > 0 ? clubs[0] : null;
        
        // Initialize empty arrays
        let athletes = [];
        let joinRequests = [];
        
        // Get club statistics
        let statistics = { 
            athlete_count: 0, 
            event_count: 0, 
            competition_count: 0 
        };
        
        if (club) {
            // Get athlete count
            const [athleteResult] = await db.query(
                "SELECT COUNT(*) as count FROM club_athletes WHERE club_id = ? AND status = 'active'",
                [club.id]
            );
            statistics.athlete_count = athleteResult[0].count;
            
            // Get athletes
            const [athletesResult] = await db.query(`
                SELECT u.id, u.first_name, u.last_name, u.email, u.date_of_birth, 
                       u.gender, u.profile_picture, u.contact_number, 
                       ca.status, ca.join_date 
                FROM club_athletes ca 
                JOIN users u ON ca.athlete_id = u.id 
                WHERE ca.club_id = ? AND ca.status = 'active'
            `, [club.id]);
            athletes = athletesResult;
            
            // Get join requests
            const [requestsResult] = await db.query(`
                SELECT u.id as athlete_id, u.first_name, u.last_name, u.email, 
                       u.date_of_birth, u.gender, 
                       ca.id as request_id, ca.join_date as request_date 
                FROM club_athletes ca 
                JOIN users u ON ca.athlete_id = u.id 
                WHERE ca.club_id = ? AND ca.status = 'pending'
            `, [club.id]);
            joinRequests = requestsResult;
            
            // Get event count
            const [eventResult] = await db.query(
                "SELECT COUNT(*) as count FROM events WHERE creator_id = ?",
                [userId]
            );
            statistics.event_count = eventResult[0].count;
        }
        
        // Check for last session message
        const lastMessage = req.session.lastMessage;
        delete req.session.lastMessage;
        
        // Render the page with club data and additional information
        res.render('manageClub', { 
            user: req.session.user,
            club: club,
            statistics: statistics,
            athletes: athletes,
            joinRequests: joinRequests,
            message: lastMessage || null
        });
    } catch (error) {
        console.error('Error loading club data:', error);
        res.render('manageClub', { 
            user: req.session.user,
            club: null,
            statistics: { athlete_count: 0, event_count: 0, competition_count: 0 },
            athletes: [],
            joinRequests: [],
            message: {
                type: 'error',
                text: 'Failed to load club data'
            }
        });
    }
});

/// Add this route to server.js
app.get('/manageEvent/:id', isAuthenticated, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.session.user.id;
    
    console.log(`ManageEvent route: User ${userId} is attempting to manage event ${eventId}`);
    
    // Get the event to check if user is the creator
    const event = await controller.getEventById(eventId);
    
    // Debug log the event data
    console.log("Event data:", event);
    
    // If event doesn't exist, return 404
    if (!event) {
      console.log(`Event ${eventId} not found`);
      return res.status(404).render('error', {
        message: 'Event not found',
        error: { status: 404 },
        user: req.session.user
      });
    }
    
    // Check if user is the creator (using loose equality to handle type differences)
    const isCreator = parseInt(event.creator_id) === parseInt(userId);
    console.log(`User ${userId} is creator of event ${eventId}? ${isCreator}`);
    console.log(`Comparison values: event.creator_id=${event.creator_id} (${typeof event.creator_id}), userId=${userId} (${typeof userId})`);
    
    // If user is not the creator, redirect to event details
    if (!isCreator) {
      console.log(`User ${userId} is not the creator of event ${eventId}, redirecting to details`);
      return res.redirect(`/eventDetails/${eventId}`);
    }
    
    // User is the creator, render the manage page
    console.log(`User ${userId} is the creator of event ${eventId}, rendering manage page`);
    res.render('manageEvent', { 
      eventId: parseInt(eventId),
      user: req.session.user
    });
  } catch (error) {
    console.error("Error in manageEvent route:", error);
    res.status(500).render('error', { 
      message: 'Error loading event management page', 
      error: { status: 500 },
      user: req.session.user 
    });
  }
});
// Add these routes to your server.js file

// Route to view event registrations

app.get('/event/:id/registrations', isAuthenticated, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.session.user.id;
    
    // Get the event to check if user is the creator
    const event = await controller.getEventById(eventId);
    
    // If event doesn't exist, return 404
    if (!event) {
      return res.status(404).render('error', {
        message: 'Event not found',
        error: { status: 404 },
        user: req.session.user
      });
    }
    
    // Check if user is the creator
    const isCreator = parseInt(event.creator_id) === parseInt(userId);
    
    // If user is not the creator, redirect to event details
    if (!isCreator) {
      return res.redirect(`/eventDetails/${eventId}`);
    }
    
    // Get all registrations for this event, sorted by the controller function
    const registrations = await controller.getEventRegistrations(eventId, userId);
    
    // Render the registrations page
    res.render('eventRegistrations', { 
      eventId: parseInt(eventId),
      eventName: event.name,
      registrations: registrations,
      user: req.session.user,
      success: req.query.success, // Pass query string parameters to the template
      error: req.query.error
    });
  } catch (error) {
    console.error("Error loading event registrations:", error);
    res.status(500).render('error', { 
      message: 'Error loading registrations: ' + error.message, 
      error: { status: 500 },
      user: req.session.user 
    });
  }
});
// Route to update registration status (form submission)
// Route to update registration status (form submission)
app.post('/registration/:id/update-status', isAuthenticated, async (req, res) => {
  try {
    const registrationId = req.params.id;
    const { status, eventId } = req.body;
    const userId = req.session.user.id;
    
    // Update the registration status
    await controller.updateRegistrationStatus(registrationId, status, userId);
    
    // Redirect back to the registrations page with success message
    res.redirect(`/event/${eventId}/registrations?success=Status updated successfully`);
  } catch (error) {
    console.error("Error updating registration status:", error);
    // Pass the specific error message to the redirect
    res.redirect(`/event/${req.body.eventId}/registrations?error=${encodeURIComponent(error.message)}`);
  }
});

// Route to display the edit event page
app.get('/editEvent/:id', isAuthenticated, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.session.user.id;
    
    // Get the event to check if user is the creator
    const event = await controller.getEventById(eventId);
    
    // If event doesn't exist, return 404
    if (!event) {
      return res.status(404).render('error', {
        message: 'Event not found',
        error: { status: 404 },
        user: req.session.user
      });
    }
    
    // Check if user is the creator
    const isCreator = parseInt(event.creator_id) === parseInt(userId);
    
    // If user is not the creator, redirect to event details
    if (!isCreator) {
      return res.redirect(`/eventDetails/${eventId}`);
    }
    
    // User is the creator, render the edit page
    res.render('editEvent', { 
      eventId: parseInt(eventId),
      user: req.session.user
    });
  } catch (error) {
    console.error("Error in editEvent route:", error);
    res.status(500).render('error', { 
      message: 'Error loading event edit page', 
      error: { status: 500 },
      user: req.session.user 
    });
  }
});

// Route to handle the form submission for updating an event
app.post('/updateEvent/:id', isAuthenticated, eventUpload, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.session.user.id;
    
    // Call controller function to update event
    const result = await controller.updateEvent(eventId, userId, req.body, req.files);
    
    // Always send JSON response
    return res.json(result);
  } catch (error) {
    console.error("Error updating event:", error);
    
    // Always send JSON error response
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'An error occurred while updating the event' 
    });
  }
});
// Add this to your server.js file, near the other API endpoints
app.get('/eventDetails/:id/categoryStats', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Query to get the count of registrations for each category in this event
    const [results] = await db.query(`
      SELECT 
        c.id as category_id, 
        COUNT(ir.id) as participant_count 
      FROM 
        categories c 
      LEFT JOIN 
        individual_registrations ir ON c.id = ir.category_id 
      WHERE 
        c.event_id = ? 
      GROUP BY 
        c.id
    `, [eventId]);
    
    res.json(results);
  } catch (error) {
    console.error("ERROR fetching category statistics:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add this to your server.js file, near the other API endpoints

app.get('/categories/stats/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const status = req.query.status || null;
    const stats = await controller.getCategoryStats(eventId, status);
    res.json({ categoryStats: stats });
  } catch (error) {
    console.error("ERROR fetching category statistics:", error);
    res.status(500).json({ error: error.message });
  }
});

// Club Management Routes
app.get('/clubs/my-club', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        // Query to get the club associated with this user
        const [clubs] = await db.query(
            "SELECT * FROM clubs WHERE coach_id = ?",
            [userId]
        );
        
        if (!clubs || clubs.length === 0) {
            // User has no club, return empty data
            return res.status(404).json({ error: 'No club found for this user' });
        }
        
        // Return the club data
        res.json(clubs[0]);
    } catch (error) {
        console.error('Error fetching user club:', error);
        res.status(500).json({ error: 'Failed to load club data' });
    }
});

app.get('/clubs/:id/statistics', isAuthenticated, async (req, res) => {
    try {
        const clubId = req.params.id;
        
        // Query to get club statistics
        const [athleteCount] = await db.query(
            "SELECT COUNT(*) as count FROM club_athletes WHERE club_id = ?",
            [clubId]
        );
        
        const [eventCount] = await db.query(
            "SELECT COUNT(*) as count FROM events WHERE creator_id IN (SELECT coach_id FROM clubs WHERE id = ?)",
            [clubId]
        );
        
        // Return statistics
        res.json({
            athlete_count: athleteCount[0].count || 0,
            event_count: eventCount[0].count || 0,
            competition_count: 0 // Placeholder
        });
    } catch (error) {
        console.error('Error fetching club statistics:', error);
        res.status(500).json({ error: 'Failed to load club statistics' });
    }
});

app.get('/clubs/:id/athletes', isAuthenticated, async (req, res) => {
    try {
        const clubId = req.params.id;
        
        // Query to get club athletes
        const [athletes] = await db.query(`
            SELECT u.id, u.first_name, u.last_name, u.email, u.date_of_birth, 
                   u.gender, u.profile_picture, u.contact_number, ca.status, ca.join_date 
            FROM club_athletes ca 
            JOIN users u ON ca.athlete_id = u.id 
            WHERE ca.club_id = ?
        `, [clubId]);
        
        res.json(athletes);
    } catch (error) {
        console.error('Error fetching club athletes:', error);
        res.status(500).json({ error: 'Failed to load club athletes' });
    }
});

app.get('/clubs/:id/join-requests', isAuthenticated, async (req, res) => {
    try {
        const clubId = req.params.id;
        
        // Query to get join requests
        const [requests] = await db.query(`
            SELECT ca.id, ca.athlete_id, u.first_name, u.last_name, u.email, 
                   u.date_of_birth, u.gender, ca.join_date as request_date 
            FROM club_athletes ca 
            JOIN users u ON ca.athlete_id = u.id 
            WHERE ca.club_id = ? AND ca.status = 'pending'
        `, [clubId]);
        
        res.json(requests);
    } catch (error) {
        console.error('Error fetching join requests:', error);
        res.status(500).json({ error: 'Failed to load join requests' });
    }
});

// Route to approve join request
app.post('/clubs/:clubId/join-requests/:requestId/approve', isAuthenticated, async (req, res) => {
    try {
        const clubId = req.params.clubId;
        const requestId = req.params.requestId;
        const coachId = req.session.user.id;
        
        // Verify the user is the coach of the club
        const [clubCheck] = await db.query(
            "SELECT * FROM clubs WHERE id = ? AND coach_id = ?",
            [clubId, coachId]
        );
        
        if (!clubCheck || clubCheck.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to approve join requests' 
            });
        }
        
        // Process the join request
        const result = await controller.approveJoinRequest(clubId, requestId, coachId);
        
        // Determine response type based on request
        if (req.xhr || req.headers.accept.includes('application/json')) {
            // AJAX request
            return res.status(200).json({
                success: true,
                message: 'Join request approved successfully',
                result: result
            });
        } else {
            // Page redirect
            req.session.lastMessage = {
                type: 'success',
                text: 'Join request approved successfully'
            };
            
            return res.redirect('/manageClub');
        }
    } catch (error) {
        console.error('Error approving join request:', error);
        
        // Determine response type based on request
        if (req.xhr || req.headers.accept.includes('application/json')) {
            // AJAX request
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to approve join request'
            });
        } else {
            // Page redirect
            req.session.lastMessage = {
                type: 'error',
                text: error.message || 'Failed to approve join request'
            };
            
            return res.redirect('/manageClub');
        }
    }
});
// Route to reject join request
app.post('/clubs/:clubId/join-requests/:requestId/reject', isAuthenticated, async (req, res) => {
    try {
        const clubId = req.params.clubId;
        const requestId = req.params.requestId;
        const coachId = req.session.user.id;
        
        // Verify the user is the coach of the club
        const [clubCheck] = await db.query(
            "SELECT * FROM clubs WHERE id = ? AND coach_id = ?",
            [clubId, coachId]
        );
        
        if (!clubCheck || clubCheck.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to reject join requests' 
            });
        }
        
        // Process the join request
        const result = await controller.rejectJoinRequest(clubId, requestId, coachId);
        
        // Determine response type based on request
        if (req.xhr || req.headers.accept.includes('application/json')) {
            // AJAX request
            return res.status(200).json({
                success: true,
                message: 'Join request rejected successfully',
                result: result
            });
        } else {
            // Page redirect
            req.session.lastMessage = {
                type: 'success',
                text: 'Join request rejected successfully'
            };
            
            return res.redirect('/manageClub');
        }
    } catch (error) {
        console.error('Error rejecting join request:', error);
        
        // Determine response type based on request
        if (req.xhr || req.headers.accept.includes('application/json')) {
            // AJAX request
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to reject join request'
            });
        } else {
            // Page redirect
            req.session.lastMessage = {
                type: 'error',
                text: error.message || 'Failed to reject join request'
            };
            
            return res.redirect('/manageClub');
        }
    }
});

//
app.delete('/clubs/:id/athletes/:athleteId', isAuthenticated, async (req, res) => {
    try {
        const clubId = req.params.id;
        const athleteId = req.params.athleteId;
        
        // Verify user is club coach
        const [club] = await db.query(
            "SELECT * FROM clubs WHERE id = ? AND coach_id = ?",
            [clubId, req.session.user.id]
        );
        
        if (!club || club.length === 0) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        
        // Remove athlete from club
        await db.query(
            "DELETE FROM club_athletes WHERE club_id = ? AND athlete_id = ?",
            [clubId, athleteId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing athlete:', error);
        res.status(500).json({ error: 'Failed to remove athlete' });
    }
});

app.get('/athletes/:id/competitions', isAuthenticated, async (req, res) => {
    try {
        const athleteId = req.params.id;
        
        // Query to get athlete competitions (from individual_registrations)
        const [competitions] = await db.query(`
            SELECT ir.id, ir.status, e.name as event_name, c.name as category_name, e.start_date as event_date
            FROM individual_registrations ir
            JOIN events e ON ir.event_id = e.id
            JOIN categories c ON ir.category_id = c.id
            WHERE ir.athlete_id = ?
            ORDER BY e.start_date DESC
        `, [athleteId]);
        
        res.json(competitions);
    } catch (error) {
        console.error('Error fetching athlete competitions:', error);
        res.status(500).json({ error: 'Failed to load athlete competitions' });
    }
});

// Club invitations routes
app.get('/clubs/:id/invitations', isAuthenticated, async (req, res) => {
    // This would be a placeholder until you implement invitations table
    res.json([]);
});

app.post('/clubs/update', isAuthenticated, upload.single('logo'), async (req, res) => {
    try {
        const { club_id, name, description, address, phone, email, website } = req.body;
        
        // Verify user is club coach
        const [club] = await db.query(
            "SELECT * FROM clubs WHERE id = ? AND coach_id = ?",
            [club_id, req.session.user.id]
        );
        
        if (!club || club.length === 0) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        
        // Handle logo upload if present
        let logoPath = club[0].logo;
        if (req.file) {
            logoPath = '/uploads/' + req.file.filename;
        }
        
        // Update club information
        await db.query(`
            UPDATE clubs 
            SET name = ?, description = ?, logo = ?, address = ?, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [name, description, logoPath, address, club_id]);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating club:', error);
        res.status(500).json({ error: 'Failed to update club' });
    }
});

app.post('/clubs/verify', isAuthenticated, upload.fields([
    { name: 'registration-document', maxCount: 1 },
    { name: 'coach-certification', maxCount: 1 },
    { name: 'federation-document', maxCount: 1 }
]), async (req, res) => {
    // This would be implemented once you have a verification system
    res.json({ success: true });
});

// Add these routes to the server.js file, inside the app configuration

// Route to send club invitation
app.post('/clubs/:clubId/invite', isAuthenticated, async (req, res) => {
    try {
        const clubId = req.params.clubId;
        const userId = req.session.user.id;
        
        const result = await controller.sendClubInvitation(userId, clubId, req.body);
        
        req.session.lastMessage = {
            type: 'success',
            text: 'Invitation sent successfully'
        };
        
        res.redirect('/manageClub');
    } catch (error) {
        console.error('Invitation error:', error);
        
        req.session.lastMessage = {
            type: 'error',
            text: error.message || 'Failed to send invitation'
        };
        
        res.redirect('/manageClub');
    }
});

// Route to remove an athlete from the club
app.post('/clubs/:clubId/remove-athlete/:athleteId', isAuthenticated, async (req, res) => {
    try {
        const clubId = req.params.clubId;
        const athleteId = req.params.athleteId;
        const coachId = req.session.user.id;
        
        const result = await controller.removeAthleteFromClub(clubId, athleteId, coachId);
        
        req.session.lastMessage = {
            type: 'success',
            text: 'Athlete removed from club successfully'
        };
        
        res.redirect('/manageClub');
    } catch (error) {
        console.error('Remove athlete error:', error);
        
        req.session.lastMessage = {
            type: 'error',
            text: error.message || 'Failed to remove athlete'
        };
        
        res.redirect('/manageClub');
    }
});

// Route to approve join request
app.post('/clubs/:clubId/approve-request/:requestId', isAuthenticated, async (req, res) => {
    try {
        const clubId = req.params.clubId;
        const requestId = req.params.requestId;
        const coachId = req.session.user.id;
        
        const result = await controller.approveJoinRequest(clubId, requestId, coachId);
        
        req.session.lastMessage = {
            type: 'success',
            text: 'Join request approved successfully'
        };
        
        res.redirect('/manageClub');
    } catch (error) {
        console.error('Approve request error:', error);
        
        req.session.lastMessage = {
            type: 'error',
            text: error.message || 'Failed to approve join request'
        };
        
        res.redirect('/manageClub');
    }
});

// Route to reject join request
app.post('/clubs/:clubId/reject-request/:requestId', isAuthenticated, async (req, res) => {
    try {
        const clubId = req.params.clubId;
        const requestId = req.params.requestId;
        const coachId = req.session.user.id;
        
        const result = await controller.rejectJoinRequest(clubId, requestId, coachId);
        
        req.session.lastMessage = {
            type: 'success',
            text: 'Join request rejected successfully'
        };
        
        res.redirect('/manageClub');
    } catch (error) {
        console.error('Reject request error:', error);
        
        req.session.lastMessage = {
            type: 'error',
            text: error.message || 'Failed to reject join request'
        };
        
        res.redirect('/manageClub');
    }
});

// Modify the /manageClub route to include additional data
app.get('/manageClub', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        // Query to get the club associated with this user
        const [clubs] = await db.query(
            "SELECT * FROM clubs WHERE coach_id = ?",
            [userId]
        );
        
        const club = clubs && clubs.length > 0 ? clubs[0] : null;
        
        // Get club statistics if a club exists
        let statistics = { athlete_count: 0, event_count: 0, competition_count: 0 };
        let athletes = [];
        let joinRequests = [];
        
        if (club) {
            // Get athlete count
            const [athleteResult] = await db.query(
                "SELECT COUNT(*) as count FROM club_athletes WHERE club_id = ? AND status = 'active'",
                [club.id]
            );
            statistics.athlete_count = athleteResult[0].count;
            
            // Get athletes
            athletes = await controller.getClubAthletes(club.id);
            
            // Get join requests
            joinRequests = await controller.getClubJoinRequests(club.id);
            
            // Get event count
            const [eventResult] = await db.query(
                "SELECT COUNT(*) as count FROM events WHERE creator_id = ?",
                [userId]
            );
            statistics.event_count = eventResult[0].count;
        }
        
        // Check for last session message
        const lastMessage = req.session.lastMessage;
        delete req.session.lastMessage;
        
        // Render the page with club data and additional information
        res.render('manageClub', { 
            user: req.session.user,
            club: club,
            statistics: statistics,
            athletes: athletes,
            joinRequests: joinRequests,
            message: lastMessage
        });
    } catch (error) {
        console.error('Error loading club data:', error);
        res.render('manageClub', { 
            user: req.session.user,
            club: null,
            statistics: { athlete_count: 0, event_count: 0, competition_count: 0 },
            athletes: [],
            joinRequests: [],
            message: {
                type: 'error',
                text: 'Failed to load club data'
            }
        });
    }
});

// Add this route to your server.js file, near other event-related routes

app.put('/categories/:categoryId', isAuthenticated, async (req, res) => {
  try {
    await controller.updateCategory(req, res);
  } catch (error) {
    console.error('Error in update category route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this to your server.js, near other routes
app.get('/api/events', async (req, res) => {
  try {
    // Get limit from query parameter, default to 3
    const limit = parseInt(req.query.limit) || 3;
    
    // Fetch events, limit to upcoming events
    const query = `
      SELECT id, name, description, banner_image as banner_url, 
             start_date as event_date, address
      FROM events 
      WHERE start_date > NOW()
      ORDER BY start_date ASC 
      LIMIT ?
    `;
    
    const [events] = await db.query(query, [limit]);
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({ error: 'Failed to load events' });
  }
});

// Add this to your server.js file, near other event-related routes
app.get('/public/category/:categoryId/participants', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    
    // Fetch category details to verify event
    const [categoryResult] = await db.query(
      'SELECT event_id FROM categories WHERE id = ?', 
      [categoryId]
    );
    
    if (!categoryResult || categoryResult.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Fetch registrations for this category with user details
    const [registrations] = await db.query(`
      SELECT 
        ir.id, 
        u.id as user_id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        ir.status 
      FROM individual_registrations ir
      JOIN users u ON ir.athlete_id = u.id
      WHERE ir.category_id = ?
      ORDER BY u.last_name, u.first_name
    `, [categoryId]);
    
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching category participants:', error);
    res.status(500).json({ error: 'Failed to load participants' });
  }
});

app.post('/events/:eventId/categories', isAuthenticated, async (req, res) => {
  try {
    await controller.addCategory(req, res);
  } catch (error) {
    console.error('Error in add category route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/categories/:categoryId', isAuthenticated, async (req, res) => {
  try {
    await controller.deleteCategory(req, res);
  } catch (error) {
    console.error('Error in delete category route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this route to server.js
app.put('/user/password', isAuthenticated, controller.changePassword);

// Add this route in server.js
app.put('/user/profile', isAuthenticated, upload.single('profile_picture'), controller.updateProfile);

app.get('/user/profile-data', isAuthenticated, (req, res) => {
  const userData = req.session.user;
  
  // Fetch additional user details including date of birth
  db.query(
    'SELECT date_of_birth, gender FROM users WHERE id = ?', 
    [userData.id]
  ).then(([results]) => {
    if (results.length > 0) {
      userData.date_of_birth = results[0].date_of_birth;
      userData.gender = results[0].gender;
    }
    
    res.json(userData);
  }).catch(error => {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  });
});

// Add this to your existing routes in server.js
app.post('/events/:eventId/upload-timetable', isAuthenticated, upload.single('timetable_file'), async (req, res) => {
  try {
    // Check if user is the event creator
    const eventId = req.params.eventId;
    const event = await controller.getEventById(eventId);
    
    if (!event || parseInt(event.creator_id) !== parseInt(req.session.user.id)) {
      return res.status(403).json({ error: 'Not authorized to upload timetable' });
    }
    
    // If a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Construct the file path
    const timetableFilePath = '/uploads/' + req.file.filename;
    
    // Update the event with the timetable file path
    await db.query(
      'UPDATE events SET timetable_file = ? WHERE id = ?', 
      [timetableFilePath, eventId]
    );
    
    res.json({ 
      message: 'Timetable uploaded successfully', 
      filePath: timetableFilePath 
    });
  } catch (error) {
    console.error('Error uploading timetable:', error);
    res.status(500).json({ error: 'Failed to upload timetable' });
  }
});

// Add this to your server.js file
app.get('/clubs/:id/invitations', isAuthenticated, async (req, res) => {
    try {
        const clubId = req.params.id;
        
        // Query to get club invitations
        const [invitations] = await db.query(`
            SELECT i.id, i.athlete_id, i.message, i.status, i.sent_date, 
                   u.email, u.first_name, u.last_name
            FROM club_invitations i 
            JOIN users u ON i.athlete_id = u.id
            WHERE i.club_id = ?
            ORDER BY i.sent_date DESC
        `, [clubId]);
        
        res.json(invitations);
    } catch (error) {
        console.error('Error fetching club invitations:', error);
        res.status(500).json({ error: 'Failed to load invitations' });
    }
});

app.post('/clubs/invitations/send', isAuthenticated, async (req, res) => {
    try {
        const { club_id, email, message } = req.body;
        
        // Check if the club belongs to the user
        const [club] = await db.query(
            "SELECT * FROM clubs WHERE id = ? AND coach_id = ?",
            [club_id, req.session.user.id]
        );
        
        if (!club || club.length === 0) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        
        // Use the controller function
        await controller.sendClubInvitation(req.session.user.id, club_id, { email, message });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error sending invitation:', error);
        res.status(500).json({ error: error.message || 'Failed to send invitation' });
    }
});

// Join Club page route
app.get('/joinClub', isAuthenticated, (req, res) => {
    res.render('joinClub', { user: req.session.user });
});

// Get user's club invitations
app.get('/user/invitations', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        // Query to get all invitations for this user with club and coach details
        const [invitations] = await db.query(`
            SELECT 
                i.id, i.club_id, i.message, i.status, i.sent_date,
                c.name as club_name, c.logo as club_logo,
                CONCAT(u.first_name, ' ', u.last_name) as coach_name
            FROM club_invitations i
            JOIN clubs c ON i.club_id = c.id
            JOIN users u ON c.coach_id = u.id
            WHERE i.athlete_id = ?
            ORDER BY 
                FIELD(i.status, 'pending', 'accepted', 'rejected', 'expired'),
                i.sent_date DESC
        `, [userId]);
        
        res.json(invitations);
    } catch (error) {
        console.error('Error fetching club invitations:', error);
        res.status(500).json({ error: 'Failed to load invitations' });
    }
});

// Accept club invitation
// Accept club invitation
app.post('/user/invitations/:id/accept', isAuthenticated, async (req, res) => {
    try {
        const invitationId = req.params.id;
        const userId = req.session.user.id;
        
        // Get the invitation to check if it belongs to this user and is pending
        const [invitation] = await db.query(
            "SELECT * FROM club_invitations WHERE id = ? AND athlete_id = ? AND status = 'pending'",
            [invitationId, userId]
        );
        
        if (!invitation || invitation.length === 0) {
            return res.status(404).json({ error: 'Invitation not found or already processed' });
        }
        
        // Begin transaction
        await db.query('START TRANSACTION');
        
        try {
            // Update invitation status
            await db.query(
                "UPDATE club_invitations SET status = 'accepted', updated_at = NOW() WHERE id = ?",
                [invitationId]
            );
            
            // Add user to club athletes
            const clubId = invitation[0].club_id;
            const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
            
            // Check if already a member (shouldn't happen but just in case)
            const [existingMember] = await db.query(
                "SELECT * FROM club_athletes WHERE club_id = ? AND athlete_id = ?",
                [clubId, userId]
            );
            
            if (existingMember.length === 0) {
                await db.query(
                    "INSERT INTO club_athletes (club_id, athlete_id, join_date, status, created_at, updated_at) VALUES (?, ?, ?, 'active', ?, ?)",
                    [clubId, userId, currentDate, currentDate, currentDate]
                );
            } else {
                // Update existing membership to active
                await db.query(
                    "UPDATE club_athletes SET status = 'active', updated_at = ? WHERE club_id = ? AND athlete_id = ?",
                    [currentDate, clubId, userId]
                );
            }
            
            // Update user_type to 'athlete' in users table
            await db.query(
                "UPDATE users SET user_type = 'athlete' WHERE id = ?",
                [userId]
            );
            
            // Update session with new user type
            req.session.user.user_type = 'athlete';
            
            // Commit transaction
            await db.query('COMMIT');
            
            res.json({ success: true, message: 'Invitation accepted successfully', user_type: 'athlete' });
        } catch (error) {
            // Rollback on error
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).json({ error: 'Failed to accept invitation' });
    }
});
// Decline club invitation
app.post('/user/invitations/:id/decline', isAuthenticated, async (req, res) => {
    try {
        const invitationId = req.params.id;
        const userId = req.session.user.id;
        
        // Get the invitation to check if it belongs to this user and is pending
        const [invitation] = await db.query(
            "SELECT * FROM club_invitations WHERE id = ? AND athlete_id = ? AND status = 'pending'",
            [invitationId, userId]
        );
        
        if (!invitation || invitation.length === 0) {
            return res.status(404).json({ error: 'Invitation not found or already processed' });
        }
        
        // Update invitation status
        await db.query(
            "UPDATE club_invitations SET status = 'rejected', updated_at = NOW() WHERE id = ?",
            [invitationId]
        );
        
        res.json({ success: true, message: 'Invitation declined successfully' });
    } catch (error) {
        console.error('Error declining invitation:', error);
        res.status(500).json({ error: 'Failed to decline invitation' });
    }
});

// Get user's club memberships
app.get('/user/memberships', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        // Query to get all club memberships for this user
        const [memberships] = await db.query(`
            SELECT 
                ca.id, ca.club_id, ca.status, ca.join_date,
                c.name as club_name, c.description as club_description, c.logo as club_logo
            FROM club_athletes ca
            JOIN clubs c ON ca.club_id = c.id
            WHERE ca.athlete_id = ?
            ORDER BY 
                FIELD(ca.status, 'active', 'pending', 'inactive'),
                ca.join_date DESC
        `, [userId]);
        
        res.json(memberships);
    } catch (error) {
        console.error('Error fetching club memberships:', error);
        res.status(500).json({ error: 'Failed to load memberships' });
    }
});

// Leave a club
app.post('/user/memberships/:id/leave', isAuthenticated, async (req, res) => {
    try {
        const membershipId = req.params.id;
        const userId = req.session.user.id;
        
        // Get the membership to check if it belongs to this user and is active
        const [membership] = await db.query(
            "SELECT * FROM club_athletes WHERE id = ? AND athlete_id = ? AND status = 'active'",
            [membershipId, userId]
        );
        
        if (!membership || membership.length === 0) {
            return res.status(404).json({ error: 'Membership not found or not active' });
        }
        
        // Delete the membership
        await db.query(
            "DELETE FROM club_athletes WHERE id = ?",
            [membershipId]
        );
        
        res.json({ success: true, message: 'You have left the club successfully' });
    } catch (error) {
        console.error('Error leaving club:', error);
        res.status(500).json({ error: 'Failed to leave club' });
    }
});

// Cancel a join request
app.post('/user/memberships/:id/cancel', isAuthenticated, async (req, res) => {
    try {
        const membershipId = req.params.id;
        const userId = req.session.user.id;
        
        // Get the membership to check if it belongs to this user and is pending
        const [membership] = await db.query(
            "SELECT * FROM club_athletes WHERE id = ? AND athlete_id = ? AND status = 'pending'",
            [membershipId, userId]
        );
        
        if (!membership || membership.length === 0) {
            return res.status(404).json({ error: 'Join request not found or not pending' });
        }
        
        // Delete the pending request
        await db.query(
            "DELETE FROM club_athletes WHERE id = ?",
            [membershipId]
        );
        
        res.json({ success: true, message: 'Join request cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling join request:', error);
        res.status(500).json({ error: 'Failed to cancel join request' });
    }
});

// Get all clubs or search clubs
app.get('/clubs', async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        let query = `
            SELECT c.*, u.first_name, u.last_name
            FROM clubs c
            JOIN users u ON c.coach_id = u.id
        `;
        let params = [];
        
        if (searchTerm) {
            query += `
                WHERE c.name LIKE ? 
                OR c.description LIKE ? 
                OR c.address LIKE ?
            `;
            const searchPattern = `%${searchTerm}%`;
            params = [searchPattern, searchPattern, searchPattern];
        }
        
        query += ' ORDER BY c.name';
        
        const [clubs] = await db.query(query, params);
        
        // Format the response for the frontend
        const formattedClubs = clubs.map(club => ({
            id: club.id,
            name: club.name,
            description: club.description,
            logo: club.logo,
            address: club.address,
            phone: club.phone,
            email: club.email,
            website: club.website,
            coach_name: `${club.first_name} ${club.last_name}`,
            verification_status: club.verification_status || 'pending'
        }));
        
        res.json(formattedClubs);
    } catch (error) {
        console.error('Error fetching clubs:', error);
        res.status(500).json({ error: 'Failed to load clubs' });
    }
});

// Get a specific club's details
app.get('/clubs/:id', async (req, res) => {
    try {
        const clubId = req.params.id;
        
        const [clubs] = await db.query(`
            SELECT c.*, u.first_name, u.last_name
            FROM clubs c
            JOIN users u ON c.coach_id = u.id
            WHERE c.id = ?
        `, [clubId]);
        
        if (!clubs || clubs.length === 0) {
            return res.status(404).json({ error: 'Club not found' });
        }
        
        const club = clubs[0];
        
        // Format the response
        const formattedClub = {
            id: club.id,
            name: club.name,
            description: club.description,
            logo: club.logo,
            address: club.address,
            phone: club.phone,
            email: club.email,
            website: club.website,
            coach_name: `${club.first_name} ${club.last_name}`,
            verification_status: club.verification_status || 'pending'
        };
        
        res.json(formattedClub);
    } catch (error) {
        console.error('Error fetching club details:', error);
        res.status(500).json({ error: 'Failed to load club details' });
    }
});

// Send a club join request
app.post('/clubs/:id/join', isAuthenticated, async (req, res) => {
    try {
        const clubId = req.params.id;
        const userId = req.session.user.id;
        const { message } = req.body;
        
        // Check if club exists
        const [clubs] = await db.query(
            "SELECT * FROM clubs WHERE id = ?",
            [clubId]
        );
        
        if (!clubs || clubs.length === 0) {
            return res.status(404).json({ error: 'Club not found' });
        }
        
        // Check if already a member or has a pending request
        const [existingMembership] = await db.query(
            "SELECT * FROM club_athletes WHERE club_id = ? AND athlete_id = ?",
            [clubId, userId]
        );
        
        if (existingMembership.length > 0) {
            return res.status(400).json({ error: 'You already have a membership or pending request for this club' });
        }
        
        // Create join request
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        await db.query(
            "INSERT INTO club_athletes (club_id, athlete_id, join_date, status, created_at, updated_at) VALUES (?, ?, ?, 'pending', ?, ?)",
            [clubId, userId, currentDate, currentDate, currentDate]
        );
        
        // If message was provided, store it in a new table (needs to be created)
        if (message) {
            try {
                await db.query(
                    "INSERT INTO join_request_messages (club_id, athlete_id, message, created_at) VALUES (?, ?, ?, ?)",
                    [clubId, userId, message, currentDate]
                );
            } catch (error) {
                console.error('Error storing join request message:', error);
                // Continue without the message if there's an error (table might not exist yet)
            }
        }
        
        res.json({ success: true, message: 'Join request sent successfully' });
    } catch (error) {
        console.error('Error sending join request:', error);
        res.status(500).json({ error: 'Failed to send join request' });
    }
});

// Add these routes to server.js
app.get('/myClub', isAuthenticated, (req, res) => {
    res.render('myClub', { user: req.session.user });
});

app.get('/myRegistrations', isAuthenticated, (req, res) => {
    res.render('myRegistrations', { user: req.session.user });
});

// Add this route to support fetching user registrations
app.get('/user/registrations', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        // Fetch registrations with additional event details
        const registrations = await controller.getUserRegistrations(userId);
        
        res.json(registrations);
    } catch (error) {
        console.error('Error fetching user registrations:', error);
        res.status(500).json({ error: 'Failed to load registrations' });
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
