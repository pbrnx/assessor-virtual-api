// src/api/index.js
const express = require('express');
const router = express.Router();

// Importa as novas rotas de autenticação
const authRoutes = require('./auth.routes'); 
const clienteRoutes = require('./clientes.routes');
const investimentoRoutes = require('./investimentos.routes');

router.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo à API de Recomendação de Investimentos!' });
});

// Adiciona o novo grupo de rotas
router.use('/auth', authRoutes); 
router.use('/clientes', clienteRoutes);
router.use('/investimentos', investimentoRoutes); 

module.exports = router;