// app.js
require('dotenv').config();
const express = require('express');
const database = require('./src/config/database');

// --- Configuração do Swagger com arquivo estático ---
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); // Importa a nova biblioteca
const swaggerDocument = YAML.load('./swagger.yaml'); // Carrega o arquivo

// Importação das rotas
const clienteRoutes = require('./src/routes/cliente.routes');
const produtoRoutes = require('./src/routes/produto.routes');
const carrinhoRoutes = require('./src/routes/carrinho.routes');
const pedidoRoutes = require('./src/routes/pedido.routes');
const pagamentoRoutes = require('./src/routes/pagamento.routes');
const authRoutes = require('./src/routes/auth.routes'); 


database.startup().then(() => {
    // Cria a instância do Express
    const app = express();

    // --- Rota da Documentação ---
    // Agora usa o objeto carregado do arquivo
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Middleware para permitir que o Express entenda JSON no corpo das requisições
    app.use(express.json());

    // Servir arquivos estáticos
    app.use(express.static('static'));

    // Rota raiz redireciona para a documentação
    app.get('/', (req, res) => {
        res.redirect('/api-docs');
    });

    // Configuração das rotas da API
    app.use('/api/auth', authRoutes);
    app.use('/api/clientes', clienteRoutes);
    app.use('/api/produtos', produtoRoutes);
    app.use('/api/carrinhos', carrinhoRoutes);
    app.use('/api/pedidos', pedidoRoutes);
    app.use('/api/pagamentos', pagamentoRoutes);

    // Define a porta em que o servidor vai escutar
    const PORT = process.env.PORT || 3000;

    // Inicia o servidor
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Acesse a documentação em http://localhost:${PORT}/api-docs`);
    });

}).catch(err => {
    console.error("Erro ao iniciar a aplicação:", err);
    process.exit(1); // Encerra se não conseguir iniciar o pool

})