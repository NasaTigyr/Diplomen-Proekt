//import express from 'express';
const express = require('express'); 
//import cors from 'cors';
const cors = require('cors'); 
//import bodyParser from 'body-parser';
const bodyParser = require('body-parser'); 

//import categoriesRoutes from './src/categories/routes.js';
const categoryRoutes = require('./src/categories/routes.js');
//import clubAthletesRoutes from './src/club_athletes/routes.js';
const clubAthletesRoutes = require('./src/club_athletes/routes.js');
//import clubRoutes from './src/clubs/routes.js';
const clubRoutes = require('./src/clubs/routes.js'); 
//import drawRoutes from './src/draws/routes.js';
const drawRoutes = require('./src/draws/routes.js'); 
//import eventsRoutes from './src/events/routes.js';
const eventsRoutes = require('./src/events/routes.js'); 
//import individualRegistrationRoutes  from './src/individual_registration/routes.js';
const individualRegistrationRoutes = require('./src/individual_registration/routes.js'); 
//import teamRegistrationAthletesRoutes from './src/team_registration_athletes/routes.js';
const teamRegistrationAthletesRoutes = require('./src/team_registration_athletes/routes.js'); 
//import teamRegistrationsRoutes from './src/team_registrations/routes.js';
const teamRegistrationsRoutes = require('./src/team_registrations/routes.js'); 
//import userRoutes from './src/users/routes.js';
const userRoutes = require('./src/users/routes.js'); 

//import { conroller } from './src/controller.js';
const controller = require('./controller.js'); 


const app = express();
const PORT = 3000;


app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcome to AthletixHub API');
});


//app.use('/views/index.ejs'); 

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
    console.log(`Server is running on port ${PORT}`);
});
