// app.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const database = require('./src/config/database');
const apiRoutes = require('./src/api');
const errorHandler = require('./src/middlewares/errorHandler');
const { startCleanupJob } = require('./src/jobs/cleanupExpiredTokens'); // Job de limpeza

const swaggerDocument = YAML.load('./swagger.yaml');


database.startup().then(() => {
    const app = express();
    app.use(express.json());
    app.use(helmet()); 

    // --- CONFIGURAÇÃO DO RATE LIMITER ---
    // Aplica um limite geral para todas as requisições API
    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // Janela de 15 minutos
        max: 100, // Limita cada IP a 100 requisições por janela (windowMs)
        message: 'Muitas requisições originadas deste IP, tente novamente após 15 minutos.',
        standardHeaders: true, // Retorna informações do limite nos headers `RateLimit-*`
        legacyHeaders: false, // Desabilita os headers `X-RateLimit-*` (legados)
    });

    // Aplica um limite mais estrito especificamente para rotas de autenticação
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // Janela de 15 minutos
        max: 10, // Limita cada IP a 10 requisições de autenticação por janela
        message: 'Muitas tentativas de autenticação originadas deste IP, tente novamente após 15 minutos.',
        standardHeaders: true,
        legacyHeaders: false,
    });
    // --- FIM DA CONFIGURAÇÃO ---


    // --- ROTAS DA API E DOCUMENTAÇÃO ---
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Aplica o limiter GERAL a TODAS as rotas /api/*
    app.use('/api', apiLimiter); // <--- 2. Aplique o limiter geral ANTES das rotas da API


    app.use('/api', apiRoutes); // <--- Suas rotas da API


    // --- SERVIR ARQUIVOS DO FRONTEND ---
    app.use(express.static(path.join(__dirname, 'static')));

    // --- ROTA "CATCH-ALL" PARA A SPA ---
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, 'static', 'index.html'));
    });

    // --- MIDDLEWARE DE ERRO (DEVE SER O ÚLTIMO) ---
    app.use(errorHandler);

    const PORT = process.env.SERVER_PORT;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Frontend disponível em http://localhost:${PORT}`);
        console.log(`Documentação em http://localhost:${PORT}/api-docs`);
        
        // Iniciar job de limpeza de tokens expirados
        startCleanupJob();
    });

}).catch(err => {
    console.error("Erro ao iniciar a aplicação:", err);
    process.exit(1);
});
