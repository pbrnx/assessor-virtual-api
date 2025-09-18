// src/api/investimentos.routes.js
const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoInvestimento.controller');

// Rota para criar um novo produto de investimento
router.post('/', produtoController.create);

// Rota para listar todos os produtos
router.get('/', produtoController.findAll);

// Rota para buscar um produto por ID
router.get('/:id', produtoController.findById);

// Rota para atualizar um produto
router.put('/:id', produtoController.update);

// Rota para deletar um produto
router.delete('/:id', produtoController.delete);

module.exports = router;