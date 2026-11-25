const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');
const Venda = require('./Venda.js');
const Produto = require('./Produto.js');

// guarda nome e preço do momento da venda, mesmo se o produto mudar depois
const ItemVenda = db.define('ItemVenda', {
    nomeProduto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

Venda.hasMany(ItemVenda, { as: 'itens', foreignKey: 'vendaId', onDelete: 'CASCADE' });
ItemVenda.belongsTo(Venda, { foreignKey: 'vendaId' });

Produto.hasMany(ItemVenda, { foreignKey: 'produtoId', onDelete: 'SET NULL' });
ItemVenda.belongsTo(Produto, { as: 'produto', foreignKey: 'produtoId' });

module.exports = ItemVenda;
