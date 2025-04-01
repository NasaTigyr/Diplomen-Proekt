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

 const addTeamRegistrationAthlete = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.addTeamRegistrationAthlete); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getTeamRegistrationAthletes = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getTeamRegistrationAthletes); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getTeamRegistrationAthletesByTeamRegId = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getTeamRegistrationAthletesByTeamRegId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const  getTeamRegistrationAthletesByAthleteId = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getTeamRegistrationAthletesByAthleteId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const  getTeamRegistrationAthletesByCreatedAt = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getTeamRegistrationAthletesByCreatedAt); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const  getTeamRegistrationAthletesByUpdatedAt = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getTeamRegistrationAthleteByCreatedAt); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const  deleteTeamRegistrationAthlete = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.deleteTeamRegistrationAthlete); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const  updateTeamRegistrationAthlete = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.updateTeamRegistrationAthlete); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

module.exports = {
  addTeamRegistrationAthlete,

  getTeamRegistrationAthletes,
  getTeamRegistrationAthletesByTeamRegId,
  getTeamRegistrationAthletesByAthleteId,
  getTeamRegistrationAthletesByCreatedAt,
  getTeamRegistrationAthletesByUpdatedAt,

  deleteTeamRegistrationAthlete,
  updateTeamRegistrationAthlete
};
