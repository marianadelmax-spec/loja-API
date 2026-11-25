const path = require('path');
const fs = require('fs');
const Produto = require('../model/Produto.js');

// cadastra um produto de exemplo (com imagem .png) quando o banco está vazio
async function criarProdutoExemplo() {
    const total = await Produto.count();
    if (total > 0) return;

    const pastaUploads = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(pastaUploads)) {
        fs.mkdirSync(pastaUploads);
    }

    const nomeImagem = 'caneca-exemplo.png';
    fs.copyFileSync(
        path.join(__dirname, '..', 'seed', 'caneca.png'),
        path.join(pastaUploads, nomeImagem)
    );

    await Produto.create({
        nome: 'Caneca de cerâmica',
        preco: 39.9,
        imagem: nomeImagem
    });

    console.log('Produto de exemplo cadastrado!');
}

module.exports = criarProdutoExemplo;
