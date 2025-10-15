// src/api/clientes.routes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const perfilController = require('../controllers/perfil.controller');
const recomendacaoController = require('../controllers/recomendacao.controller');
const carteiraRoutes = require('./carteira.routes');

// Importa o nosso guardião (middleware)
const authJwt = require('../middlewares/authJwt');

// --- ROTAS PROTEGIDAS ---
// Todas as rotas abaixo agora exigem um token JWT válido.
// O middleware [authJwt.verifyToken] é executado antes do controller.

// A rota para listar todos os clientes (geralmente uma rota de admin)
router.get('/', [authJwt.verifyToken], clienteController.findAll);

// Rotas específicas de um cliente
router.get('/:id', [authJwt.verifyToken], clienteController.findById);
router.put('/:id', [authJwt.verifyToken], clienteController.update);
router.delete('/:id', [authJwt.verifyToken], clienteController.delete);

// Rota de Perfil
router.post('/:id/perfil', [authJwt.verifyToken], perfilController.definirPerfil);

// Rota de Recomendação
router.get('/:id/recomendacoes', [authJwt.verifyToken], recomendacaoController.getRecomendacao);

// Rota para Depósito
router.post('/:id/depositar', [authJwt.verifyToken], clienteController.depositar);

// Aninha as rotas de carteira (que também serão protegidas internamente)
router.use('/:id/carteira', [authJwt.verifyToken], carteiraRoutes);

// Rota para investir automaticamente na carteira recomendada
router.post('/:id/recomendacoes/investir', [authJwt.verifyToken], recomendacaoController.investir);


// --- ROTAS PÚBLICAS (se houver) ---
// A rota de criação foi movida para /auth/register, então não a temos mais aqui.
// router.post('/', clienteController.create); // <<<< REMOVIDA

module.exports = router;