const db = require('../db');

exports.getCategoriesByEventId = (req, res) => {
  const eventId = req.params.eventId;

  db.query('SELECT * FROM categories WHERE event_id = ?', [eventId], (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ message: 'Failed to fetch categories' });
    }
    
    res.status(200).json(results);
  });
};

exports.createCategory = (req, res) => {
  const { event_id, name, description, max_participants } = req.body;
  
  // Validate required fields
  if (!event_id || !name) {
    return res.status(400).json({ message: 'Event ID and name are required' });
  }
  
  // Check if the event exists and belongs to the user
  db.query('SELECT * FROM events WHERE id = ?', [event_id], (err, results) => {
    if (err) {
      console.error('Error fetching event:', err);
      return res.status(500).json({ message: 'Failed to create category' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = results[0];
    if (event.creator_id !== req.session.user.id) {
      return res.status(403).json({ message: 'You are not authorized to add categories to this event' });
    }

    // Create the category
    const categoryData = {
      event_id,
      name,
      description,
      max_participants: max_participants || null
    };

    db.query('INSERT INTO categories SET ?', categoryData, (err, result) => {
      if (err) {
        console.error('Error creating category:', err);
        return res.status(500).json({ message: 'Failed to create category' });
      }
      
      // Return the created category
      categoryData.id = result.insertId;
      res.status(201).json(categoryData);
    });
  });
};

exports.updateCategory = (req, res) => {
  const categoryId = req.params.id;
  const { name, description, max_participants } = req.body;

  // First, check if the category exists
  db.query(
    `SELECT c.*, e.creator_id 
     FROM categories c 
     JOIN events e ON c.event_id = e.id 
     WHERE c.id = ?`, 
    [categoryId], 
    (err, results) => {
      if (err) {
        console.error('Error fetching category:', err);
        return res.status(500).json({ message: 'Failed to update category' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }

      const category = results[0];
      
      // Check if the user is the event creator
      if (category.creator_id !== req.session.user.id) {
        return res.status(403).json({ message: 'You are not authorized to update this category' });
      }

      // Update the category
      const categoryData = {
        name: name || category.name,
        description: description !== undefined ? description : category.description,
        max_participants: max_participants !== undefined ? max_participants : category.max_participants
      };

      db.query('UPDATE categories SET ? WHERE id = ?', [categoryData, categoryId], (err, result) => {
        if (err) {
          console.error('Error updating category:', err);
          return res.status(500).json({ message: 'Failed to update category' });
        }

        res.status(200).json({ 
          id: categoryId, 
          event_id: category.event_id,
          ...categoryData 
        });
      });
    }
  );
};

exports.deleteCategory = (req, res) => {
  const categoryId = req.params.id;

  // First, check if the category exists
  db.query(
    `SELECT c.*, e.creator_id 
     FROM categories c 
     JOIN events e ON c.event_id = e.id 
     WHERE c.id = ?`, 
    [categoryId], 
    (err, results) => {
      if (err) {
        console.error('Error fetching category:', err);
        return res.status(500).json({ message: 'Failed to delete category' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }

      const category = results[0];
      
      // Check if the user is the event creator
      if (category.creator_id !== req.session.user.id) {
        return res.status(403).json({ message: 'You are not authorized to delete this category' });
      }

      // Delete the category
      db.query('DELETE FROM categories WHERE id = ?', [categoryId], (err, result) => {
        if (err) {
          console.error('Error deleting category:', err);
          return res.status(500).json({ message: 'Failed to delete category' });
        }

        res.status(204).send();
      });
    }
  );
};
