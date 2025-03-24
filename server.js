// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');

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
const controller = require('./controller.js');

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

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'martial_arts_session_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API routes
app.use('/api', categoryRoutes);
app.use('/api', clubAthletesRoutes);
app.use('/api', clubRoutes);
app.use('/api', drawRoutes);
app.use('/api', eventsRoutes);
app.use('/api', individualRegistrationRoutes);
app.use('/api', teamRegistrationAthletesRoutes);
app.use('/api', teamRegistrationsRoutes);
app.use('/api', userRoutes);
app.post('/api/login', controller.login);

// View routes
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user || null });
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login?error=' + encodeURIComponent('Please login to view your profile'));
    }
    res.render('profile', { user: req.session.user });
});

app.get('/createClub', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login?error=' + encodeURIComponent('Please login to create a club'));
    }
    res.render('createClub', { user: req.session.user });
});

app.get('/events', (req, res) => {
    res.render('events', { user: req.session.user || null });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Handle post requests
app.post('/login', (req, res) => {
    // This will be handled by your controller.login function
    // but you need to set up a route to the HTML form
    controller.login(req, res);
});

app.post('/register', upload.single('profile_picture'), (req, res) => {
    // Handle registration logic
    // You'll need to implement this in your controller
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
