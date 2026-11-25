const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');
const Carrinho = require('./Carrinho.js');

const Venda = db.define('Venda', {
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    formaPagamento: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

Carrinho.hasOne(Venda, { foreignKey: 'carrinhoId' });
Venda.belongsTo(Carrinho, { foreignKey: 'carrinhoId' });

module.exports = Venda;
