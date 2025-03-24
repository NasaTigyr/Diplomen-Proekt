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

 const getCategories = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getCategories); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    console.error('Error in getCategories: ', error); 
    res.status(500).json({error: error.message }); 
  }
};

 const getCategoryById= async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getCategoryById); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getCategoriesByEventId = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getCategoriesByEventId); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getCategoryByName = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getCategoryByName); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getCategoriesByGender = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getCategoriesByGender); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getCategoriesByAge = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getCategoriesByAge); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const getCategoriesByDescription = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.getCategoriesByDescription); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const addCategory = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.addCategory); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const deleteCategory = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.deleteCategory); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

 const updateCategory = async (req, res) => { 
  try {
    const [rows] = await db.query(queries.updateCategory); 
    console.log(rows); 
    res.json(rows); 
  }catch (error) {
    res.status(500).json({error: error.message }); 
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  getCategoriesByEventId,
  getCategoryByName,
  getCategoriesByGender,
  getCategoriesByAge,
  getCategoriesByDescription,
  addCategory,
  deleteCategory,
  updateCategory
};
