//import express from 'express'; 
const express = require('express'); 

const {
  addTeamRegistration,

  getTeamsRegistrations,
  getTeamRegistrationsByEventId,
  getTeamRegistrationsByCatId,
  getTeamRegistrationsByClubId,
  getTeamRegistrationsByCoachId,
  getTeamRegistrationsByStatus,

  deleteTeamRegistration,
  updateTeamRegistration
} = require('./controller'); 



const router = express.Router(); 

router.get('/teamreg', getTeamsRegistrations);
router.get('/teamreg/eventid/:eventid', getTeamRegistrationsByEventId);
router.get('/teamreg/catid/:catid', getTeamRegistrationsByCatId);
router.get('/teamreg/clubid/:clubid', getTeamRegistrationsByClubId);
router.get('/teamreg/coachid/:coachid', getTeamRegistrationsByCoachId);
router.get('/teamreg/status/:status', getTeamRegistrationsByStatus);
router.post('/teamreg', addTeamRegistration);
router.put('teamreg/:id', updateTeamRegistration); 
//router.put('users/:id', updatePassword); 
router.delete('/teamreg', deleteTeamRegistration);

module.exports = router;
