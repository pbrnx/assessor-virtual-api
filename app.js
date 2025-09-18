// app.js
require('dotenv').config();
const express = require('express');
const database = require('./src/config/database');
const apiRoutes = require('./src/api'); // Importaremos o agrupador de rotas

// Inicializa o banco de dados
database.startup().then(() => {
    // Cria a instância do Express
    const app = express();

    // Middleware para permitir que o Express entenda JSON
    app.use(express.json());

    // Middleware para as rotas da API
    app.use('/api', apiRoutes);

    // Rota raiz
    app.get('/', (req, res) => {
        res.send('API do Assessor de Investimentos Virtual está no ar!');
    });

    // Define a porta do servidor
    const PORT = process.env.PORT || 3000;

    // Inicia o servidor
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });

}).catch(err => {
    console.error("Erro ao iniciar a aplicação:", err);
});