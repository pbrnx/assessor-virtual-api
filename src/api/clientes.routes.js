// src/api/clientes.routes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const perfilController = require('../controllers/perfil.controller');
const recomendacaoController = require('../controllers/recomendacao.controller');
const carteiraRoutes = require('./carteira.routes');
const authJwt = require('../middlewares/authJwt');

// --- ROTAS PROTEGIDAS ---

// Rota para listar TODOS os clientes (Apenas Admin)
router.get('/', [authJwt.verifyToken, authJwt.isAdmin], clienteController.findAll);

// Rotas específicas de um cliente (Apenas o dono da conta ou um Admin)
router.get('/:id', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], clienteController.findById);
router.put('/:id', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], clienteController.update);
router.delete('/:id', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], clienteController.delete);

// Rotas de Perfil (Apenas o dono da conta ou um Admin)
router.post('/:id/perfil', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], perfilController.definirPerfil);

// Rotas de Recomendação (Apenas o dono da conta ou um Admin)
router.get('/:id/recomendacoes', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], recomendacaoController.getRecomendacao);
router.post('/:id/recomendacoes/investir', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], recomendacaoController.investir);

// Rotas para Depósito e Carteira (Apenas o dono da conta ou um Admin)
router.post('/:id/depositar', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], clienteController.depositar);
router.use('/:id/carteira', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], carteiraRoutes);

module.exports = router;