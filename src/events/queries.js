const getEvents = 'SELECT * FROM events';
const getEventsByRole = 'SELECT * FROM events WHERE role = ?';
const getEventById = 'SELECT * FROM events WHERE id = ?';
const getEventByName = 'SELECT * FROM events WHERE name = ?';
const getEventsByType = 'SELECT * FROM events WHERE event_type = ?';
const getEventsByDate = 'SELECT * FROM events WHERE start_date = ?';

const addEvent = `INSERT INTO events (name, description, banner_image, address, start_date, end_date, registration_start, registration_end, event_type, creator_id, timetable_file, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const deleteEvent = 'DELETE FROM events WHERE id = ?';
const updateEvent = 'Update events SET name = ?, description = ?, banner_image = ?, address = ?, start_date = ?, end_date = ?, registration_start = ?, registrtation_end = ?, event_type = ?, creator_id = ?, timetable_file = ?, created_at = ?, updated_at = ?  WHERE id = ?';

const getTimetableFileFromEventId = 'SELECT timetable_file FROM events WHERE id = ?';

const queries = { 
  getEvents,
  getEventsByRole, 
  getEventById, 
  getEventByName,
  getEventsByType,
  getEventsByDate, 
  addEvent,
  deleteEvent,
  updateEvent,
  getTimetableFileFromEventId
};

module.exports = queries;
