const bcrypt = require('bcryptjs');
const User = require('../modules/userModels');
const db = require('../db'); 

exports.register = async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        User.create(name, hashedPassword, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Database error or user already exists' });
            }
            res.send('You are registered');
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).send('All fields are required');
    }

    User.findByName(name, async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        req.session.user = { name: user.name };
        console.log('Logged in as:', req.session.user);

        req.session.save(() => {
            res.redirect('/events');
        });
    });
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

