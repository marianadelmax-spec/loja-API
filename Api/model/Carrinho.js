const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');

const Carrinho = db.define('Carrinho', {
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'aberto' // aberto | finalizado
    }
});

module.exports = Carrinho;
