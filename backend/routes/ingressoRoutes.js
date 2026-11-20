
const express = require('express');
const router = express.Router();

const ingressoController = require('../controllers/ingressoController');

// Listar ingressos
router.get('/listar', ingressoController.listarIngresso);

// Listar modalidades de um evento
router.get('/evento/:id', ingressoController.listarPorEvento);

// Cadastrar várias modalidades de uma vez
router.post('/lote', ingressoController.criarIngressosEmLote);

// CRUD individual
router.get('/:id', ingressoController.obterIngresso);
router.post('/', ingressoController.criarIngresso);
router.put('/:id', ingressoController.atualizarIngresso);
router.delete('/:id', ingressoController.deletarIngresso);

module.exports = router;
