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

 const getEvents = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getEvents); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getEventById = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getEventById); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getEventByName = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getEventByName); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getEventsByType = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getEventsByType); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const deleteEvent = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.deleteEvent); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const updateEvent = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.updateEvent); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getEventsByDate = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getEventsByDate); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const addEvent = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.addEvent); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
}

module.exports = {
  addEvent,

  getEvents,
  getEventById,
  getEventByName,
  getEventsByType,
  getEventsByDate,

  deleteEvent,
  updateEvent
};
