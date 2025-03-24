const express = require('express'); 
const cors = require('cors'); 
const bodyParser = require('body-parser'); 

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


const app = express();
const PORT = 3000;


app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcome to my site');
});


app.use('/api', categoryRoutes);
app.use('/api', clubAthletesRoutes);
app.use('/api', clubRoutes);
app.use('/api', drawRoutes);
app.use('/api', eventsRoutes);
app.use('/api', individualRegistrationRoutes);
app.use('/api', teamRegistrationAthletesRoutes);
app.use('/api', teamRegistrationsRoutes);
app.use('/api', userRoutes);

app.use(express.json()); 

app.post('/api/login', controller.login);

app.listen(PORT, () => {
  console.log(`Server is running on localhost: ${PORT}`);
});
