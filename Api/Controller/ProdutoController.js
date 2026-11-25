const Produto = require('../model/Produto.js');
const { removerImagem } = require('../helpers/upload.js');

function validarProduto(nome, preco) {
    if (!nome || !nome.trim()) {
        return 'O nome é obrigatório!';
    }
    if (preco === undefined || preco === null || preco === '') {
        return 'O preço é obrigatório!';
    }
    if (isNaN(Number(preco))) {
        return 'O preço deve ser um número!';
    }
    if (Number(preco) < 0) {
        return 'O preço não pode ser negativo!';
    }
    return null;
}

module.exports = class ProdutoController {
    static async create(req, res) {
        const { nome, preco } = req.body || {};

        const erro = validarProduto(nome, preco);
        if (erro) {
            if (req.file) removerImagem(req.file.filename);
            return res.status(422).json({ message: erro });
        }

        try {
            const produto = await Produto.create({
                nome: nome.trim(),
                preco: Number(preco),
                imagem: req.file ? req.file.filename : null
            });
            res.status(201).json({ message: 'Produto criado com sucesso!', produto });
        } catch (error) {
            if (req.file) removerImagem(req.file.filename);
            res.status(500).json({ message: 'Erro ao criar o produto.', error: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const produtos = await Produto.findAll({ order: [['nome', 'ASC']] });
            res.status(200).json(produtos);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar os produtos.', error: error.message });
        }
    }

    static async getById(req, res) {
        const { id } = req.params;

        try {
            const produto = await Produto.findByPk(id);
            if (!produto) {
                return res.status(404).json({ message: 'Produto não encontrado!' });
            }
            res.status(200).json(produto);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar o produto.', error: error.message });
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const { nome, preco } = req.body || {};

        const erro = validarProduto(nome, preco);
        if (erro) {
            if (req.file) removerImagem(req.file.filename);
            return res.status(422).json({ message: erro });
        }

        try {
            const produto = await Produto.findByPk(id);
            if (!produto) {
                if (req.file) removerImagem(req.file.filename);
                return res.status(404).json({ message: 'Produto não encontrado!' });
            }

            const dados = { nome: nome.trim(), preco: Number(preco) };
            if (req.file) {
                removerImagem(produto.imagem);
                dados.imagem = req.file.filename;
            }

            await produto.update(dados);
            res.status(200).json({ message: 'Produto atualizado com sucesso!', produto });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao atualizar o produto.', error: error.message });
        }
    }

    static async delete(req, res) {
        const { id } = req.params;

        try {
            const produto = await Produto.findByPk(id);
            if (!produto) {
                return res.status(404).json({ message: 'Produto não encontrado!' });
            }

            const imagem = produto.imagem;
            await produto.destroy();
            removerImagem(imagem);
            res.status(200).json({ message: 'Produto removido com sucesso!' });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao remover o produto.', error: error.message });
        }
    }
}
