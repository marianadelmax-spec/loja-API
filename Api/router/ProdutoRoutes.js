//POST - ENVIAR NOVO CADASTRO
//GET - BUSCAR CADASTRO
//PATCH / PUT - ATUALIZAR CADASTRO
//DELETE - DELETAR

const router = require('express').Router();
const ProdutoController = require('../Controller/ProdutoController.js');
const { uploadImagem } = require('../helpers/upload.js');

router.post('/create', uploadImagem, ProdutoController.create);
router.get('/getAll', ProdutoController.getAll);
router.get('/getById/:id', ProdutoController.getById);
router.put('/update/:id', uploadImagem, ProdutoController.update);
router.delete('/delete/:id', ProdutoController.delete);

module.exports = router;
