const express = require('express');
const router = express.Router();

const eventoController = require('../controllers/eventoController');

router.get('/listar', eventoController.listarEventos);
router.get('/:id', eventoController.obterEvento);
router.post('/', eventoController.criarEvento);
router.put('/:id', eventoController.atualizarEvento);
router.delete('/:id', eventoController.deletarEvento);

module.exports = router;
