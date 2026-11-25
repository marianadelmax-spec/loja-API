const Carrinho = require('../model/Carrinho.js');
const ItemCarrinho = require('../model/ItemCarrinho.js');
const Produto = require('../model/Produto.js');

async function buscarCarrinhoCompleto(id) {
    const carrinho = await Carrinho.findByPk(id, {
        include: [{
            model: ItemCarrinho,
            as: 'itens',
            include: [{ model: Produto, as: 'produto' }]
        }],
        order: [[{ model: ItemCarrinho, as: 'itens' }, 'id', 'ASC']]
    });

    if (!carrinho) return null;

    const dados = carrinho.toJSON();
    dados.total = dados.itens.reduce(
        (soma, item) => soma + Number(item.produto.preco) * item.quantidade, 0
    );
    dados.quantidadeItens = dados.itens.reduce((soma, item) => soma + item.quantidade, 0);
    return dados;
}

async function buscarCarrinhoAberto(id, res) {
    const carrinho = await Carrinho.findByPk(id);
    if (!carrinho) {
        res.status(404).json({ message: 'Carrinho não encontrado!' });
        return null;
    }
    if (carrinho.status !== 'aberto') {
        res.status(400).json({ message: 'Este carrinho já foi finalizado!' });
        return null;
    }
    return carrinho;
}

module.exports = class CarrinhoController {
    static async create(req, res) {
        try {
            const carrinho = await Carrinho.create();
            const dados = await buscarCarrinhoCompleto(carrinho.id);
            res.status(201).json({ message: 'Carrinho criado com sucesso!', carrinho: dados });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao criar o carrinho.', error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const carrinho = await buscarCarrinhoCompleto(req.params.id);
            if (!carrinho) {
                return res.status(404).json({ message: 'Carrinho não encontrado!' });
            }
            res.status(200).json(carrinho);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar o carrinho.', error: error.message });
        }
    }

    static async adicionarItem(req, res) {
        const { id } = req.params;
        const { produtoId } = req.body || {};
        const quantidade = Number((req.body || {}).quantidade ?? 1);

        if (!produtoId) {
            return res.status(422).json({ message: 'O produto é obrigatório!' });
        }
        if (!Number.isInteger(quantidade) || quantidade < 1) {
            return res.status(422).json({ message: 'A quantidade deve ser um número inteiro maior que zero!' });
        }

        try {
            const carrinho = await buscarCarrinhoAberto(id, res);
            if (!carrinho) return;

            const produto = await Produto.findByPk(produtoId);
            if (!produto) {
                return res.status(404).json({ message: 'Produto não encontrado!' });
            }

            // se o produto já está no carrinho, só soma a quantidade
            const item = await ItemCarrinho.findOne({ where: { carrinhoId: id, produtoId } });
            if (item) {
                await item.update({ quantidade: item.quantidade + quantidade });
            } else {
                await ItemCarrinho.create({ carrinhoId: id, produtoId, quantidade });
            }

            const dados = await buscarCarrinhoCompleto(id);
            res.status(200).json({ message: 'Produto adicionado ao carrinho!', carrinho: dados });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao adicionar o produto.', error: error.message });
        }
    }

    static async atualizarItem(req, res) {
        const { id, itemId } = req.params;
        const quantidade = Number((req.body || {}).quantidade);

        if (!Number.isInteger(quantidade) || quantidade < 1) {
            return res.status(422).json({ message: 'A quantidade deve ser um número inteiro maior que zero!' });
        }

        try {
            const carrinho = await buscarCarrinhoAberto(id, res);
            if (!carrinho) return;

            const item = await ItemCarrinho.findOne({ where: { id: itemId, carrinhoId: id } });
            if (!item) {
                return res.status(404).json({ message: 'Item não encontrado no carrinho!' });
            }

            await item.update({ quantidade });
            const dados = await buscarCarrinhoCompleto(id);
            res.status(200).json({ message: 'Quantidade atualizada!', carrinho: dados });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao atualizar o item.', error: error.message });
        }
    }

    static async removerItem(req, res) {
        const { id, itemId } = req.params;

        try {
            const carrinho = await buscarCarrinhoAberto(id, res);
            if (!carrinho) return;

            const item = await ItemCarrinho.findOne({ where: { id: itemId, carrinhoId: id } });
            if (!item) {
                return res.status(404).json({ message: 'Item não encontrado no carrinho!' });
            }

            await item.destroy();
            const dados = await buscarCarrinhoCompleto(id);
            res.status(200).json({ message: 'Produto removido do carrinho!', carrinho: dados });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao remover o item.', error: error.message });
        }
    }

    static async limpar(req, res) {
        const { id } = req.params;

        try {
            const carrinho = await buscarCarrinhoAberto(id, res);
            if (!carrinho) return;

            await ItemCarrinho.destroy({ where: { carrinhoId: id } });
            const dados = await buscarCarrinhoCompleto(id);
            res.status(200).json({ message: 'Carrinho esvaziado!', carrinho: dados });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao esvaziar o carrinho.', error: error.message });
        }
    }
}
