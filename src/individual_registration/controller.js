// src/individual_registration/controller.js
const queries = require('./queries');
const db = require('../../db');

async function registerForCategory(req, res) {
  try {
    const { categoryId } = req.body;
    const userId = req.session.user.id;
    
    // First, get the category details to check max participants
    const [categoryData] = await db.query(
      'SELECT c.*, event_id FROM categories c WHERE id = ?',
      [categoryId]
    );
    
    if (!categoryData || categoryData.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const category = categoryData[0];
    const eventId = category.event_id;
    
    // Check if category has max_participants defined
    if (category.max_participants) {
      // Get current approved participant count for this category
      const [participantCount] = await db.query(
        'SELECT COUNT(*) as count FROM individual_registrations WHERE category_id = ? AND status = "approved"',
        [categoryId]
      );
      
      // Check if category is already full
      if (participantCount[0].count >= category.max_participants) {
        return res.status(400).json({ error: 'This category is full, registration is closed' });
      }
    }
    
    // Check if already registered
    const [existingReg] = await db.query(
      'SELECT * FROM individual_registrations WHERE category_id = ? AND athlete_id = ?',
      [categoryId, userId]
    );
    
    if (existingReg.length > 0) {
      return res.status(400).json({ error: 'Already registered for this category' });
    }
    
    // Create registration with event_id
    const [result] = await db.query(
      'INSERT INTO individual_registrations (event_id, category_id, athlete_id, status, registration_date) VALUES (?, ?, ?, ?, ?)',
      [eventId, categoryId, userId, 'pending', new Date()]
    );
    
    // Get the new registration
    const [newReg] = await db.query(
      'SELECT * FROM individual_registrations WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newReg[0]);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
}

async function cancelRegistration(req, res) {
  try {
    const { registrationId } = req.body;
    
    // Check if registration exists and belongs to user
    const [regCheck] = await db.query(
      'SELECT * FROM individual_registrations WHERE id = ? AND athlete_id = ?',
      [registrationId, req.session.user.id]
    );
    
    if (regCheck.length === 0) {
      return res.status(404).json({ error: 'Registration not found or unauthorized' });
    }
    
    // Delete registration
    await db.query('DELETE FROM individual_registrations WHERE id = ?', [registrationId]);
    
    res.json({ success: true, message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(500).json({ error: error.message });
  }
}

// src/individual_registration/controller.js (continued)
async function getRegistrationById(registrationId) {
  try {
    // Validate registrationId
    if (isNaN(parseInt(registrationId))) {
      throw new Error("Invalid registration ID");
    }
    
    // Fetch registration
    const [rows] = await db.query(
      queries.getIndividualRegistrationById,
      [registrationId]
    );
    
    if (rows.length === 0) {
      return null; // No registration found
    }
    
    return rows[0]; // Return registration details
  } catch (error) {
    console.error("Error in getRegistrationById:", error);
    throw error;
  }
}

async function getUserRegistrations(userId) {
    try {
        // Validate userId
        if (isNaN(parseInt(userId))) {
            throw new Error("Invalid user ID");
        }
        
        // Fetch registrations with event and category details
        const [rows] = await db.query(`
            SELECT 
                ir.id, 
                ir.event_id, 
                ir.category_id, 
                ir.status, 
                ir.registration_date,
                e.name as event_name,
                e.start_date,
                e.banner_image,
                c.name as category_name
            FROM individual_registrations ir
            JOIN events e ON ir.event_id = e.id
            JOIN categories c ON ir.category_id = c.id
            WHERE ir.athlete_id = ?
            ORDER BY ir.registration_date DESC
        `, [userId]);
        
        return rows;
    } catch (error) {
        console.error("Error in getUserRegistrations:", error);
        throw error;
    }
}

async function registerUserForCategory(userId, categoryId) {
  try {
    // Validate inputs
    if (isNaN(parseInt(userId)) || isNaN(parseInt(categoryId))) {
      throw new Error("Invalid user ID or category ID");
    }
    
    // Get user details
    const [userData] = await db.query(
      "SELECT id, gender, date_of_birth FROM users WHERE id = ?",
      [userId]
    );
    
    if (!userData || userData.length === 0) {
      throw new Error("User not found");
    }
    
    const user = userData[0];
    
    // Calculate user's age
    const birthDate = new Date(user.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Get category details
    const [categoryData] = await db.query(
      "SELECT * FROM categories WHERE id = ?",
      [categoryId]
    );
    
    if (!categoryData || categoryData.length === 0) {
      throw new Error("Category not found");
    }
    
    const category = categoryData[0];
    
    // Gender validation
    if (category.gender !== 'mixed' && category.gender !== user.gender) {
      throw new Error(`This category is only for ${category.gender} participants`);
    }
    
    // Age group validation logic
    const ageGroupRestrictions = {
      'under_8': { minAge: 0, maxAge: 7 },
      'under_12': { minAge: 8, maxAge: 11 },
      'under_14': { minAge: 12, maxAge: 13 },
      'under_16': { minAge: 14, maxAge: 15 }, // Cadet
      'under_18': { minAge: 16, maxAge: 17 }, // Junior
      'under_21': { minAge: 18, maxAge: 20 },
      'senior': { minAge: 21, maxAge: 100 }
    };
    
    // Check if the age falls exactly within the category
    const restriction = ageGroupRestrictions[category.age_group];
    if (!restriction || age < restriction.minAge || age > restriction.maxAge) {
      throw new Error(`You are not eligible for the ${category.age_group} age group`);
    }
    
    // Get category details to check max participants
    const [eventData] = await db.query(
      "SELECT * FROM events WHERE id = ?",
      [category.event_id]
    );
    
    if (!eventData || eventData.length === 0) {
      throw new Error("Event not found");
    }
    
    const event = eventData[0];
    
    // Check if category has max_participants defined
    if (category.max_participants) {
      // Get current approved participant count for this category
      const [participantCount] = await db.query(
        "SELECT COUNT(*) as count FROM individual_registrations WHERE category_id = ? AND status = 'approved'",
        [categoryId]
      );
      
      // Check if category is already full
      if (participantCount[0].count >= category.max_participants) {
        throw new Error("This category is full. Registration is closed until space becomes available.");
      }
    }
    
    // Check if already registered
    const [existingReg] = await db.query(
      "SELECT * FROM individual_registrations WHERE athlete_id = ? AND category_id = ?",
      [userId, categoryId]
    );
    
    if (existingReg.length > 0) {
      throw new Error("Already registered for this category");
    }
    
    // Create registration record
    const currentDate = new Date();
    const [result] = await db.query(
      "INSERT INTO individual_registrations (event_id, athlete_id, category_id, status, registration_date) VALUES (?, ?, ?, ?, ?)",
      [category.event_id, userId, categoryId, "pending", currentDate]
    );
    
    // Get the newly created registration
    const [newReg] = await db.query(
      "SELECT * FROM individual_registrations WHERE id = ?",
      [result.insertId]
    );
    
    return newReg[0]; // Return the new registration
  } catch (error) {
    console.error("Error in registerUserForCategory:", error);
    throw error;
  }
}

async function getEventRegistrations(eventId, userId) {
  try {
    // Verify user is the event creator
    const [eventResult] = await db.query("SELECT * FROM events WHERE id = ?", [eventId]);
    const event = eventResult[0];
    
    if (!event || event.creator_id != userId) {
      throw new Error('Not authorized to view these registrations');
    }
    
    // Get all registrations for the event with user details
    const [registrations] = await db.query(`
      SELECT 
        r.id, 
        r.event_id,
        r.category_id,
        r.athlete_id,
        r.status, 
        r.registration_date,
        c.name as category_name, 
        c.age_group,
        c.gender,
        u.first_name, 
        u.last_name, 
        u.email 
      FROM individual_registrations r
      JOIN categories c ON r.category_id = c.id
      JOIN users u ON r.athlete_id = u.id
      WHERE r.event_id = ?
      ORDER BY 
        c.name ASC,
        FIELD(r.status, 'approved', 'pending', 'rejected'),
        r.registration_date ASC
    `, [eventId]);
    
    return registrations;
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }
}

async function updateRegistrationStatus(registrationId, status, userId) {
  try {
    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new Error('Invalid status value');
    }
    
    // Get registration details first to check permissions
    const [registrationDetails] = await db.query(`
      SELECT r.*, e.creator_id, c.id as category_id, c.max_participants
      FROM individual_registrations r
      JOIN events e ON r.event_id = e.id
      JOIN categories c ON r.category_id = c.id
      WHERE r.id = ?
    `, [registrationId]);
    
    if (!registrationDetails || registrationDetails.length === 0) {
      throw new Error('Registration not found');
    }
    
    const registration = registrationDetails[0];
    
    // Verify user is the event creator
    if (registration.creator_id != userId) {
      throw new Error('Not authorized to update this registration');
    }
    
    // If changing to approved, check if the category is at max capacity
    if (status === 'approved' && registration.max_participants) {
      // Get current approved count
      const [approvedCountResult] = await db.query(`
        SELECT COUNT(*) as count 
        FROM individual_registrations 
        WHERE category_id = ? AND status = 'approved'
      `, [registration.category_id]);
      
      const currentApprovedCount = approvedCountResult[0].count;
      
      // Check if we're already at or over the max (shouldn't exceed but checking anyway)
      if (currentApprovedCount >= registration.max_participants) {
        throw new Error('Category is already at maximum capacity. Remove an approved registration first.');
      }
    }
    
    // Update the registration status
    await db.query(queries.updateIndividualRegistrationStatus, 
      [status, registrationId]
    );
    
    return { success: true, message: 'Registration status updated' };
  } catch (error) {
    console.error('Error updating registration status:', error);
    throw error;
  }
}

// Export functions
module.exports = {
    registerForCategory,
    cancelRegistration,
    getRegistrationById,
    getUserRegistrations,
    registerUserForCategory,
    getEventRegistrations,
    updateRegistrationStatus,
    // Include original registration controller functions
    addIndividualRegistration: async (req, res) => { 
        try {
            const [rows] = await db.query(queries.addIndividualRegistration); 
            res.json(rows); 
        } catch (error) {
            res.status(500).json({error: error.message }); 
        }
    },
    getIndividualRegistrations: async (req, res) => { 
        try {
            const [rows] = await db.query(queries.getIndividualRegistrations); 
            res.json(rows); 
        } catch (error) {
            res.status(500).json({error: error.message }); 
        }
    },
    getIndividualRegistrationsByEventId: async (req, res) => { 
        try {
            const eventId = req.params.eventId;
            const [rows] = await db.query(queries.getIndividualRegistrationsByEventId, [eventId]); 
            res.json(rows); 
        } catch (error) {
            res.status(500).json({error: error.message }); 
        }
    }
};
