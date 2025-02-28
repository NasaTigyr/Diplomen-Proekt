const express = require('express'); 
const path = require('path'); 
const mysql = require('mysql2');
const bcrypt = require('bcryptjs'); // da cryptira
const app = express(); 
const port = 3000; 

app.use(express.json()); 

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


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
