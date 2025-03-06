const express = require('express'); 
const session = require('express-session'); 
const path = require('path'); 
const mysql = require('mysql2');
const bcrypt = require('bcryptjs'); // da cryptira
const app = express(); 
const port = 3000; 

// Middleware setup
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data
app.use(session({
  secret: 'yourSecretKey', // Used to sign the session ID cookie
  resave: false,           // Avoids saving unchanged sessions
  saveUninitialized: false,// Avoids storing empty sessions
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Database connection
const db = mysql.createConnection({
  host: '127.0.0.1', // database host
  user: 'serverUser', // database user
  password: 'password', // database password (if any)
  database: 'test', // your database name
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

app.use(express.static(path.join(__dirname, 'public'))); 

// Route setting
app.get('/', (req, res) => {
  // Check if user is logged in
  if (req.session.user) {
    console.log('you are in');
  } else {
    console.log('you are not in');
  }
  res.sendFile(path.join(__dirname, 'views', 'index.ejs'));
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
    res.render('events', {user: req.session.user});
  } else {
    console.log('you are not in');
    res.redirect('/login'); // Redirect to login if not authenticated
  }
});

// Protected dashboard route
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    console.log('you are in');
    res.send(`
      <h1>Welcome ${req.session.user.name}!</h1>
      <p>You are logged in.</p>
      <a href="/logout">Logout</a>
      <a href="/events">Go to Events</a>
    `);
  } else {
    console.log('you are not in');
    res.redirect('/login');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// Registration route
app.post('/register', async (req, res) => {
  const {name, password} = req.body;
  console.log(req.body); 
  
  if(!name || !password) { 
    return res.status(400).send('all fields are required');
  }
  
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert user into database
    const query = "INSERT INTO users (name, password) VALUES (?, ?)";
    db.query(query, [name, hashedPassword], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error or user already exists' });
      }
      res.json({ message: 'User registered successfully', userId: result.insertId });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route - FIXED
app.post('/login', async (req, res) => {
  const {name, password} = req.body;
  console.log(req.body); 
  
  if(!name || !password) {
    return res.status(400).send('All fields are required');
  }
  
  const query = "SELECT * FROM users WHERE name = ?";
  db.query(query, [name], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    // If no user is found
    if (results.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Extract user data
    const user = results[0];
    
    // Compare hashed password
    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
      
      // Store user in session BEFORE sending response
      req.session.user = { id: user.id, name: user.name };
      
      // Send success response AFTER setting session
      //res.json({ 
        //message: 'Login successful', 
        //user: { id: user.id, name: user.name },
        //redirectTo: '/dashboard' // Front-end can use this for redirection
      //});
      
      res.redirect('/events'); 

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error verifying password' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

