// src/api/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller'); //
const rateLimit = require('express-rate-limit'); // Importa o rate limiter

// --- Rate Limiters ---

// Limiter mais estrito para operações sensíveis de autenticação
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Janela de 15 minutos
    max: 10, // Limita cada IP a 10 requisições nesta janela
    message: { message: 'Muitas tentativas de autenticação originadas deste IP, tente novamente após 15 minutos.' }, // Mensagem como objeto JSON
    standardHeaders: true, // Envia headers RateLimit-*
    legacyHeaders: false, // Desabilita X-RateLimit-*
});

// Limiter para a rota de refresh token (pode ser um pouco mais permissivo)
const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Janela de 15 minutos
    max: 20, // Limita cada IP a 20 requisições de refresh nesta janela
    message: { message: 'Muitas tentativas de refresh token originadas deste IP, tente novamente após 15 minutos.' }, // Mensagem como objeto JSON
    standardHeaders: true,
    legacyHeaders: false,
});

// --- Rotas de Autenticação ---

// Rota para registrar um novo cliente (protegida pelo authLimiter)
router.post('/register', authLimiter, authController.register); //

// Rota para autenticar um cliente e obter tokens (protegida pelo authLimiter)
router.post('/login', authLimiter, authController.login); //

// Rota para verificar o e-mail com um token (sem limiter específico aqui, usará o geral se houver)
router.post('/verify-email', authController.verifyEmail); //

// Rota para solicitar a redefinição de senha (protegida pelo authLimiter)
router.post('/forgot-password', authLimiter, authController.forgotPassword); //

// Rota para efetivamente redefinir a senha com um token (protegida pelo authLimiter)
router.post('/reset-password', authLimiter, authController.resetPassword); //

// --- NOVA ROTA: Refresh Token ---
// Rota para obter um novo access token usando o refresh token (protegida pelo refreshLimiter)
router.post('/refresh-token', refreshLimiter, authController.refreshToken); //
// --- FIM NOVA ROTA ---

module.exports = router;