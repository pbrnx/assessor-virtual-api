// test.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Helper para imprimir os resultados de forma organizada
const logTest = (title, data) => {
    console.log(`\n--- ${title} ---`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
    console.log('--------------------\n');
};

const runFullApiTest = async () => {
    console.log('🚀 Iniciando suíte de testes COMPLETA da API do Assessor Virtual...');
    let clienteId;
    let produtoId;

    try {
        // ==========================================================
        // ETAPA 1: CICLO DE VIDA DO PRODUTO DE INVESTIMENTO
        // ==========================================================
        console.log('--- Iniciando testes de CRUD: Produto de Investimento ---');
        
        // 1.1 POST /investimentos (Criar Produto)
        const novoProduto = {
            nome: "Ação Teste S.A.",
            tipo: "Ações",
            risco: "Alto"
        };
        let res = await axios.post(`${BASE_URL}/investimentos`, novoProduto);
        produtoId = res.data.id;
        logTest('✅ [201] POST /investimentos (Criar Produto)', res.data);

        // 1.2 PUT /investimentos/:id (Atualizar Produto)
        const produtoAtualizado = {
            nome: "Ação Teste S.A. (Atualizada)",
            tipo: "Ações Nacionais",
            risco: "Alto"
        };
        res = await axios.put(`${BASE_URL}/investimentos/${produtoId}`, produtoAtualizado);
        logTest(`✅ [200] PUT /investimentos/${produtoId} (Atualizar Produto)`, res.data);


        // ==========================================================
        // ETAPA 2: CICLO DE VIDA DO CLIENTE
        // ==========================================================
        console.log('\n--- Iniciando testes de CRUD: Cliente ---');
        
        // 2.1 POST /clientes (Criar Cliente)
        const novoCliente = {
            nome: "Cliente de Teste",
            email: `teste-${Date.now()}@example.com`
        };
        res = await axios.post(`${BASE_URL}/clientes`, novoCliente);
        clienteId = res.data.id;
        logTest('✅ [201] POST /clientes (Criar Cliente)', res.data);

        // 2.2 PUT /clientes/:id (Atualizar Cliente)
        const clienteAtualizado = {
            nome: "Cliente de Teste (Nome Atualizado)",
            email: `teste-atualizado-${Date.now()}@example.com`
        };
        res = await axios.put(`${BASE_URL}/clientes/${clienteId}`, clienteAtualizado);
        logTest(`✅ [200] PUT /clientes/${clienteId} (Atualizar Cliente)`, res.data);


        // ==========================================================
        // ETAPA 3: FLUXO DE NEGÓCIO PRINCIPAL
        // ==========================================================
        console.log('\n--- Iniciando testes do Fluxo Principal (Perfil e Recomendação) ---');

        // 3.1 POST /clientes/:id/perfil (Definir Perfil)
        const respostas = { "respostas": { "toleranciaRisco": "B", "objetivo": "B", "conhecimento": "C" } };
        res = await axios.post(`${BASE_URL}/clientes/${clienteId}/perfil`, respostas);
        logTest(`✅ [200] POST /clientes/${clienteId}/perfil (Definir Perfil como 'Moderado')`, res.data);

        // 3.2 GET /clientes/:id/recomendacoes (Obter Recomendação)
        res = await axios.get(`${BASE_URL}/clientes/${clienteId}/recomendacoes`);
        logTest(`✅ [200] GET /clientes/${clienteId}/recomendacoes (Obter Recomendação)`, res.data);


    } catch (error) {
        console.error('\n❌ Um teste falhou!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Erro:', error.message);
        }
    } finally {
        // ==========================================================
        // ETAPA 4: LIMPEZA (CLEANUP)
        // ==========================================================
        console.log('\n--- Iniciando Limpeza dos Dados de Teste ---');
        try {
            if (produtoId) {
                // 4.1 DELETE /investimentos/:id (Deletar Produto)
                await axios.delete(`${BASE_URL}/investimentos/${produtoId}`);
                logTest(`🗑️  [204] DELETE /investimentos/${produtoId} (Produto de teste removido)`);
            }
            if (clienteId) {
                // 4.2 DELETE /clientes/:id (Deletar Cliente)
                await axios.delete(`${BASE_URL}/clientes/${clienteId}`);
                logTest(`🗑️  [204] DELETE /clientes/${clienteId} (Cliente de teste removido)`);
            }
        } catch (error) {
            console.error('Erro durante a limpeza:', error.message);
        }
        
        console.log('🏁 Suite de testes finalizada.');
    }
};

runFullApiTest();