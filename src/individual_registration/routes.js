//import express from 'express'; 
const express = require('express');

const { 
  addIndividualRegistration,

  getIndividualRegistrations,
  getIndividualRegistrationsByEventId,
  getIndividualRegistrationsByCategoryId, 
  getIndividualRegistrationByAthleteId,
  getIndividualRegistrationsByRegistrationDate,
  getIndividualRegistrationsByStatus,
  deleteIndividualRegistration,

  updateIndividualRegistration
} = require('./controller.js'); 



const router = express.Router(); 

router.get('/individual_registrations', getIndividualRegistrations);
router.get('/individual_registriatons/event_id/:event_id', getIndividualRegistrationsByEventId);
router.get('/individual_registriatons/category_id/:category_id', getIndividualRegistrationsByCategoryId);
router.get('/individual_registriatons/athlete_id/:athlete_id', getIndividualRegistrationByAthleteId);
router.get('/individual_registriatons/registration_date/:registration_date', getIndividualRegistrationsByRegistrationDate);
router.get('/individual_registriatons/status/:status', getIndividualRegistrationsByStatus);
router.post('/individual_registriatons', addIndividualRegistration);
router.put('individual_registriatons/:id', updateIndividualRegistration); 
//router.put('users/:id', updatePassword); 
router.delete('/individual_registriatons', deleteIndividualRegistration);

module.exports = router;
