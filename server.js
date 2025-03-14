const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2/promise'); // Add MySQL connection
const db = require('./db'); 
const app = express();
const port = 3000;

// Import controllers
const authController = require('./controllers/authController');
const eventController = require('./controllers/eventController');
// Uncomment as you implement them
const clubController = require('./controllers/clubController');
//const categoryController = require('./controllers/categoryController');
//const registrationController = require('./controllers/registrationController');
//const matchController = require('./controllers/matchController');
//const timetableController = require('./controllers/timetableController');

// Import middleware
const authMiddleware = require('./middleware/authMiddleware');

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Set up static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to add user to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Web routes (for serving views)
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/events', (req, res) => {
  res.render('events', { user: req.session.user });
});

app.get('/event/:id', (req, res) => {
  res.render('event-details', { eventId: req.params.id });
});

// Update admin check to coach check for event creation
app.get('/createEvent', authMiddleware.isAuthenticated, (req, res) => {
  // Check if user is a coach
  if (!req.session.user || req.session.user.user_type !== 'coach') {
    return res.redirect('/becomeCoach');
  }
  res.render('createEvent', { user: req.session.user });
});

// Club management routes
app.get('/myClub', authMiddleware.isAuthenticated, (req, res) => {
  // Check if user is a coach
  if (!req.session.user || req.session.user.user_type !== 'coach') {
    return res.redirect('/becomeCoach');
  }
  res.render('myClub', { user: req.session.user });
});

app.get('/profile', authMiddleware.isAuthenticated, (req, res) => {
  res.render('profile', {user: req.session.user});
});

// Change from becameAdmin to becomeCoach
app.get('/becomeCoach', authMiddleware.isAuthenticated, (req, res) => {
  res.render('becomeCoach', { user: req.session.user });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Authentication routes
app.post('/register', authController.register);
app.post('/login', authController.login);

// API Routes
// Events API
app.get('/api/events', eventController.getAllEvents);
app.get('/api/events/:id', eventController.getEventById);

// Update admin check to coach check for event creation API
app.post('/api/events', authMiddleware.isAuthenticated, (req, res, next) => {
  // Check if user is a coach
  if (!req.session.user || req.session.user.user_type !== 'coach') {
    return res.status(403).json({ message: 'Only coaches can create events' });
  }
  next();
}, eventController.createEvent);

// Club management API
app.post('/api/clubs', authMiddleware.isAuthenticated, (req, res, next) => {
  if (!req.session.user || req.session.user.user_type !== 'coach') {
    return res.status(403).json({ message: 'Only coaches can create clubs' });
  }
  next();
}, clubController.createClub);


app.get('/api/clubs/:id', clubController.getClubById);
app.get('/api/coaches/:coachId/clubs', clubController.getClubsByCoach);

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
