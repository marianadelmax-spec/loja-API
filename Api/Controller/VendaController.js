const db = require('../db/conn.js');
const Carrinho = require('../model/Carrinho.js');
const ItemCarrinho = require('../model/ItemCarrinho.js');
const Produto = require('../model/Produto.js');
const Venda = require('../model/Venda.js');
const ItemVenda = require('../model/ItemVenda.js');

const formasPagamento = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro'];

module.exports = class VendaController {
    static async finalizar(req, res) {
        const { carrinhoId, formaPagamento } = req.body || {};

        if (!carrinhoId) {
            return res.status(422).json({ message: 'O carrinho é obrigatório!' });
        }
        if (!formasPagamento.includes(formaPagamento)) {
            return res.status(422).json({ message: 'Forma de pagamento inválida!' });
        }

        // transação: se algo der errado no meio, nada é gravado
        const t = await db.transaction();

        try {
            const carrinho = await Carrinho.findByPk(carrinhoId, {
                include: [{
                    model: ItemCarrinho,
                    as: 'itens',
                    include: [{ model: Produto, as: 'produto' }]
                }],
                transaction: t
            });

            if (!carrinho) {
                await t.rollback();
                return res.status(404).json({ message: 'Carrinho não encontrado!' });
            }
            if (carrinho.status !== 'aberto') {
                await t.rollback();
                return res.status(400).json({ message: 'Este carrinho já foi finalizado!' });
            }
            if (carrinho.itens.length === 0) {
                await t.rollback();
                return res.status(422).json({ message: 'O carrinho está vazio!' });
            }

            const total = carrinho.itens.reduce(
                (soma, item) => soma + Number(item.produto.preco) * item.quantidade, 0
            );

            const venda = await Venda.create(
                { carrinhoId, total, formaPagamento },
                { transaction: t }
            );

            const itensVenda = carrinho.itens.map((item) => ({
                vendaId: venda.id,
                produtoId: item.produtoId,
                nomeProduto: item.produto.nome,
                precoUnitario: item.produto.preco,
                quantidade: item.quantidade
            }));
            await ItemVenda.bulkCreate(itensVenda, { transaction: t });

            await carrinho.update({ status: 'finalizado' }, { transaction: t });

            await t.commit();

            const vendaCompleta = await Venda.findByPk(venda.id, {
                include: [{ model: ItemVenda, as: 'itens' }]
            });
            res.status(201).json({ message: 'Venda finalizada com sucesso!', venda: vendaCompleta });
        } catch (error) {
            await t.rollback();
            res.status(500).json({ message: 'Erro ao finalizar a venda.', error: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const vendas = await Venda.findAll({
                include: [{ model: ItemVenda, as: 'itens' }],
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json(vendas);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar as vendas.', error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const venda = await Venda.findByPk(req.params.id, {
                include: [{ model: ItemVenda, as: 'itens' }]
            });
            if (!venda) {
                return res.status(404).json({ message: 'Venda não encontrada!' });
            }
            res.status(200).json(venda);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar a venda.', error: error.message });
        }
    }
}
