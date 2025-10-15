// src/api/investimentos.routes.js
const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoInvestimento.controller');
const authJwt = require('../middlewares/authJwt'); // <-- Importa o middleware

// Rota para criar um novo produto de investimento (PROTEGIDA)
router.post('/', [authJwt.verifyToken, authJwt.isAdmin], produtoController.create);

// Rota para listar todos os produtos (PÚBLICA)
router.get('/', produtoController.findAll);

// Rota para buscar um produto por ID (PÚBLICA)
router.get('/:id', produtoController.findById);

// Rota para atualizar um produto (PROTEGIDA)
router.put('/:id', [authJwt.verifyToken, authJwt.isAdmin], produtoController.update);

// Rota para deletar um produto (PROTEGIDA)
router.delete('/:id', [authJwt.verifyToken, authJwt.isAdmin], produtoController.delete);

module.exports = router;