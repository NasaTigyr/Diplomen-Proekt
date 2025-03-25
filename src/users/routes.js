//import express from 'express';
const express = require('express'); 
const controller = require('../../controller');
const multer = require('multer');

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

router.post('/login', controller.login);
//router.post('register', upload.single('profile_picture'), controller.register); 
//router.put('/user/profile', upload.single('profile_picture'), controller.updateProfile);
router.put('/user/password', controller.changePassword);
//router.put('users/:id', updatePassword); 

module.exports = router;
