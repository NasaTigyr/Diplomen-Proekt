const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const app = express();
const port = 3000;
// Import controllers
const authController = require('./controllers/authController');
const eventController = require('./controllers/eventController');
const categoryController = require('./controllers/categoryController');
const registrationController = require('./controllers/registrationController');
const matchController = require('./controllers/matchController');
const timetableController = require('./controllers/timetableController');
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
const db = require('./db');
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
app.get('/create-event', authMiddleware.isAuthenticated, (req, res) => {
  // Check if user is admin
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.redirect('/become-admin');
  }
  res.render('create-event', { user: req.session.user });
});

app.get('/my-events', authMiddleware.isAuthenticated, (req, res) => {
  res.render('my-events');
});
app.get('/profile', authMiddleware.isAuthenticated, (req, res) => {
  res.render('profile', {user: req.session.user});
});

// Add route for becoming an admin
app.get('/become-admin', authMiddleware.isAuthenticated, (req, res) => {
  res.render('become-admin', { user: req.session.user });
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

app.put('/api/events/:id', authMiddleware.isAuthenticated, eventController.updateEvent);
app.delete('/api/events/:id', authMiddleware.isAuthenticated, eventController.deleteEvent);
// Categories API
app.get('/api/events/:eventId/categories', categoryController.getCategoriesByEventId);
app.post('/api/categories', authMiddleware.isAuthenticated, categoryController.createCategory);
app.put('/api/categories/:id', authMiddleware.isAuthenticated, categoryController.updateCategory);
app.delete('/api/categories/:id', authMiddleware.isAuthenticated, categoryController.deleteCategory);
// Registrations API
app.get('/api/categories/:categoryId/registrations', registrationController.getRegistrationsByCategoryId);
app.post('/api/registrations', authMiddleware.isAuthenticated, registrationController.createRegistration);
app.put('/api/registrations/:id', authMiddleware.isAuthenticated, registrationController.updateRegistration);
app.delete('/api/registrations/:id', authMiddleware.isAuthenticated, registrationController.deleteRegistration);
// Matches API
app.get('/api/categories/:categoryId/matches', matchController.getMatchesByCategoryId);
app.post('/api/categories/:categoryId/generate-bracket', authMiddleware.isAuthenticated, matchController.generateBracket);
app.put('/api/matches/:id', authMiddleware.isAuthenticated, matchController.updateMatch);
// Timetable API
app.get('/api/events/:eventId/timetable', timetableController.getTimetableByEventId);
app.post('/api/timetable', authMiddleware.isAuthenticated, timetableController.createTimetableEntry);
app.put('/api/timetable/:id', authMiddleware.isAuthenticated, timetableController.updateTimetableEntry);
app.delete('/api/timetable/:id', authMiddleware.isAuthenticated, timetableController.deleteTimetableEntry);

// Admin application route
app.post('/api/apply-for-admin', authMiddleware.isAuthenticated, (req, res) => {
  // This would normally send an email or create a DB record
  // For now, we'll just return a success message
  res.status(200).json({ 
    message: 'Your application has been submitted. We will review it and contact you soon.' 
  });
});

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
