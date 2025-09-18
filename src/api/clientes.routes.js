// src/api/clientes.routes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const perfilController = require('../controllers/perfil.controller'); // Importação correta
const recomendacaoController = require('../controllers/recomendacao.controller');

// --- Rotas de Cliente ---
router.post('/', clienteController.create);
router.get('/', clienteController.findAll);
router.get('/:id', clienteController.findById);

// --- Rota de Perfil ---
router.post('/:id/perfil', perfilController.definirPerfil); // A função deve existir no controller

// --- Rota de Recomendação ---
router.get('/:id/recomendacoes', recomendacaoController.getRecomendacao);

module.exports = router;