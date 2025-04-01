//import express from 'express'; 
const express = require('express'); 

const { 
  addClubAthletes,

  getClubAthletes,
  getClubAthletesByClubId,
  getClubAthleteByAthleteId,
  getClubAthletesByJoinDate, 
  getClubAthletesByStatus, 
  getClubAthletesByCreatedAt,
  getClubAthletesByUpdatedAt,

  deleteClubAthletes, 
  updateClubAthletes
} = require('./controller.js'); 



const router = express.Router(); 

router.get('/clubAthletes', getClubAthletes);
router.get('/clubAthletes/clubid/:clubid', getClubAthletesByClubId);
router.get('/clubAthletes/athleteid/:athleteid', getClubAthleteByAthleteId);
router.get('/clubAthletes/joindate/:joindate', getClubAthletesByJoinDate);
router.get('/clubAthletes/status/:status', getClubAthletesByStatus);
router.get('/clubAthletes/createdat/:status', getClubAthletesByCreatedAt);
router.get('/clubAthletes/updatedat/:updatedat', getClubAthletesByUpdatedAt);

router.post('/clubAthletes', addClubAthletes);
router.put('clubAthletes/:id', updateClubAthletes); 
//router.put('users/:id', updatePassword); 
router.delete('/clubAthletes', deleteClubAthletes);

module.exports = router;
