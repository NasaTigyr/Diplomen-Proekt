//import express from 'express';
const express = require('express'); 

const { 
  addUser, 

  getUsers,
  getUsersByRole, 
  getUserById,
  getUserByName, 
  getUserByEmail, 

  deleteUser,
  updateUser,
} = require( './controller'); 

const router = express.Router(); 

router.get('/users', getUsers);
router.get('/users/id/:id', getUserById);
router.get('/users/role/:role', getUsersByRole); 
router.get('/users/name/:name', getUserByName);
router.get('/users/email/:email', getUserByEmail);
router.post('/users', addUser);
router.put('users/:id', updateUser); 
//router.put('users/:id', updatePassword); 
router.delete('/users', deleteUser);

module.exports = router;
