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

 const addTeamRegistration = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.addTeamRegistration); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getTeamsRegistrations = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getTeamsRegistrations); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getTeamRegistrationsByEventId = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getTeamRegistrationsByEventId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getTeamRegistrationsByCatId = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getTeamRegistrationsByCatId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getTeamRegistrationsByClubId = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getTeamRegistrationsByClubId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getTeamRegistrationsByCoachId = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getTeamRegistrationsByCoachId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};


 const  getTeamRegistrationsByStatus= async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getTeamRegistrationsByStatus); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const  deleteTeamRegistration = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.deleteTeamRegistration); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const  updateTeamRegistration = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.updateTeamRegistration); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

module.exports = {
  addTeamRegistration,

  getTeamsRegistrations,
  getTeamRegistrationsByEventId,
  getTeamRegistrationsByCatId,
  getTeamRegistrationsByClubId,
  getTeamRegistrationsByCoachId,
  getTeamRegistrationsByStatus,

  deleteTeamRegistration,
  updateTeamRegistration
};
