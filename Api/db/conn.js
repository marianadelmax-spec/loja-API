const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('loja', 'loja', 'loja', {
    host: 'localhost',
    dialect: 'mariadb'
});

module.exports = sequelize;
