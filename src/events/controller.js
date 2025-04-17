// src/events/controller.js
const queries = require('./queries');
const db = require('../../db');
const fs = require('fs');
const path = require('path');
const categoryQueries = require('../categories/queries');

async function createEvent(req, res) {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).json({ message: 'You must be logged in to create an event' });
    }
    
    console.log('User is authenticated');
    console.log('Account type:', req.session.user.user_type);
    
    // Check if user is a coach
    if (req.session.user.user_type !== 'coach') {
      return res.status(401).json({ message: 'You must be a coach to be able to create an event' });
    }
    
    console.log('User has coach privileges');
    
    // Extract event data from request body
    const {
      name,
      description,
      address,
      event_type,
      start_date,
      end_date,
      registration_start,
      registration_end,
      categories
    } = req.body;
    
    console.log('Form data received:', req.body);
    
    // Process file uploads
    let timetable_file = null;
    let banner_image = null;
    
    if (req.files) {
      // Handle timetable file
      if (req.files.timetable_file && req.files.timetable_file.length > 0) {
        timetable_file = '/uploads/' + req.files.timetable_file[0].filename;
        console.log('Timetable file saved at:', timetable_file);
      }
      
      // Handle banner image file
      if (req.files.banner_image_file && req.files.banner_image_file.length > 0) {
        banner_image = '/uploads/' + req.files.banner_image_file[0].filename;
        console.log('Banner image saved at:', banner_image);
      }
    }
    
    const creatorId = req.session.user.id;
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Create the event
    console.log('Creating event with name:', name);
    
    const result = await db.query(queries.addEvent, [
      name, 
      description, 
      banner_image, 
      address, 
      start_date, 
      end_date, 
      registration_start, 
      registration_end, 
      event_type, 
      creatorId, 
      timetable_file, 
      currentDate, 
      currentDate
    ]);
    
    // Extract the event ID
    const eventId = result[0].insertId;
    console.log('Event created with ID:', eventId);
    
    // Process categories if provided
    if (categories) {
      let parsedCategories = [];
      
      // Parse categories data if it's a string
      if (typeof categories === 'string') {
        try {
          parsedCategories = JSON.parse(categories);
          console.log('Parsed categories:', parsedCategories);
        } catch (e) {
          console.error('Error parsing categories JSON:', e);
          // Continue processing even if categories fail
          console.log('Continuing without categories due to parsing error');
        }
      } else if (Array.isArray(categories)) {
        parsedCategories = categories;
      } else {
        console.error('Categories is neither a string nor an array:', categories);
        // Continue processing even if categories data is invalid
        console.log('Continuing without categories due to invalid format');
      }
      
      console.log('Processing', parsedCategories.length, 'categories');
      
      // Create each category
      for (const category of parsedCategories) {
        try {
          console.log('Creating category:', category.name);
          
          // Store additional category details in description if they're not in the database schema
          let enhancedDescription = category.description || '';
          
          // Collect additional fields that aren't in the database schema
          const additionalFields = [];
          
          if (category.weight_class) {
            additionalFields.push(`Weight Class: ${category.weight_class}`);
          }
          
          if (category.rules) {
            additionalFields.push(`Special Rules: ${category.rules}`);
          }
          
          if (category.fee) {
            additionalFields.push(`Registration Fee: $${parseFloat(category.fee).toFixed(2)}`);
          }
          
          if (category.status && category.status !== 'active') {
            additionalFields.push(`Status: ${category.status}`);
          }
          
          // Append additional fields to description if they exist
          if (additionalFields.length > 0) {
            enhancedDescription += (enhancedDescription ? '\n\n' : '') + 
              additionalFields.join('\n\n');
          }
          
          // Execute query to add category
          await db.query(categoryQueries.addCategory, [
            eventId,
            category.name,
            category.age_group || 'senior', // Default to senior if not specified
            category.gender || 'mixed',      // Default to mixed if not specified
            enhancedDescription,
            category.max_participants || null,
            null, // draw_file_path is null initially
            currentDate,
            currentDate
          ]);
          
          console.log(`Category "${category.name}" created successfully`);
        } catch (categoryError) {
          // Log error but continue with next category
          console.error(`Error creating category "${category.name}":`, categoryError);
        }
      }
    }
    
    // Return success response
    return res.status(200).json({ 
      message: 'Event created successfully', 
      id: eventId 
    });
    
  } catch (error) {
    console.error('Event creation error:', error);
    return res.status(500).json({ 
      message: 'An error occurred while creating the event', 
      error: error.message 
    });
  }
}

async function getEvents() {
  try {
    const [rows] = await db.query(queries.getEvents);
    
    // Transform the database fields to match frontend expectations
    return rows.map(event => ({
      id: event.id,
      title: event.name,
      description: event.description,
      event_date: event.start_date,
      location: event.address,
      banner_url: event.banner_image,
      registration_open_date: event.registration_start,
      registration_close_date: event.registration_end,
      sport_type: event.sport_type,
      creator_id: event.creator_id,
      organizer_id: event.organizer_id,
      status: event.status || 'active',
      created_at: event.created_at
    }));
  } catch (error) {
    console.error('Error in getEvents:', error);
    throw error;
  }
}

async function getEventById(eventId) {
  try {
    console.log("Fetching event with ID:", eventId);
    // Validate eventId
    if (isNaN(parseInt(eventId))) {
      throw new Error("Invalid event ID");
    }
    // Fetch event from database
    const [rows] = await db.query(
      queries.getEventById,
      [eventId]
    );
    console.log("Event data:", rows);
    if (rows.length === 0) {
      return null; // No event found
    }
    return rows[0]; // Return event details
  } catch (error) {
    console.error("Error in getEventById:", error);
    throw error;
  }
}

async function updateEvent(eventId, userId, eventData, files) {
  try {
    // Validate input
    if (!eventId || isNaN(parseInt(eventId))) {
      throw new Error('Invalid event ID');
    }
    
    // Check if user is the creator of the event
    const event = await getEventById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Convert IDs to integers for reliable comparison
    const eventCreatorId = parseInt(event.creator_id);
    const currentUserId = parseInt(userId);
    
    // Verify user is authorized to update this event
    if (eventCreatorId !== currentUserId) {
      throw new Error('Not authorized to update this event');
    }
    
    // Process updated fields
    const {
      name,
      description,
      address,
      event_type,
      start_date,
      end_date,
      registration_start,
      registration_end,
      current_banner_image,
      current_timetable_file
    } = eventData;
    
    // Validate required fields
    if (!name || !address || !start_date || !end_date || !registration_start || !registration_end) {
      throw new Error('Missing required fields');
    }
    
    // Handle file uploads
    let banner_image = current_banner_image;
    let timetable_file = current_timetable_file;
    
    if (files) {
      // Process banner image if uploaded
      if (files.banner_image_file && files.banner_image_file.length > 0) {
        banner_image = '/uploads/' + files.banner_image_file[0].filename;
        console.log('New banner image saved at:', banner_image);
        
        // Delete old banner image if it exists
        if (current_banner_image && current_banner_image !== banner_image) {
          try {
            const oldImagePath = path.join(__dirname, '../../public', current_banner_image);
            
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
              console.log('Deleted old banner image:', current_banner_image);
            }
          } catch (e) {
            console.error('Error deleting old banner image:', e);
            // Continue with update even if delete fails
          }
        }
      }
      
      // Process timetable file if uploaded
      if (files.timetable_file && files.timetable_file.length > 0) {
        timetable_file = '/uploads/' + files.timetable_file[0].filename;
        console.log('New timetable file saved at:', timetable_file);
        
        // Delete old timetable file if it exists
        if (current_timetable_file && current_timetable_file !== timetable_file) {
          try {
            const oldFilePath = path.join(__dirname, '../../public', current_timetable_file);
            
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
              console.log('Deleted old timetable file:', current_timetable_file);
            }
          } catch (e) {
            console.error('Error deleting old timetable file:', e);
            // Continue with update even if delete fails
          }
        }
      }
    }
    
    // Update the event in the database
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await db.query(queries.updateEvent, [
      name,
      description,
      banner_image,
      address,
      start_date,
      end_date,
      registration_start,
      registration_end,
      event_type,
      timetable_file,
      currentDate,
      eventId
    ]);
    
    // Return success response
    return {
      success: true,
      message: 'Event updated successfully',
      id: eventId
    };
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error(error.message || 'Failed to update the event'); 
  }
}

// Export functions
module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    // Include original event controller functions
    addEvent: async (req, res) => { 
        try {
            const [rows] = await db.query(queries.addEvent); 
            console.log(rows); 
            res.json(rows); 
        } catch (error) {
            res.status(500).json({error: error.message }); 
        }
    },
    getEventByName: async (req, res) => { 
        try {
            const [rows] = await db.query(queries.getEventByName); 
            console.log(rows); 
            res.json(rows); 
        } catch (error) {
            res.status(500).json({error: error.message }); 
        }
    },
    deleteEvent: async (req, res) => { 
        try {
            const [rows] = await db.query(queries.deleteEvent); 
            console.log(rows); 
            res.json(rows); 
        } catch (error) {
            res.status(500).json({error: error.message }); 
        }
    }
};
