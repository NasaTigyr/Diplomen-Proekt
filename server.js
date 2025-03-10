const express = require('express'); 
const session = require('express-session'); 
const path = require('path'); 
const mysql = require('mysql2');
const bcrypt = require('bcryptjs'); // da cryptira
const app = express(); 
const port = 3000; 

const authController = require('./controllers/authController');

// Middleware setup
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data
app.use(session({
  secret: 'yourSecretKey', // Used to sign the session ID cookie
  resave: false,           // Avoids saving unchanged sessions
  saveUninitialized: false,// Avoids storing empty sessions
  cookie: { secure: false } // Set to true if using HTTPS
}));

const db = require('./db'); 

app.use(express.static(path.join(__dirname, 'public'))); 

// Route setting
app.get('/', (req, res) => {
  // Check if user is logged in
  if (req.session.user) {
    console.log('you are in');
  } else {
    console.log('you are not in');
  }
  res.render(path.join(__dirname, 'views', 'index.ejs'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

app.get('/events', (req, res) => {
  // Check if user is logged in
  if (req.session.user) {
    console.log('you are in');
  } else {
    console.log('you are not in');
  }
    res.render('events', {user: req.session.user});
});

// Registration route
app.post('/register', authController.register);



// Login route - FIXED
app.post('/login', authController.login);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

