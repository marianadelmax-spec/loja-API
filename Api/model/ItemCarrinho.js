const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');
const Carrinho = require('./Carrinho.js');
const Produto = require('./Produto.js');

const ItemCarrinho = db.define('ItemCarrinho', {
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    }
});

Carrinho.hasMany(ItemCarrinho, { as: 'itens', foreignKey: 'carrinhoId', onDelete: 'CASCADE' });
ItemCarrinho.belongsTo(Carrinho, { foreignKey: 'carrinhoId' });

Produto.hasMany(ItemCarrinho, { foreignKey: 'produtoId', onDelete: 'CASCADE' });
ItemCarrinho.belongsTo(Produto, { as: 'produto', foreignKey: 'produtoId' });

module.exports = ItemCarrinho;
