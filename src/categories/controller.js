// src/categories/controller.js
const queries = require('./queries');
const db = require('../../db');

async function addCategory(req, res) {
  try {
    const eventId = req.params.eventId;
    const { name, description, age_group, gender, max_participants, weight_class, rules, fee, status } = req.body;
    
    // Validate required fields
    if (!name || !age_group || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate event exists and user is authorized
    const [eventResult] = await db.query("SELECT * FROM events WHERE id = ?", [eventId]);
    const event = eventResult[0];
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (parseInt(event.creator_id) !== parseInt(req.session.user.id)) {
      return res.status(403).json({ error: 'Not authorized to modify this event' });
    }
    
    // Enhanced description to store additional fields
    let enhancedDescription = description || '';
    
    // Collect additional fields
    const additionalFields = [];
    
    if (weight_class) {
      additionalFields.push(`Weight Class: ${weight_class}`);
    }
    
    if (rules) {
      additionalFields.push(`Special Rules: ${rules}`);
    }
    
    if (fee) {
      additionalFields.push(`Registration Fee: $${parseFloat(fee).toFixed(2)}`);
    }
    
    if (status && status !== 'active') {
      additionalFields.push(`Status: ${status}`);
    }
    
    // Append additional fields to description
    if (additionalFields.length > 0) {
      enhancedDescription += (enhancedDescription ? '\n\n' : '') + 
        additionalFields.join('\n\n');
    }
    
    // Current timestamp
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Add category to database
    const [result] = await db.query(
      queries.addCategory,
      [
        eventId,
        name,
        age_group,
        gender,
        enhancedDescription,
        max_participants || null,
        null, // draw_file_path
        currentDate,
        currentDate
      ]
    );
    
// After you execute the query, add:
console.log(`New category created with ID: ${result.insertId} for event ${eventId}`);
    // Return success response with new category ID
    res.status(201).json({ 
      success: true,
      id: result.insertId,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
}

async function updateCategory(req, res) {
  try {
    const categoryId = req.params.categoryId;
    const { name, description, age_group, gender, max_participants, weight_class, rules, fee, status } = req.body;
    
    // Validate required fields
    if (!name || !age_group || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get the category to check authorization
    const [categoryResult] = await db.query(
      'SELECT c.*, e.creator_id FROM categories c JOIN events e ON c.event_id = e.id WHERE c.id = ?',
      [categoryId]
    );
    
    if (!categoryResult || categoryResult.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const category = categoryResult[0];
    
    // Check if user is authorized to update this category
    if (parseInt(category.creator_id) !== parseInt(req.session.user.id)) {
      return res.status(403).json({ error: 'Not authorized to modify this category' });
    }
    
    // Enhanced description to store additional fields
    let enhancedDescription = description || '';
    
    // Collect additional fields
    const additionalFields = [];
    
    if (weight_class) {
      additionalFields.push(`Weight Class: ${weight_class}`);
    }
    
    if (rules) {
      additionalFields.push(`Special Rules: ${rules}`);
    }
    
    if (fee) {
      additionalFields.push(`Registration Fee: $${parseFloat(fee).toFixed(2)}`);
    }
    
    if (status && status !== 'active') {
      additionalFields.push(`Status: ${status}`);
    }
    
    // Append additional fields to description
    if (additionalFields.length > 0) {
      enhancedDescription += (enhancedDescription ? '\n\n' : '') + 
        additionalFields.join('\n\n');
    }
    
    // Current timestamp
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Update category in database
    await db.query(
      queries.updateCategory,
      [
        name,
        age_group,
        gender,
        enhancedDescription,
        max_participants || null,
        currentDate,
        categoryId
      ]
    );
    
    // Return success response
    res.json({ 
      success: true,
      id: parseInt(categoryId),
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
}

async function deleteCategory(req, res) {
  try {
    const categoryId = req.params.categoryId;
    
    // Get the category to check authorization
    const [categoryResult] = await db.query(
      'SELECT c.*, e.creator_id FROM categories c JOIN events e ON c.event_id = e.id WHERE c.id = ?',
      [categoryId]
    );
    
    if (!categoryResult || categoryResult.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const category = categoryResult[0];
    
    // Check if user is authorized to delete this category
    if (parseInt(category.creator_id) !== parseInt(req.session.user.id)) {
      return res.status(403).json({ error: 'Not authorized to delete this category' });
    }
    
    // Delete the category
    await db.query(queries.deleteCategory, [categoryId]);
    
    // Return success response
    res.json({ 
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

async function getCategoriesByEventId(eventId) {
  try {
    // Validate eventId
    if (isNaN(parseInt(eventId))) {
      throw new Error("Invalid event ID");
    }
    
    // Fetch categories from database
    const [rows] = await db.query(
      queries.getCategoriesByEventId,
      [eventId]
    );
    
    return rows; // Return all categories
  } catch (error) {
    console.error("Error in getCategoriesByEventId:", error);
    throw error;
  }
}

// Export functions
module.exports = {
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByEventId,
    // Include original category controller functions
    getCategories: async (req, res) => { 
        try {
            console.log('Query being executed:', queries.getCategories);
            const [rows] = await db.query(queries.getCategories);
            console.log('Rows:', rows);
            res.json(rows); 
        } catch (error) {
            console.error('Error in getCategories: ', error); 
            res.status(500).json({error: error.message }); 
        }
    },
    getCategoryById: async (req, res) => { 
        try {
            const categoryId = req.params.id;
            const [rows] = await db.query(queries.getCategoryById, [categoryId]); 
            res.json(rows); 
        } catch (error) {
            res.status(500).json({error: error.message }); 
        }
    }
};
