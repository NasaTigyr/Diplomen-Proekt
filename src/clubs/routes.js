//import express from 'express'; 
const express = require('express'); 

const { 
  addClub,

  getClubs,
  getClubById,
  getClubByName, 
  getClubsByFed, 
  getClubsByDate,
  getClubsByStatus,

  deleteClub, 
  updateClub
} = require( './controller.js'); 



const router = express.Router(); 

router.get('/clubs', getClubs);
router.get('/clubs/id/:id', getClubById);
router.get('/clubs/name/:name', getClubByName);
router.get('/clubs/fed/:fed', getClubsByFed);
router.get('/clubs/date/:date', getClubsByDate);
router.get('/clubs/status/:status', getClubsByStatus);
router.post('/clubs', addClub);
router.put('clubs/:id', updateClub); 
//router.put('users/:id', updatePassword); 
router.delete('/clubs', deleteClub);

module.exports = router;
