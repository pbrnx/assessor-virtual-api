// src/api/index.js
const express = require('express');
const router = express.Router();

// Importe os arquivos de rota aqui quando forem criados
// const clienteRoutes = require('./clientes.routes');

router.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo à API de Recomendação de Investimentos!' });
});

// Use as rotas aqui
// router.use('/clientes', clienteRoutes);

module.exports = router;