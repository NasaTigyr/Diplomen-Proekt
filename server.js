// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const controller = require('./controller.js');

// Import routes
const categoryRoutes = require('./src/categories/routes.js');
const clubAthletesRoutes = require('./src/club_athletes/routes.js');
const clubRoutes = require('./src/clubs/routes.js');
const drawRoutes = require('./src/draws/routes.js');
const eventsRoutes = require('./src/events/routes.js');
const individualRegistrationRoutes = require('./src/individual_registration/routes.js');
const teamRegistrationAthletesRoutes = require('./src/team_registration_athletes/routes.js');
const teamRegistrationsRoutes = require('./src/team_registrations/routes.js');
const userRoutes = require('./src/users/routes.js');

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

//app.get('/eventDetails/:id', async (req, res) => {
//  try {
//    console.log("1. Route handler started");
//    const eventId = req.params.id;
//    console.log("2. Event ID:", eventId);
//    
//    const eventData = await controller.getEventById(eventId);
//    console.log("3. Event data received");
//    
//    const event = Array.isArray(eventData) ? eventData[0] : eventData;
//    console.log("4. Preparing to render");
//    
//    res.render('eventDetails', {
//      event: event,
//      eventId: parseInt(eventId),
//      user: req.session.user || null
//    });
//    console.log("5. Render function called");
//  } catch (error) {
//    console.error("ERROR in event details route:", error);
//    res.status(500).send("Error: " + error.message);
//  }
//});

app.get('/events', async (req, res) => {
    try {
        const events = await controller.getEvents();
        
        // Check if the request wants JSON (likely an AJAX request)
        // or HTML (direct browser navigation)
        if (req.xhr || req.headers.accept.indexOf('json') !== -1) {
            // If it's an AJAX request or specifically requesting JSON, return JSON data
            return res.json(events);
        }
        
        // Otherwise render the page with the events data included
        res.render('events', { 
            user: req.session.user,
            initialEvents: JSON.stringify(events)
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        
        // Similar handling for errors
        if (req.xhr || req.headers.accept.indexOf('json') !== -1) {
            return res.status(500).json({ error: 'Failed to load events' });
        }
        
        res.render('events', { 
            user: req.session.user,
            initialEvents: '[]',
            error: 'Failed to load events' 
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
    
    // Just render the template with the eventId
    // The actual data will be fetched by the frontend via API endpoints
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

app.get('/manageClub', isAuthenticated, (req, res) => {
  res.render('manageClub', { user: req.session.user });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
