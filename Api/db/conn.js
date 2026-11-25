const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('loja', 'root', 'root', {
    host: 'localhost',
    dialect: 'mariadb'
});

module.exports = sequelize;
