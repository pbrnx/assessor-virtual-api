// src/api/clientes.routes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const perfilController = require('../controllers/perfil.controller');
const recomendacaoController = require('../controllers/recomendacao.controller');
const carteiraRoutes = require('./carteira.routes');
const authJwt = require('../middlewares/authJwt');

// --- ROTAS PROTEGIDAS ---

// A rota para listar todos os clientes (idealmente, deveria ser apenas para admin)
router.get('/', [authJwt.verifyToken], clienteController.findAll);

// [CORREÇÃO APLICADA] Middleware 'isOwnerOrAdmin' adicionado para proteger o acesso aos recursos do cliente.
router.get('/:id', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], clienteController.findById);
router.put('/:id', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], clienteController.update);
router.delete('/:id', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], clienteController.delete);

// Rota de Perfil
router.post('/:id/perfil', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], perfilController.definirPerfil);

// Rota de Recomendação
router.get('/:id/recomendacoes', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], recomendacaoController.getRecomendacao);
router.post('/:id/recomendacoes/investir', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], recomendacaoController.investir);

// Rota para Depósito
router.post('/:id/depositar', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], clienteController.depositar);

// [CORREÇÃO APLICADA] Garante que apenas o dono da conta ou um admin possa interagir com a carteira.
router.use('/:id/carteira', [authJwt.verifyToken, authJwt.isOwnerOrAdmin], carteiraRoutes);

module.exports = router;