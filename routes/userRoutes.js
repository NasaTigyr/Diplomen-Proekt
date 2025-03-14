// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// User profile routes
router.put('/profile', authMiddleware.isAuthenticated, uploadMiddleware.uploadProfilePicture, authController.updateProfile);

module.exports = router;
