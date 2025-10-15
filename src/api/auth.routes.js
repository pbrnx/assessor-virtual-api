// src/api/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rota para registrar um novo cliente
// POST /api/auth/register
router.post('/register', authController.register);

// Rota para autenticar um cliente e obter um token
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;