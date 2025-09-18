// app.js
require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express'); // Importar swagger-ui
const YAML = require('yamljs'); // Importar yamljs

const database = require('./src/config/database');
const apiRoutes = require('./src/api');
const errorHandler = require('./src/middlewares/errorHandler');

// Carrega o arquivo swagger.yaml
const swaggerDocument = YAML.load('./swagger.yaml');

database.startup().then(() => {
    const app = express();
    app.use(express.json());

    // Rota para a documentação da API
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Middleware para as rotas da API
    app.use('/api', apiRoutes);

    // Rota raiz redireciona para a documentação
    app.get('/', (req, res) => {
        res.redirect('/api-docs');
    });

    // MIDDLEWARE DE ERRO (DEVE SER O ÚLTIMO)
    app.use(errorHandler);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Acesse a documentação em http://localhost:${PORT}/api-docs`);
    });

}).catch(err => {
    console.error("Erro ao iniciar a aplicação:", err);
});
