//import express from 'express'; 
const express = require('express'); 

const { 
  addTeamRegistrationAthlete,

  getTeamRegistrationAthletes,
  getTeamRegistrationAthletesByTeamRegId,
  getTeamRegistrationAthletesByAthleteId,
  getTeamRegistrationAthletesByCreatedAt, 
  getTeamRegistrationAthletesByUpdatedAt, 

  deleteTeamRegistrationAthlete, 
  updateTeamRegistrationAthlete
} = require('./controller'); 



const router = express.Router(); 

router.get('/teamregistrationathlete', getTeamRegistrationAthletes);
router.get('/teamregistrationathlete/id/:id', getTeamRegistrationAthletesByTeamRegId);
router.get('/teamregistrationathlete/name/:name', getTeamRegistrationAthletesByAthleteId);
router.get('/teamregistrationathlete/type/:type', getTeamRegistrationAthletesByCreatedAt);
router.get('/teamregistrationathlete/date/:date', getTeamRegistrationAthletesByUpdatedAt);
router.post('/teamregistrationathlete', addTeamRegistrationAthlete);
router.put('teamregistrationathlete/:id', updateTeamRegistrationAthlete); 
//router.put('users/:id', updatePassword); 
router.delete('/teamregistrationathlete', deleteTeamRegistrationAthlete);

module.exports = router;
