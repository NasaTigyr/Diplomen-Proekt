const db = require('../db');

exports.getAllEvents = (req, res) => {
  db.query('SELECT * FROM events ORDER BY start_date DESC', (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ message: 'Failed to fetch events' });
    }
    
    res.status(200).json(results);
  });
};

exports.getEventById = (req, res) => {
  const eventId = req.params.id;

  db.query('SELECT * FROM events WHERE id = ?', [eventId], (err, results) => {
    if (err) {
      console.error('Error fetching event:', err);
      return res.status(500).json({ message: 'Failed to fetch event' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(results[0]);
  });
};

exports.createEvent = (req, res) => {
  const { 
    title, 
    description, 
    banner_url, 
    location, 
    event_date, 
    registration_open_date, 
    registration_close_date, 
    is_published 
  } = req.body;
  
  // Validate required fields
  if (!title || !registration_open_date || !registration_close_date) {
    return res.status(400).json({ message: 'Title, registration open date, and registration close date are required' });
  }
  
  const eventData = {
    creator_id: req.session.user.id,
    title,
    description,
    banner_url,
    location,
    event_date,
    registration_open_date,
    registration_close_date,
    is_published: is_published || false
  };

  db.query('INSERT INTO events SET ?', eventData, (err, result) => {
    if (err) {
      console.error('Error creating event:', err);
      return res.status(500).json({ message: 'Failed to create event' });
    }
    
    // Return the created event
    eventData.id = result.insertId;
    res.status(201).json(eventData);
  });
};

exports.updateEvent = (req, res) => {
  const eventId = req.params.id;
  const { 
    title, 
    description, 
    banner_url, 
    location, 
    event_date, 
    registration_open_date, 
    registration_close_date, 
    is_published 
  } = req.body;

  // First, check if the event exists and belongs to the user
  db.query('SELECT * FROM events WHERE id = ?', [eventId], (err, results) => {
    if (err) {
      console.error('Error fetching event:', err);
      return res.status(500).json({ message: 'Failed to update event' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = results[0];
    if (event.creator_id !== req.session.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this event' });
    }

    // Update the event
    const eventData = {
      title: title || event.title,
      description: description !== undefined ? description : event.description,
      banner_url: banner_url !== undefined ? banner_url : event.banner_url,
      location: location !== undefined ? location : event.location,
      event_date: event_date || event.event_date,
      registration_open_date: registration_open_date || event.registration_open_date,
      registration_close_date: registration_close_date || event.registration_close_date,
      is_published: is_published !== undefined ? is_published : event.is_published
    };

    db.query('UPDATE events SET ? WHERE id = ?', [eventData, eventId], (err, result) => {
      if (err) {
        console.error('Error updating event:', err);
        return res.status(500).json({ message: 'Failed to update event' });
      }

      res.status(200).json({ id: eventId, ...eventData });
    });
  });
};

exports.deleteEvent = (req, res) => {
  const eventId = req.params.id;

  // First, check if the event exists and belongs to the user
  db.query('SELECT * FROM events WHERE id = ?', [eventId], (err, results) => {
    if (err) {
      console.error('Error fetching event:', err);
      return res.status(500).json({ message: 'Failed to delete event' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = results[0];
    if (event.creator_id !== req.session.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this event' });
    }

    // Delete the event
    db.query('DELETE FROM events WHERE id = ?', [eventId], (err, result) => {
      if (err) {
        console.error('Error deleting event:', err);
        return res.status(500).json({ message: 'Failed to delete event' });
      }

      res.status(204).send();
    });
  });
};

exports.getEventsByUser = (req, res) => {
  const userId = req.session.user.id;

  db.query('SELECT * FROM events WHERE creator_id = ? ORDER BY created_at DESC', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user events:', err);
      return res.status(500).json({ message: 'Failed to fetch events' });
    }
    
    res.status(200).json(results);
  });
};
