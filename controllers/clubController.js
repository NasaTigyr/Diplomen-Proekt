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
