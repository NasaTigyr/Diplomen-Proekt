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

// Middleware
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

// Direct routes for form submissions
app.post('/login', controller.login); // Keep this as your form submits to /login
app.post('/register', controller.register); 
app.post('/clubs', clubUpload, controller.createClub); // Add the club creation route here

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

app.get('/createClub', isAuthenticated, (req, res) => {
  res.render('createClub', { user: req.session.user });
});

app.get('/events', (req, res) => {
  res.render('events', { user: req.session.user || null });
});

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
