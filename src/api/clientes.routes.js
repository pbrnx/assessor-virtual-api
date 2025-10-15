// src/api/clientes.routes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const perfilController = require('../controllers/perfil.controller');
const recomendacaoController = require('../controllers/recomendacao.controller');
// --- [MODIFICADO] ---
const carteiraRoutes = require('./carteira.routes'); // Reutilizamos o arquivo de rotas da carteira
const authJwt = require('../middlewares/authJwt');

// --- ROTAS PROTEGIDAS ---

// A rota para listar todos os clientes
router.get('/', [authJwt.verifyToken], clienteController.findAll);

// Rotas específicas de um cliente
router.get('/:id', [authJwt.verifyToken], clienteController.findById);
router.put('/:id', [authJwt.verifyToken], clienteController.update);
router.delete('/:id', [authJwt.verifyToken], clienteController.delete);

// Rota de Perfil
router.post('/:id/perfil', [authJwt.verifyToken], perfilController.definirPerfil);

// Rota de Recomendação
router.get('/:id/recomendacoes', [authJwt.verifyToken], recomendacaoController.getRecomendacao);
router.post('/:id/recomendacoes/investir', [authJwt.verifyToken], recomendacaoController.investir);

// Rota para Depósito
router.post('/:id/depositar', [authJwt.verifyToken], clienteController.depositar);

// --- [MODIFICADO] ---
// Aninha as rotas de carteira, mas sem aplicar o middleware aqui, pois já está no arquivo carteira.routes.js
router.use('/:id/carteira', carteiraRoutes);


module.exports = router;