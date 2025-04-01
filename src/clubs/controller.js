//import { queries }  from './queries.js'; 
const queries = require('./queries.js'); 
//import mysql from 'mysql2/promise';
const mysql = require('mysql2/promise');  
  
const db = mysql.createConnection({
  host: '127.0.0.1', // database host
  user: 'serverUser', // database user
  password: 'password', // database password (if any)
  database: 'test', // your database name
});

 const getClubs = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getClubs); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getClubByName = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getClubByName); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getClubsByFed = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getClubsByFed); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getClubById = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getClubById); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getClubsByStatus = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getClubsByStatus); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getClubsByDate = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getClubsByDate); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const addClub = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.addClub); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const deleteClub = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.deleteClub); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const updateClub = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.updateClub); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

module.exports = {
  getClubs,
  getClubByName,
  getClubsByFed,
  getClubById,
  getClubsByStatus,
  getClubsByDate,
  addClub,
  deleteClub,
  updateClub
};
