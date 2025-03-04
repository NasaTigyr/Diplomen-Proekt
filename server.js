const express = require('express'); 
const session = require('express-session'); 
const path = require('path'); 
const mysql = require('mysql2');
const bcrypt = require('bcryptjs'); // da cryptira
const app = express(); 
const port = 3000; 

app.use(express.json()); 

app.use(express.urlencoded({ extended: true })); // Middleware to parse form data
app.use(express.json()); // Middleware to parse JSON data

app.use(session({
  secret: 'yourSecretKey', // Used to sign the session ID cookie
  resave: false,           // Avoids saving unchanged sessions
  saveUninitialized: false,// Avoids storing empty sessions
  cookie: { secure: false } // Set to true if using HTTPS
}));

// this shit worked!!!
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

//Route setting. Tova shte e zabavno. 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'events.html'));
});

//Post, retrive the fukni data
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

app.post('/login', (req, res) => {
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
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        } else { 
            res.json({ message: 'User registered successfully'});
        }
      req.session.user = { id: user.id, name: user.name }; // Store user in session

    });
  
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
