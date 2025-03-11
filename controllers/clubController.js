const db = require('../db');

exports.registerClub = async (req, res) => {
  try {
    const { name, description, registration_number } = req.body;
    const userId = req.session.user.id;
    
    // Validate input
    if (!name || !registration_number) {
      return res.status(400).json({ message: 'Club name and registration number are required' });
    }
    
    // Create roles and tables if they don't exist yet
    await createTablesIfNeeded();
    
    // Check if club with this registration number already exists
    const [existingClubs] = await db.promise().query(
      'SELECT * FROM clubs WHERE registration_number = ?',
      [registration_number]
    );
    
    if (existingClubs.length > 0) {
      return res.status(400).json({ message: 'A club with this registration number already exists' });
    }
    
    // Insert the club
    const [result] = await db.promise().query(
      'INSERT INTO clubs (name, description, registration_number) VALUES (?, ?, ?)',
      [name, description, registration_number]
    );
    
    const clubId = result.insertId;
    
    // Add user as club administrator
    await db.promise().query(
      'INSERT INTO club_administrators (user_id, club_id, is_primary) VALUES (?, ?, TRUE)',
      [userId, clubId]
    );
    
    // Get role ID for club_admin
    const [roles] = await db.promise().query('SELECT id FROM roles WHERE name = ?', ['club_admin']);
    if (roles.length > 0) {
      const roleId = roles[0].id;
      
      // Check if user already has the role
      const [existingRoles] = await db.promise().query(
        'SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?',
        [userId, roleId]
      );
      
      if (existingRoles.length === 0) {
        // Add club_admin role to user
        await db.promise().query(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, roleId]
        );
      }
    }
    
    res.status(201).json({ 
      message: 'Club registration submitted successfully. It will be reviewed by an administrator.',
      club: {
        id: clubId,
        name,
        description,
        registration_number,
        verification_status: 'pending'
      }
    });
  } catch (error) {
    console.error('Club registration error:', error);
    res.status(500).json({ message: 'Failed to register club' });
  }
};

exports.getClubById = async (req, res) => {
  try {
    const clubId = req.params.id;
    
    const [clubs] = await db.promise().query(
      'SELECT * FROM clubs WHERE id = ?',
      [clubId]
    );
    
    if (clubs.length === 0) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    res.status(200).json(clubs[0]);
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ message: 'Failed to fetch club' });
  }
};

exports.getUserClubs = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    const [clubs] = await db.promise().query(
      `SELECT c.* FROM clubs c
       JOIN club_administrators ca ON c.id = ca.club_id
       WHERE ca.user_id = ?`,
      [userId]
    );
    
    res.status(200).json(clubs);
  } catch (error) {
    console.error('Error fetching user clubs:', error);
    res.status(500).json({ message: 'Failed to fetch clubs' });
  }
};

exports.verifyClub = async (req, res) => {
  try {
    const clubId = req.params.id;
    const { status } = req.body; // 'verified' or 'rejected'
    
    if (status !== 'verified' && status !== 'rejected') {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    await db.promise().query(
      'UPDATE clubs SET verification_status = ?, verification_date = NOW() WHERE id = ?',
      [status, clubId]
    );
    
    res.status(200).json({ message: `Club ${status}` });
  } catch (error) {
    console.error('Error verifying club:', error);
    res.status(500).json({ message: 'Failed to verify club' });
  }
};

// Helper function to create required tables if they don't exist
async function createTablesIfNeeded() {
  try {
    // Check if roles table exists
    const [tables] = await db.promise().query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'roles'
    `);
    
    if (tables.length === 0) {
      // Create roles table
      await db.promise().query(`
        CREATE TABLE roles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL
        )
      `);
      
      // Insert basic roles
      await db.promise().query(`
        INSERT INTO roles (name) VALUES ('user'), ('club_admin'), ('site_admin')
      `);
      
      // Create user_roles table
      await db.promise().query(`
        CREATE TABLE user_roles (
          user_id INT NOT NULL,
          role_id INT NOT NULL,
          PRIMARY KEY (user_id, role_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
        )
      `);
      
      // Create clubs table
      await db.promise().query(`
        CREATE TABLE clubs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          registration_number VARCHAR(50) UNIQUE,
          verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
          verification_date DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      // Create club administrators table
      await db.promise().query(`
        CREATE TABLE club_administrators (
          user_id INT NOT NULL,
          club_id INT NOT NULL,
          is_primary BOOLEAN DEFAULT FALSE,
          PRIMARY KEY (user_id, club_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
        )
      `);
      
      console.log('Created club-related tables');
    }
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}
