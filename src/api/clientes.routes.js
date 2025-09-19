// src/api/clientes.routes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const perfilController = require('../controllers/perfil.controller');
const recomendacaoController = require('../controllers/recomendacao.controller');
const carteiraRoutes = require('./carteira.routes'); // Importa as novas rotas da carteira

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

// NOVO: Rota para Depósito
router.post('/:id/depositar', clienteController.depositar);

// NOVO: Aninha as rotas de carteira sob /clientes/:id/carteira
router.use('/:id/carteira', carteiraRoutes);

// Rota para investir automaticamente na carteira recomendada
router.post('/:id/recomendacoes/investir', recomendacaoController.investir);

module.exports = router;