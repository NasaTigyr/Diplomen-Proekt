
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

 const getClubAthletes = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getClubAthletes); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getClubAthletesByClubId = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getClubAthletesByClubId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getClubAthleteByAthleteId = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getClubAthleteByAthleteId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getClubAthletesByJoinDate = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getClubAthletesByJoinDate); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getClubAthletesByStatus = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getClubAthletes); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getClubAthletesByCreatedAt = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getClubAthletesByCreatedAt); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getClubAthletesByUpdatedAt = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getClubAthletesByCreatedAt); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const addClubAthletes = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.addClubAthletes); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const deleteClubAthletes = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.deleteClubAthletes); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const updateClubAthletes = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.updateClubAthletes); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

module.exports = {
  getClubAthletes,
  getClubAthletesByClubId,
  getClubAthleteByAthleteId,
  getClubAthletesByJoinDate,
  getClubAthletesByStatus,
  getClubAthletesByCreatedAt,
  getClubAthletesByUpdatedAt,
  addClubAthletes,
  deleteClubAthletes,
  updateClubAthletes
};
