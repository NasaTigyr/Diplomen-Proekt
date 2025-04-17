const express = require('express');
const usersRoutes = require('./src/users/routes');
const eventsRoutes = require('./src/events/routes');
const categoriesRoutes = require('./src/categories/routes');
const clubsRoutes = require('./src/clubs/routes');
const individualRegistrationRoutes = require('./src/individual_registration/routes');
const teamRegistrationRoutes = require('./src/team_registrations/routes');
const teamRegistrationAthletesRoutes = require('./src/team_registration_athletes/routes');
const clubAthletesRoutes = require('./src/club_athletes/routes');
const drawsRoutes = require('./src/draws/routes');

const controller = require('./controller');
const upload = require('./upload-middleware'); // We'll create this middleware for uploads

module.exports = function(app) {
    // Custom routes that require specific middleware or controller functions
    app.get('/', (req, res) => {
        res.render('index', { user: req.session.user || null });
    });

    app.get('/login', (req, res) => {
        if (req.session.user) {
            return res.redirect('/');
        }
        res.sendFile(require('path').join(__dirname, 'views', 'login.html'));
    });

    app.get('/register', (req, res) => {
        if (req.session.user) {
            return res.redirect('/');
        }
        res.sendFile(require('path').join(__dirname, 'views', 'register.html'));
    });

    app.post('/login', controller.login);
    app.post('/register', upload.single('profile_picture'), controller.register);
    
    // Authenticated routes
    app.get('/profile', isAuthenticated, (req, res) => {
        res.render('profile', { user: req.session.user });
    });

    app.get('/createEvent', isAuthenticated, (req, res) => { 
        res.render('createEvent', { user: req.session.user });
    });

    app.get('/createClub', isAuthenticated, (req, res) => {
        res.render('createClub', { user: req.session.user });
    });

    app.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            res.redirect('/');
        });
    });

    // Dynamic routes from modules
    app.use('/users', usersRoutes);
    app.use('/events', eventsRoutes);
    app.use('/categories', categoriesRoutes);
    app.use('/clubs', clubsRoutes);
    app.use('/registrations', individualRegistrationRoutes);
    app.use('/team-registrations', teamRegistrationRoutes);
    app.use('/team-registration-athletes', teamRegistrationAthletesRoutes);
    app.use('/club-athletes', clubAthletesRoutes);
    app.use('/draws', drawsRoutes);

    // Additional custom routes (those that were in server.js)
    // Example: 
    app.get('/events', async (req, res) => {
        try {
            const events = await controller.getEvents();
            
            if (req.xhr || req.headers.accept.indexOf('json') !== -1) {
                return res.json(events);
            }
            
            res.render('events', { 
                user: req.session.user,
                userId: req.session.user ? req.session.user.id : null,
                initialEvents: JSON.stringify(events)
            });
        } catch (error) {
            console.error('Error fetching events:', error);
            res.render('events', { 
                user: req.session.user,
                userId: req.session.user ? req.session.user.id : null,
                initialEvents: '[]',
                error: 'Failed to load events'
            });
        }
    });

    // Authentication middleware
    function isAuthenticated(req, res, next) {
        if (req.session && req.session.user) {
            return next();
        }
        return res.redirect('/login?error=' + encodeURIComponent('Please login to access this page'));
    }
};
