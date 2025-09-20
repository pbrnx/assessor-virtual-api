// src/api/index.js
const express = require('express');
const router = express.Router();
const clienteRoutes = require('./clientes.routes');
const investimentoRoutes = require('./investimentos.routes');

router.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo à API de Recomendação de Investimentos!' });
});


router.use('/clientes', clienteRoutes);
router.use('/investimentos', investimentoRoutes); 

module.exports = router;