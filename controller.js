//import {queries}  from './users/queries.js';
const queries = require('./src/users/queries'); 
//import bcrypt from 'bcrypt';
const bcrypt = require('bcrypt'); 
//import mysql from 'mysql2/promise';
const mysql = require('mysql2/promise'); 

const jwt = require('jsonwebtoken'); 

const db = require('./db');

async function login(req, res) {
    
    const { email, password } = req.body;

    try {
        console.log("Received login request for email:", email);

        const userResult = await db.query(queries.getUserByEmail, [email]);

        const users = userResult[0]; 

        if (!users || users.length === 0) {
            console.error("No user found with the given email");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = users[0];
        console.log("User found:", user);

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            "your_jwt_secret", 
            { expiresIn: "3h" }
        );


        res.status(200).json({ message: "Logged in successfully", token, user: { id: user.id, email: user.email, name: user.name, role: user.role, family_name: user.family_name } });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const controller = {
    login,
};


module.exports = controller; 
