//import { queries }  from './queries.js'; 
//import mysql from 'mysql2/promise';

const queries = require('./queries.js'); 
const mysql = require('mysql2/promise.js'); 
  
const db = mysql.createConnection({
  host: '127.0.0.1', // database host
  user: 'serverUser', // database user
  password: 'password', // database password (if any)
  database: 'test', // your database name
});

 const addIndividualRegistration = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.addIndividualRegistration); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getIndividualRegistrations = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getIndividualRegistrations); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getIndividualRegistrationsByEventId = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getIndividualRegistrationsByEventId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getIndividualRegistrationsByCategoryId = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getIndividualRegistrationsByCategoryId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getIndividualRegistrationByAthleteId = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getIndividualRegistrationByAthleteId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getIndividualRegistrationsByRegistrationDate = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getIndividualRegistrationsByRegistrationDate); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getIndividualRegistrationsByStatus = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getIndividualRegistrationsByStatus); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getIndividualRegistrationsByCreatedAt = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getIndividualRegistrationsByCreatedAt); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};


 const getIndividualRegistrationsByUpdatedAt = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getIndividualRegistrationsUpdatedAt); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const deleteIndividualRegistration = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.deleteIndividualRegistration); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const updateIndividualRegistration = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.updateIndividualRegistration); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

module.exports = {
  addIndividualRegistration,

  getIndividualRegistrations,
  getIndividualRegistrationsByEventId,
  getIndividualRegistrationsByCategoryId,
  getIndividualRegistrationByAthleteId,
  getIndividualRegistrationsByRegistrationDate,
  getIndividualRegistrationsByStatus,
  getIndividualRegistrationsByCreatedAt,
  getIndividualRegistrationsByUpdatedAt,

  deleteIndividualRegistration,
  updateIndividualRegistration,

};
