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

 const getDraws = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getDraws); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getDrawId = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getDrawId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getDrawByCategoryId = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getDrawByCategoryId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getDrawsByStatus = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.getDrawsByStatus); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};




 const addDraw = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.addDraw); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const deleteDraw = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.deleteDraw); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const updateDraw = async (req, res) => { 
  try {
    const [rows] = await pool.query(queries.updateDraw); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

module.exports = {
  getDraws,

  getDrawId,
  getDrawByCategoryId,
  getDrawsByStatus,

  addDraw,
  deleteDraw,
  updateDraw
};
