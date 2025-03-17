// routes/clubRoutes.js
const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Club routes
router.get('/register', authMiddleware.isAuthenticated, (req, res) => {
  // Ensure user is authenticated but not already a coach
  if (req.session.user.user_type === 'coach') {
    return res.redirect('/myClub?error=' + encodeURIComponent('You are already registered as a coach'));
  }
  
  res.render('registerClub', { 
    user: req.session.user,
    currentPage: 'registerClub'
  });
});

router.post('/', 
  authMiddleware.isAuthenticated, 
  uploadMiddleware.clubUploads,  // You'll need to create this in your uploadMiddleware.js
  clubController.createClub
);

//forclub creation: 
router.get('/myClub', authMiddleware.isAuthenticated, authMiddleware.isCoach, clubController.getMyClub);

router.get('/:id', clubController.getClubById);
router.get('/coach/:coachId', clubController.getClubsByCoach);
router.get('/:id/athletes', authMiddleware.isAuthenticated, authMiddleware.isClubOwner, clubController.getClubAthletes);

// For club joining
router.post('/join', authMiddleware.isAuthenticated, clubController.joinClub);
router.put('/:id/athletes/:athleteId/approve', authMiddleware.isAuthenticated, authMiddleware.isClubOwner, clubController.approveAthlete);
router.put('/:id/athletes/:athleteId/reject', authMiddleware.isAuthenticated, authMiddleware.isClubOwner, clubController.rejectAthlete);

module.exports = router;
