const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('sportsite_database', 'root', 'your_password', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = sequelize;

