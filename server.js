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

// API routes
//app.use('/api', categoryRoutes);
//app.use('/api', clubAthletesRoutes);
//app.use('/api', clubRoutes);
//app.use('/api', drawRoutes);
//app.use('/api', eventsRoutes);
//app.use('/api', individualRegistrationRoutes);
//app.use('/api', teamRegistrationAthletesRoutes);
//app.use('/api', teamRegistrationsRoutes);
//app.use('/api', userRoutes); 
//
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

//app.get('/events', (req, res) => { 
//  res.render('events', { user: req.session.user });
//});

//app.get('/eventDetails/:id', (req,res) => {
//  const eventId = req.params.id; 
//  res.render('eventDetails',{ user: req.session.user,
//    eventId: eventId} ); 
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

//app.get('/favicon.ico', (req, res) => res.status(204).end());
//app.get('/events', async (req, res) => {
//  try {
//    const events = await controller.getEvents(); // Call controller function
//    res.render('events', { user: req.session.user || null, events }); // Pass both user & events
//  } catch (error) {
//    console.error('Error fetching events:', error);
//    res.status(500).send('Internal Server Error');
//  }
//});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
