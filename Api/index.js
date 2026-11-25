const express = require('express');
const cors = require('cors');
const path = require('path');
const conn = require('./db/conn.js');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const produtoRoutes = require('./router/ProdutoRoutes.js');
const carrinhoRoutes = require('./router/CarrinhoRoutes.js');
const vendaRoutes = require('./router/VendaRoutes.js');

app.use('/produto', produtoRoutes);
app.use('/carrinho', carrinhoRoutes);
app.use('/venda', vendaRoutes);

conn
    .authenticate()
    .then(() => {
        console.log('Conexão com o banco de dados realizada com sucesso!');
        return conn.sync({ alter: true });
    })
    .then(() => {
        app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
    })
    .catch((err) => {
        console.log('Erro ao conectar com o banco de dados: ' + err.message);
    });
