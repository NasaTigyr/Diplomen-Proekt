//import { queries }  from './queries.js'; 
const queries = require('./queries.js');
//import mysql from 'mysql2/promise';
const mysql = require('mysql2/promise');
//import bcrypt from 'bcrypt';
const bcrypt = require('bcrypt');

  
const db = mysql.createConnection({
  host: '127.0.0.1', // database host
  user: 'serverUser', // database user
  password: 'password', // database password (if any)
  database: 'test', // your database name
});

 const addUser = async (req, res) => { 
  try { 
    const { email, password, first_name, last_name, date_of_birth, gender, user_type = 'regular', profile_picture, contact_number } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10) ; 

    const profilePic = profile_picture ? profile_picture : null; 
    const contactNum = contact_number ? contact_number : null; 

    await db.query(queries.addUser, [email, hashedPassword, first_name, last_name, date_of_birth, gender, user_type, profilePic, contactNum]);
    res.status(201).json({message: 'User added successfully'}); 

  } catch (error) { 
    res.status(500).json({error: error.message});
  }
};


 const getUsers = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getUsers); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getUsersByRole = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getUsersByRole); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};


 const getUserById = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getUserById); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};


 const getUserByName = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getUserByName); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};


 const getUserByEmail = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getUserByEmail); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};


 const deleteUser = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.deleteUser); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};


 const updateUser = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.updateUser); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};


 const updatePassword = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.updatePassword); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getPassword = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getPassword); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};


module.exports = {
  addUser, 

  getUsers,
  getUsersByRole,
  getUserById,
  getUserByName,
  getUserByEmail,

  updatePassword,
  getPassword,
  
  deleteUser,
  updateUser
};
