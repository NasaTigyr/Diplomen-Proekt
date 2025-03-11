const db = require('../db');

exports.getRegistrationsByCategoryId = (req, res) => {
  const categoryId = req.params.categoryId;

  db.query(
    `SELECT r.*, u.username, u.full_name
     FROM registrations r
     JOIN users u ON r.user_id = u.id
     WHERE r.category_id = ?`,
    [categoryId],
    (err, results) => {
      if (err) {
        console.error('Error fetching registrations:', err);
        return res.status(500).json({ message: 'Failed to fetch registrations' });
      }
      
      res.status(200).json(results);
    }
  );
};

exports.createRegistration = (req, res) => {
  const { category_id } = req.body;
  const user_id = req.session.user.id;
  
  // Validate required fields
  if (!category_id) {
    return res.status(400).json({ message: 'Category ID is required' });
  }
  
  // Check if category exists
  db.query('SELECT * FROM categories WHERE id = ?', [category_id], (err, results) => {
    if (err) {
      console.error('Error fetching category:', err);
      return res.status(500).json({ message: 'Failed to register' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const category = results[0];
    
    // Check if registration period is open
    db.query('SELECT * FROM events WHERE id = ?', [category.event_id], (err, eventResults) => {
      if (err) {
        console.error('Error fetching event:', err);
        return res.status(500).json({ message: 'Failed to register' });
      }

      const event = eventResults[0];
      const now = new Date();
      const registrationOpenDate = new Date(event.registration_open_date);
      const registrationCloseDate = new Date(event.registration_close_date);

      if (now < registrationOpenDate) {
        return res.status(400).json({ message: 'Registration has not opened yet' });
      }

      if (now > registrationCloseDate) {
        return res.status(400).json({ message: 'Registration period has ended' });
      }

      // Check if user is already registered
      db.query(
        'SELECT * FROM registrations WHERE user_id = ? AND category_id = ?',
        [user_id, category_id],
        (err, regResults) => {
          if (err) {
            console.error('Error checking existing registration:', err);
            return res.status(500).json({ message: 'Failed to register' });
          }

          if (regResults.length > 0) {
            return res.status(400).json({ message: 'You are already registered for this category' });
          }

          // Check if category has reached max participants
          if (category.max_participants) {
            db.query(
              'SELECT COUNT(*) as count FROM registrations WHERE category_id = ?',
              [category_id],
              (err, countResults) => {
                if (err) {
                  console.error('Error counting registrations:', err);
                  return res.status(500).json({ message: 'Failed to register' });
                }

                const count = countResults[0].count;
                if (count >= category.max_participants) {
                  return res.status(400).json({ message: 'This category has reached maximum number of participants' });
                }

                // Create the registration
                createRegistrationRecord(user_id, category_id, res);
              }
            );
          } else {
            // Create the registration
            createRegistrationRecord(user_id, category_id, res);
          }
        }
      );
    });
  });
};

function createRegistrationRecord(user_id, category_id, res) {
  const registrationData = {
    user_id,
    category_id,
    status: 'pending'
  };

  db.query('INSERT INTO registrations SET ?', registrationData, (err, result) => {
    if (err) {
      console.error('Error creating registration:', err);
      return res.status(500).json({ message: 'Failed to register' });
    }
    
    // Return the created registration
    registrationData.id = result.insertId;
    registrationData.registration_date = new Date();
    res.status(201).json(registrationData);
  });
}

exports.updateRegistration = (req, res) => {
  const registrationId = req.params.id;
  const { status } = req.body;

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Valid status (pending, approved, rejected) is required' });
  }

  // First, check if the registration exists
  db.query(
    `SELECT r.*, c.event_id, e.creator_id 
     FROM registrations r 
     JOIN categories c ON r.category_id = c.id 
     JOIN events e ON c.event_id = e.id 
     WHERE r.id = ?`, 
    [registrationId], 
    (err, results) => {
      if (err) {
        console.error('Error fetching registration:', err);
        return res.status(500).json({ message: 'Failed to update registration' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      const registration = results[0];
      
      // Check if the user is the event creator (only they can approve/reject)
      if (registration.creator_id !== req.session.user.id) {
        return res.status(403).json({ message: 'You are not authorized to update this registration' });
      }

      // Update the registration
      db.query(
        'UPDATE registrations SET status = ? WHERE id = ?', 
        [status, registrationId], 
        (err, result) => {
          if (err) {
            console.error('Error updating registration:', err);
            return res.status(500).json({ message: 'Failed to update registration' });
          }

          res.status(200).json({ 
            id: registrationId, 
            user_id: registration.user_id,
            category_id: registration.category_id,
            status,
            registration_date: registration.registration_date
          });
        }
      );
    }
  );
};

exports.deleteRegistration = (req, res) => {
  const registrationId = req.params.id;
  const userId = req.session.user.id;

  // Check if the registration exists
  db.query('SELECT * FROM registrations WHERE id = ?', [registrationId], (err, results) => {
    if (err) {
      console.error('Error fetching registration:', err);
      return res.status(500).json({ message: 'Failed to delete registration' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const registration = results[0];
    
    // Check if the user owns this registration
    if (registration.user_id !== userId) {
      // Check if user is event creator
      db.query(
        `SELECT e.creator_id 
         FROM events e 
         JOIN categories c ON e.id = c.event_id 
         WHERE c.id = ?`, 
        [registration.category_id], 
        (err, eventResults) => {
          if (err) {
            console.error('Error fetching event:', err);
            return res.status(500).json({ message: 'Failed to delete registration' });
          }

          if (eventResults.length === 0 || eventResults[0].creator_id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this registration' });
          }

          // Delete the registration
          performDelete(registrationId, res);
        }
      );
    } else {
      // Delete the registration
      performDelete(registrationId, res);
    }
  });
};

function performDelete(registrationId, res) {
  db.query('DELETE FROM registrations WHERE id = ?', [registrationId], (err, result) => {
    if (err) {
      console.error('Error deleting registration:', err);
      return res.status(500).json({ message: 'Failed to delete registration' });
    }

    res.status(204).send();
  });
}

exports.getUserRegistrations = (req, res) => {
  const userId = req.session.user.id;

  db.query(
    `SELECT r.*, c.name as category_name, e.title as event_title, e.event_date
     FROM registrations r
     JOIN categories c ON r.category_id = c.id
     JOIN events e ON c.event_id = e.id
     WHERE r.user_id = ?
     ORDER BY r.registration_date DESC`,
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching user registrations:', err);
        return res.status(500).json({ message: 'Failed to fetch registrations' });
      }
      
      res.status(200).json(results);
    }
  );
};
