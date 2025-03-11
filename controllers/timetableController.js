const db = require('../db');

exports.getTimetableByEventId = (req, res) => {
  const eventId = req.params.eventId;

  db.query(
    'SELECT * FROM timetable_entries WHERE event_id = ? ORDER BY start_time',
    [eventId],
    (err, results) => {
      if (err) {
        console.error('Error fetching timetable:', err);
        return res.status(500).json({ message: 'Failed to fetch timetable' });
      }
      
      res.status(200).json(results);
    }
  );
};

exports.createTimetableEntry = (req, res) => {
  const { event_id, title, description, start_time, end_time, location } = req.body;
  
  // Validate required fields
  if (!event_id || !title || !start_time || !end_time) {
    return res.status(400).json({ message: 'Event ID, title, start time, and end time are required' });
  }
  
  // Check if the event exists and belongs to the user
  db.query('SELECT * FROM events WHERE id = ?', [event_id], (err, results) => {
    if (err) {
      console.error('Error fetching event:', err);
      return res.status(500).json({ message: 'Failed to create timetable entry' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = results[0];
    if (event.creator_id !== req.session.user.id) {
      return res.status(403).json({ message: 'You are not authorized to add timetable entries to this event' });
    }

    // Validate times
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
    
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    
    // Create the timetable entry
    const entryData = {
      event_id,
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      location
    };

    db.query('INSERT INTO timetable_entries SET ?', entryData, (err, result) => {
      if (err) {
        console.error('Error creating timetable entry:', err);
        return res.status(500).json({ message: 'Failed to create timetable entry' });
      }
      
      // Return the created entry
      entryData.id = result.insertId;
      res.status(201).json(entryData);
    });
  });
};

exports.updateTimetableEntry = (req, res) => {
  const entryId = req.params.id;
  const { title, description, start_time, end_time, location } = req.body;

  // First, check if the entry exists
  db.query(
    `SELECT t.*, e.creator_id 
     FROM timetable_entries t 
     JOIN events e ON t.event_id = e.id 
     WHERE t.id = ?`, 
    [entryId], 
    (err, results) => {
      if (err) {
        console.error('Error fetching timetable entry:', err);
        return res.status(500).json({ message: 'Failed to update timetable entry' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Timetable entry not found' });
      }

      const entry = results[0];
      
      // Check if the user is the event creator
      if (entry.creator_id !== req.session.user.id) {
        return res.status(403).json({ message: 'You are not authorized to update this timetable entry' });
      }

      // Validate times if both are provided
      let startTime = entry.start_time;
      let endTime = entry.end_time;
      
      if (start_time) {
        startTime = new Date(start_time);
      }
      
      if (end_time) {
        endTime = new Date(end_time);
      }
      
      if (startTime >= endTime) {
        return res.status(400).json({ message: 'End time must be after start time' });
      }

      // Update the entry
      const entryData = {
        title: title || entry.title,
        description: description !== undefined ? description : entry.description,
        start_time: startTime,
        end_time: endTime,
        location: location !== undefined ? location : entry.location
      };

      db.query('UPDATE timetable_entries SET ? WHERE id = ?', [entryData, entryId], (err, result) => {
        if (err) {
          console.error('Error updating timetable entry:', err);
          return res.status(500).json({ message: 'Failed to update timetable entry' });
        }

        res.status(200).json({ 
          id: entryId, 
          event_id: entry.event_id,
          ...entryData 
        });
      });
    }
  );
};

exports.deleteTimetableEntry = (req, res) => {
  const entryId = req.params.id;

  // First, check if the entry exists
  db.query(
    `SELECT t.*, e.creator_id 
     FROM timetable_entries t 
     JOIN events e ON t.event_id = e.id 
     WHERE t.id = ?`, 
    [entryId], 
    (err, results) => {
      if (err) {
        console.error('Error fetching timetable entry:', err);
        return res.status(500).json({ message: 'Failed to delete timetable entry' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Timetable entry not found' });
      }

      const entry = results[0];
      
      // Check if the user is the event creator
      if (entry.creator_id !== req.session.user.id) {
        return res.status(403).json({ message: 'You are not authorized to delete this timetable entry' });
      }

      // Delete the entry
      db.query('DELETE FROM timetable_entries WHERE id = ?', [entryId], (err, result) => {
        if (err) {
          console.error('Error deleting timetable entry:', err);
          return res.status(500).json({ message: 'Failed to delete timetable entry' });
        }

        res.status(204).send();
      });
    }
  );
};
