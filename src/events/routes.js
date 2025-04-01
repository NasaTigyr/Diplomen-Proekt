const express = require( 'express'); 

const { 
  addEvent,
  getEvents,
  getEventById,
  getEventByName, 
  getEventsByType, 
  getEventsByDate,
  deleteEvent, 
  updateEvent
} = require( './controller.js'); 



const router = express.Router(); 

router.get('/event', getEvents);
router.get('/event/id/:id', getEventById);
router.get('/event/name/:name', getEventByName);
router.get('/events/type/:type', getEventsByType);
router.get('/events/date/:date', getEventsByDate);
router.post('/events', addEvent);
router.put('events/:id', updateEvent); 
//router.put('users/:id', updatePassword); 
router.delete('/events', deleteEvent);

module.exports = router;
