// src/api/carteira.routes.js
const express = require('express');
// mergeParams é crucial para que o :id do cliente seja passado para este roteador
const router = express.Router({ mergeParams: true }); 
const carteiraController = require('../controllers/carteira.controller');
const authJwt = require('../middlewares/authJwt'); // Importe o middleware aqui

// Rota para buscar a carteira do cliente (ex: GET /api/clientes/123/carteira)
// Aplicamos o middleware de autenticação a cada rota individualmente
router.get('/', [authJwt.verifyToken], carteiraController.getCarteira);

// Rota para comprar um ativo (ex: POST /api/clientes/123/carteira/comprar)
router.post('/comprar', [authJwt.verifyToken], carteiraController.comprar);

// Rota para vender um ativo (ex: POST /api/clientes/123/carteira/vender)
router.post('/vender', [authJwt.verifyToken], carteiraController.vender);

module.exports = router;