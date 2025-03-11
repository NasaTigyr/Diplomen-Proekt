// middleware/authMiddleware.js
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    // User is authenticated, proceed to next middleware
    return next();
  }
  
  // For API requests, return 401 Unauthorized
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // For web routes, redirect to login
  return res.redirect('/login');
};

exports.isEventCreator = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const Event = require('../models/Event');
    const event = await Event.findById(req.params.id || req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.creator_id !== req.session.user.id) {
      return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }
    
    next();
  } catch (error) {
    console.error('Error in isEventCreator middleware:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
