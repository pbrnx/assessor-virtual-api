// src/api/clientes.routes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const perfilController = require('../controllers/perfil.controller');
const recomendacaoController = require('../controllers/recomendacao.controller');

// Rotas de Cliente (CRUD completo)
router.post('/', clienteController.create);
router.get('/', clienteController.findAll);
router.get('/:id', clienteController.findById);
router.put('/:id', clienteController.update);
router.delete('/:id', clienteController.delete);

// Rota de Perfil
router.post('/:id/perfil', perfilController.definirPerfil);

// Rota de Recomendação
router.get('/:id/recomendacoes', recomendacaoController.getRecomendacao);

module.exports = router;