// src/api/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rota para registrar um novo cliente
router.post('/register', authController.register);

// Rota para autenticar um cliente e obter um token
router.post('/login', authController.login);

// <<<< NOVA ROTA >>>>
// Rota para verificar o e-mail com um token
router.post('/verify-email', authController.verifyEmail);

// Rota para solicitar a redefinição de senha
router.post('/forgot-password', authController.forgotPassword);

// Rota para efetivamente redefinir a senha com um token
router.post('/reset-password', authController.resetPassword);

module.exports = router;