const router = require('express').Router();
const CarrinhoController = require('../Controller/CarrinhoController.js');

router.post('/create', CarrinhoController.create);
router.get('/getById/:id', CarrinhoController.getById);
router.post('/:id/adicionarItem', CarrinhoController.adicionarItem);
router.put('/:id/atualizarItem/:itemId', CarrinhoController.atualizarItem);
router.delete('/:id/removerItem/:itemId', CarrinhoController.removerItem);
router.delete('/:id/limpar', CarrinhoController.limpar);

module.exports = router;
