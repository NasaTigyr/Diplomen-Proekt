const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const port = 3000;

// Import controllers
const authController = require('./controllers/authController');
const eventController = require('./controllers/eventController');
//const categoryController = require('./controllers/categoryController');
//const registrationController = require('./controllers/registrationController');
//const matchController = require('./controllers/matchController');
//const timetableController = require('./controllers/timetableController');
//const clubController = require('./controllers/clubController');

// Import middleware
const authMiddleware = require('./middleware/authMiddleware');

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
// Database connection
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
  if (req.session.user) {
    console.log('you are in');
  } else {
    console.log('you are not in');
  }
  res.render('index');
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});
app.get('/events', (req, res) => {
  if (req.session.user) {
    console.log('you are in');
  } else {
    console.log('you are not in');
  }
  res.render('events', { user: req.session.user });
});
app.get('/event/:id', (req, res) => {
  res.render('event-details', { eventId: req.params.id });
});

// Add admin check to create-event route
app.get('/createEvent', authMiddleware.isAuthenticated, (req, res) => {
  // Check if user is admin
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.redirect('/becomeAdmin');
  }
  res.render('createEvent', { user: req.session.user });
});

app.get('/registerClub', authMiddleware.isAuthenticated, (req, res) => {
  res.render('registerClub');
});
app.get('/profile', authMiddleware.isAuthenticated, (req, res) => {
  res.render('profile', {user: req.session.user});
});

// Add route for becoming an admin
app.get('/becameAdmin', authMiddleware.isAuthenticated, (req, res) => {
  res.render('becomeAdmin', { user: req.session.user });
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

// Add admin check to event creation API
app.post('/api/events', authMiddleware.isAuthenticated, (req, res, next) => {
  // Check if user is admin
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ message: 'Only administrators can create events' });
  }
  next();
}, eventController.createEvent);

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
