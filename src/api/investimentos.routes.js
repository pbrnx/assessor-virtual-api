// src/api/investimentos.routes.js
const express = require('express');
const router = express.Router();

// Vamos precisar de um controller para isso. Por simplicidade,
// podemos criar um método rápido no repository por enquanto.
const produtoInvestimentoRepository = require('../repositories/produtoInvestimento.repository');

// Rota para listar todos os produtos de investimento disponíveis
router.get('/', async (req, res, next) => {
    try {
        const produtos = await produtoInvestimentoRepository.findAll();
        res.status(200).json(produtos);
    } catch (error) {
        next(error); // Passa o erro para o errorHandler
    }
});

module.exports = router;