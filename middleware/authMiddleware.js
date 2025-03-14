// middleware/authMiddleware.js
const db = global.db; // Access the database connection

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

exports.isCoach = (req, res, next) => {
  if (!req.session.user) {
    // For API requests, return 401 Unauthorized
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // For web routes, redirect to login
    return res.redirect('/login');
  }
  
  if (req.session.user.user_type !== 'coach') {
    // For API requests, return 403 Forbidden
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({ message: 'Only coaches can perform this action' });
    }
    
    // For web routes, redirect to become coach page
    return res.redirect('/becomeCoach');
  }
  
  next();
};

exports.isAthlete = (req, res, next) => {
  if (!req.session.user) {
    // For API requests, return 401 Unauthorized
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // For web routes, redirect to login
    return res.redirect('/login');
  }
  
  if (req.session.user.user_type !== 'athlete') {
    // For API requests, return 403 Forbidden
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({ message: 'Only athletes can perform this action' });
    }
    
    // For web routes, redirect to become athlete page
    return res.redirect('/becomeAthlete');
  }
  
  next();
};

exports.isEventCreator = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    // Using direct database query with prepared statement instead of model
    const [events] = await db.query(
      'SELECT * FROM events WHERE id = ? LIMIT 1',
      [req.params.id || req.params.eventId]
    );
    
    const event = events[0];
    
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

exports.isClubOwner = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    // Extract club ID from request
    const clubId = req.params.id || req.params.clubId || req.body.club_id;
    
    if (!clubId) {
      return res.status(400).json({ message: 'Club ID is required' });
    }
    
    // Check if the user is the coach of this club
    const [clubs] = await db.query(
      'SELECT * FROM clubs WHERE id = ? AND coach_id = ? LIMIT 1',
      [clubId, req.session.user.id]
    );
    
    if (clubs.length === 0) {
      return res.status(403).json({ 
        message: 'You are not authorized to manage this club' 
      });
    }
    
    // Add the club to the request for use in the controller
    req.club = clubs[0];
    next();
  } catch (error) {
    console.error('Error in isClubOwner middleware:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.isClubMember = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    // Extract club ID from request
    const clubId = req.params.id || req.params.clubId || req.body.club_id;
    
    if (!clubId) {
      return res.status(400).json({ message: 'Club ID is required' });
    }
    
    // Check if the user is a member of this club
    const [memberships] = await db.query(
      'SELECT * FROM club_athletes WHERE club_id = ? AND athlete_id = ? AND status = "active" LIMIT 1',
      [clubId, req.session.user.id]
    );
    
    if (memberships.length === 0) {
      return res.status(403).json({ 
        message: 'You are not a member of this club' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in isClubMember middleware:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
