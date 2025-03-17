const express = require('express');
const session = require('express-session');
const multer = require('multer'); 
const fs = require('fs'); 
const path = require('path');
const app = express();
const port = 3000;

// Importni controlleri

const userRoutes = require('./routes/userRoutes');
const clubRoutes = require('./routes/clubRoutes');

const authController = require('./controllers/authController');
const eventController = require('./controllers/eventController');

const clubController = require('./controllers/clubController');
//const categoryController = require('./controllers/categoryController');
//const registrationController = require('./controllers/registrationController');
//const matchController = require('./controllers/matchController');
//const timetableController = require('./controllers/timetableController');

// Importni middleware
const authMiddleware = require('./middleware/authMiddleware');
const uploadMiddleware = require('./middleware/uploadMiddleware');

// Middleware setupa
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

const uploadDir = 'public/uploads/profile_pictures';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/profile_pictures/')
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create upload middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

app.use('/api/user', userRoutes)

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

// Club management routove
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

// Add this to your server.js where you define routes
app.put('/api/user/profile', authMiddleware.isAuthenticated, upload.single('profile_picture'), async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { first_name, last_name, email, contact_number } = req.body;
    
    // Build update data
    const userData = {
      first_name,
      last_name,
      email,
      contact_number
    };
    
    // If a file was uploaded, add the path to the update data
    if (req.file) {
      userData.profile_picture = `/uploads/profile_pictures/${req.file.filename}`;
    }
    
    // Update the user in the database
    const updated = await User.update(userId, userData);
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update profile' });
    }
    
    // Get the updated user data
    const user = await User.findById(userId);
    
    // Update session data
    req.session.user = {
      ...req.session.user,
      ...userData
    };
    
    res.status(200).json({ 
      message: 'Profile updated successfully', 
      user: user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile: ' + error.message });
  }
});

app.put('/api/user/profile', authMiddleware.isAuthenticated, uploadMiddleware.uploadProfilePicture, authController.updateProfile);

app.get('/api/clubs/:id', clubController.getClubById);
app.get('/api/coaches/:coachId/clubs', clubController.getClubsByCoach);

//club api handler
app.use('/api/clubs', clubRoutes);

// Club routes - Views
app.get('/createClub', (req, res) => {
  res.redirect('/clubs/register');
});
app.use('/clubs', clubRoutes);

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
