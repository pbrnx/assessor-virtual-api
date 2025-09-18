// app.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const database = require('./src/config/database');
const apiRoutes = require('./src/api');
const errorHandler = require('./src/middlewares/errorHandler');

const swaggerDocument = YAML.load('./swagger.yaml');

database.startup().then(() => {
    const app = express();
    app.use(express.json());

    // --- ROTAS DA API E DOCUMENTAÇÃO (PRIMEIRO) ---
    // A ordem aqui é crucial. Rotas específicas primeiro.
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/api', apiRoutes);

    // --- SERVIR ARQUIVOS DO FRONTEND (SEGUNDO) ---
    // Serve a pasta 'static'
    app.use(express.static(path.join(__dirname, 'static')));

    // --- ROTA "CATCH-ALL" PARA A SPA ---
    // QUALQUER outra requisição GET que não foi resolvida até aqui
    // (não é API, não é um arquivo estático) deve servir o index.html
    // Isso é essencial para o roteamento do frontend funcionar ao recarregar a página.
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

    // --- MIDDLEWARE DE ERRO (DEVE SER O ÚLTIMO) ---
    app.use(errorHandler);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Frontend disponível em http://localhost:${PORT}`);
        console.log(`Documentação em http://localhost:${PORT}/api-docs`);
    });

}).catch(err => {
    console.error("Erro ao iniciar a aplicação:", err);
});