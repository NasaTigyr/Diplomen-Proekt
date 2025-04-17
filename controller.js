// controller.js (Main controller)
const db = require('./db.js'); 
const usersController = require('./src/users/controller');
const eventsController = require('./src/events/controller');
const categoriesController = require('./src/categories/controller');
const clubsController = require('./src/clubs/controller');
const individualRegistrationsController = require('./src/individual_registration/controller');

module.exports = {
    // User Authentication and Management
    login: usersController.login,
    register: usersController.register,
    updateProfile: usersController.updateProfile,
    changePassword: usersController.changePassword,
    
    // Club Management
    createClub: clubsController.createClub,
    getClubAthletes: clubsController.getClubAthletes,
    removeAthleteFromClub: clubsController.removeAthleteFromClub,
    getClubJoinRequests: clubsController.getClubJoinRequests,
    approveJoinRequest: clubsController.approveJoinRequest,
    rejectJoinRequest: clubsController.rejectJoinRequest,
    sendClubInvitation: clubsController.sendClubInvitation,
    
    // Event Management
    createEvent: eventsController.createEvent,
    getEvents: eventsController.getEvents,
    getEventById: eventsController.getEventById,
    updateEvent: eventsController.updateEvent,
    
    // Category Management
    addCategory: categoriesController.addCategory,
    updateCategory: categoriesController.updateCategory,
    deleteCategory: categoriesController.deleteCategory,
    getCategoriesByEventId: categoriesController.getCategoriesByEventId,
    
    // Registration Management
    registerForCategory: individualRegistrationsController.registerForCategory,
    cancelRegistration: individualRegistrationsController.cancelRegistration,
    getRegistrationById: individualRegistrationsController.getRegistrationById,
    getUserRegistrations: individualRegistrationsController.getUserRegistrations,
    registerUserForCategory: individualRegistrationsController.registerUserForCategory,
    getEventRegistrations: individualRegistrationsController.getEventRegistrations,
    updateRegistrationStatus: individualRegistrationsController.updateRegistrationStatus,
    
    // Other functionality as needed
    getEventDetailsPage: async (req, res) => {
        try {
            const eventId = parseInt(req.params.id);
            
            if (isNaN(eventId)) {
                return res.status(400).render('error', { 
                    message: 'Invalid event ID', 
                    error: { status: 400 },
                    user: req.session.user 
                });
            }
            
            // Fetch the event
            const event = await eventsController.getEventById(eventId);
            
            if (!event) {
                return res.status(404).render('error', { 
                    message: 'Event not found', 
                    error: { status: 404 },
                    user: req.session.user 
                });
            }
            
            // Render the page with all data needed
            res.render('eventDetails', {
                eventId,
                event,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error loading event details:', error);
            res.status(500).render('error', { 
                message: 'Internal server error', 
                error: { status: 500 },
                user: req.session.user 
            });
        }
    },
    
    getCategoryStats: async (eventId, status = null) => {
        try {
            // Validate eventId
            if (isNaN(parseInt(eventId))) {
                throw new Error("Invalid event ID");
            }
            
            let query = `
                SELECT 
                    c.id as category_id, 
                    COUNT(ir.id) as participant_count 
                FROM 
                    categories c 
                LEFT JOIN 
                    individual_registrations ir ON c.id = ir.category_id 
                WHERE 
                    c.event_id = ?`;
            
            const params = [eventId];
            
            // Add status filter if provided
            if (status) {
                query += ` AND ir.status = ?`;
                params.push(status);
            }
            
            // Add GROUP BY clause
            query += ` GROUP BY c.id`;
            
            // Execute query
            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            console.error("Error in getCategoryStats:", error);
            throw error;
        }
    },
    
    getTimetableByEventId: async (eventId) => {
        try {
            // Validate eventId
            if (isNaN(parseInt(eventId))) {
                throw new Error("Invalid event ID");
            }
            
            // Fetch timetable file from events table
            const [rows] = await db.query(
                "SELECT timetable_file FROM events WHERE id = ?", 
                [eventId]
            );
            
            // Return the timetable file path if it exists
            return rows && rows.length > 0 ? rows : [];
        } catch (error) {
            console.error("Error in getTimetableByEventId:", error);
            throw error;
        }
    }
};
