//import express from 'express'; 
const express = require('express'); 

const { 
  addDraw,

  getDraws,
  getDrawId,
  getDrawByCategoryId, 
  getDrawsByStatus, 

  deleteDraw, 
  updateDraw
} = require ('./controller.js'); 



const router = express.Router(); 

router.get('/draws', getDraws);
router.get('/draws/id/:id', getDrawId);
router.get('/draws/categoryid/:categoryid', getDrawByCategoryId);
router.get('/draws/status/:status', getDrawsByStatus);
router.post('/draws', addDraw);
router.put('draws/:id', updateDraw); 
//router.put('users/:id', updatePassword); 
router.delete('/draws', deleteDraw);

module.exports = router;
