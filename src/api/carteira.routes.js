// src/api/carteira.routes.js
const express = require('express');
// mergeParams é crucial para que o :id do cliente seja passado para este roteador
const router = express.Router({ mergeParams: true }); 
const carteiraController = require('../controllers/carteira.controller');

// Rota para buscar a carteira do cliente (ex: GET /api/clientes/123/carteira)
// Nota: authJwt.verifyToken e authJwt.isOwnerOrAdmin já são aplicados em clientes.routes.js
router.get('/', carteiraController.getCarteira);

// Rota para comprar um ativo (ex: POST /api/clientes/123/carteira/comprar)
router.post('/comprar', carteiraController.comprar);

// Rota para vender um ativo (ex: POST /api/clientes/123/carteira/vender)
router.post('/vender', carteiraController.vender);

module.exports = router;