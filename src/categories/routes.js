//import express from 'express'; 
const express = require('express'); 

const { 
  addCategory,

  getCategories,
  getCategoryById,
  getCategoriesByEventId,
  getCategoryByName, 
  getCategoriesByGender,
  getCategoriesByAge, 

  deleteCategory, 
  updateCategory
} = require( './controller'); 



const router = express.Router(); 

router.get('/events', getCategories);
router.get('/events/eventid/:eventid', getCategoriesByEventId);
router.get('/events/id/:id', getCategoryById);
router.get('/events/name/:name', getCategoryByName);
router.get('/events/gender/:gender', getCategoriesByGender);
router.get('/events/date/:date', getCategoriesByAge);
router.post('/events', addCategory);
router.put('events/:id', updateCategory); 
//router.put('users/:id', updatePassword); 
router.delete('/events', deleteCategory);

module.exports = router; 
