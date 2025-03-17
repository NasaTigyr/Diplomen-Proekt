// controllers/clubController.js

const db = global.db; // Access the database connection

exports.createClub = async (req, res) => {
  try {
    const { name, description, logo, address } = req.body;
    
    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({ message: 'Club name and address are required' });
    }
    
    // Insert into database
    const [result] = await db.query(
      'INSERT INTO clubs (name, description, logo, coach_id, address) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, logo || null, req.session.user.id, address]
    );
    
    res.status(201).json({ 
      message: 'Club created successfully', 
      clubId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({ message: 'Failed to create club' });
  }
};

exports.getAllClubs = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        
        let query = `
            SELECT c.*, u.first_name, u.last_name 
            FROM clubs c
            LEFT JOIN users u ON c.coach_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (searchTerm) {
            query += ` AND (c.name LIKE ? OR c.address LIKE ?)`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }
        
        const [clubs] = await db.query(query, params);
        
        res.json(clubs);
    } catch (error) {
        console.error('Error fetching clubs:', error);
        res.status(500).json({ message: 'Failed to retrieve clubs' });
    }
};

exports.getClubById = async (req, res) => {
  try {
    const [clubs] = await db.query(
      'SELECT * FROM clubs WHERE id = ?',
      [req.params.id]
    );
    
    if (clubs.length === 0) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    res.status(200).json(clubs[0]);
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getClubsByCoach = async (req, res) => {
  try {
    const [clubs] = await db.query(
      'SELECT * FROM clubs WHERE coach_id = ?',
      [req.params.coachId]
    );
    
    res.status(200).json(clubs);
  } catch (error) {
    console.error('Error fetching coach clubs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get my club (for logged in coach)
exports.getMyClub = async (req, res) => {
    try {
        const coachId = req.session.user.id;
        
        const [clubs] = await db.query(
            `SELECT c.*, COUNT(cm.id) as member_count
             FROM clubs c
             LEFT JOIN club_members cm ON c.id = cm.club_id AND cm.status = 'active'
             WHERE c.coach_id = ?
             GROUP BY c.id`,
            [coachId]
        );
        
        if (clubs.length === 0) {
            return res.render('myClub', { 
                user: req.session.user,
                currentPage: 'myClub',
                club: null,
                pendingMembers: [],
                error: 'You do not have a club yet'
            });
        }
        
        const club = clubs[0];
        
        // Get pending membership requests
        const [pendingMembers] = await db.query(
            `SELECT cm.id as membership_id, u.id, u.first_name, u.last_name, u.email, u.gender, u.date_of_birth, u.profile_picture, cm.created_at as request_date
             FROM club_members cm
             JOIN users u ON cm.user_id = u.id
             WHERE cm.club_id = ? AND cm.status = 'pending'
             ORDER BY cm.created_at DESC`,
            [club.id]
        );
        
        res.render('myClub', {
            user: req.session.user,
            currentPage: 'myClub',
            club: club,
            pendingMembers: pendingMembers
        });
    } catch (error) {
        console.error('Error fetching coach club:', error);
        res.status(500).render('error', { message: 'Failed to retrieve club data' });
    }
};

// Get club athletes
exports.getClubAthletes = async (req, res) => {
    try {
        const clubId = req.params.id;
        
        const [athletes] = await db.query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.gender, 
                   u.date_of_birth, u.profile_picture, cm.status, cm.id as membership_id
             FROM club_members cm
             JOIN users u ON cm.user_id = u.id
             WHERE cm.club_id = ?
             ORDER BY cm.status, u.first_name, u.last_name`,
            [clubId]
        );
        
        res.json(athletes);
    } catch (error) {
        console.error('Error fetching club athletes:', error);
        res.status(500).json({ message: 'Failed to retrieve athletes' });
    }
};

// Join club request
exports.joinClub = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { club_id } = req.body;
        
        // Check if user is already a member of any club
        const [existingMembership] = await db.query(
            'SELECT * FROM club_members WHERE user_id = ?',
            [userId]
        );
        
        if (existingMembership.length > 0) {
            return res.status(400).json({ message: 'You are already a member of a club' });
        }
        
        // Create membership with pending status
        const [result] = await db.query(
            'INSERT INTO club_members (club_id, user_id, status, joined_date) VALUES (?, ?, "pending", NOW())',
            [club_id, userId]
        );
        
        // Update user type to athlete
        await db.query(
            'UPDATE users SET user_type = "athlete" WHERE id = ?',
            [userId]
        );
        
        // Update session
        req.session.user.user_type = 'athlete';
        
        res.status(201).json({ message: 'Join request sent successfully' });
    } catch (error) {
        console.error('Error joining club:', error);
        res.status(500).json({ message: 'Failed to join club' });
    }
};

// Approve athlete membership
exports.approveAthlete = async (req, res) => {
    try {
        const clubId = req.params.id;
        const athleteId = req.params.athleteId;
        
        // Update membership to active
        await db.query(
            'UPDATE club_members SET status = "active", joined_date = NOW() WHERE club_id = ? AND user_id = ? AND status = "pending"',
            [clubId, athleteId]
        );
        
        res.json({ message: 'Athlete approved successfully' });
    } catch (error) {
        console.error('Error approving athlete:', error);
        res.status(500).json({ message: 'Failed to approve athlete' });
    }
};

// Reject athlete membership
exports.rejectAthlete = async (req, res) => {
    try {
        const clubId = req.params.id;
        const athleteId = req.params.athleteId;
        
        // Update membership to rejected
        await db.query(
            'UPDATE club_members SET status = "rejected" WHERE club_id = ? AND user_id = ? AND status = "pending"',
            [clubId, athleteId]
        );
        
        res.json({ message: 'Athlete rejected successfully' });
    } catch (error) {
        console.error('Error rejecting athlete:', error);
        res.status(500).json({ message: 'Failed to reject athlete' });
    }
};

// Get club statistics
exports.getClubStatistics = async (req, res) => {
    try {
        const clubId = req.params.id;
        
        // Get number of athletes
        const [athletesCount] = await db.query(
            'SELECT COUNT(*) as count FROM club_members WHERE club_id = ? AND status = "active"',
            [clubId]
        );
        
        // Get number of events
        const [eventsCount] = await db.query(
            'SELECT COUNT(*) as count FROM events WHERE club_id = ?',
            [clubId]
        );
        
        // Get number of competition registrations
        const [competitionsCount] = await db.query(
            `SELECT COUNT(*) as count FROM registrations r
             JOIN events e ON r.event_id = e.id
             WHERE e.club_id = ?`,
            [clubId]
        );
        
        res.json({
            athletesCount: athletesCount[0].count,
            eventsCount: eventsCount[0].count,
            competitionsCount: competitionsCount[0].count
        });
    } catch (error) {
        console.error('Error fetching club statistics:', error);
        res.status(500).json({ message: 'Failed to retrieve club statistics' });
    }
};

