// src/api/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const rateLimit = require('express-rate-limit'); // <--- Importe aqui também

// Crie o limiter específico para autenticação aqui
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Limita a 10 requisições por IP nesta janela
    message: 'Muitas tentativas de autenticação originadas deste IP, tente novamente após 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
     // skipSuccessfulRequests: true // Opcional: não conta requisições bem-sucedidas (ex: login ok)
});

// Aplica o limiter ANTES das rotas que você quer proteger mais
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

router.post('/verify-email', authController.verifyEmail); // Exemplo sem o authLimiter específico

module.exports = router;