// app.js
require('dotenv').config();
const express = require('express');
const database = require('./src/config/database');
const apiRoutes = require('./src/api');
const errorHandler = require('./src/middlewares/errorHandler'); // <-- IMPORTAR

// ... (código de inicialização do banco)
database.startup().then(() => {
    const app = express();

    app.use(express.json());

    // Middleware para as rotas da API
    app.use('/api', apiRoutes);

    app.get('/', (req, res) => {
        res.send('API do Assessor de Investimentos Virtual está no ar!');
    });

    // MIDDLEWARE DE ERRO (DEVE SER O ÚLTIMO)
    app.use(errorHandler); // <-- USAR AQUI

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });

}).catch(err => {
    console.error("Erro ao iniciar a aplicação:", err);
});