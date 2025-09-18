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
    console.log('🚀 Iniciando suíte de testes da API do Assessor Virtual...');
    let clienteId;

    try {
        // --- 1. Testando Endpoints de CLIENTES ---
        console.log('--- Iniciando testes de Clientes ---');
        
        // POST /clientes (Criar Cliente)
        const novoCliente = {
            nome: "Cliente Teste Automatizado",
            email: `teste-${Date.now()}@example.com`
        };
        let res = await axios.post(`${BASE_URL}/clientes`, novoCliente);
        clienteId = res.data.id;
        logTest('✅ [201] POST /clientes (Criar Cliente)', res.data);

        // GET /clientes (Listar Clientes)
        res = await axios.get(`${BASE_URL}/clientes`);
        logTest('✅ [200] GET /clientes (Listar Clientes)', res.data);

        // GET /clientes/:id (Buscar Cliente por ID)
        res = await axios.get(`${BASE_URL}/clientes/${clienteId}`);
        logTest(`✅ [200] GET /clientes/${clienteId} (Buscar Cliente por ID)`, res.data);
        

        // --- 2. Testando Endpoints de PERFIL ---
        console.log('\n--- Iniciando testes de Perfil de Investidor ---');
        
        // POST /clientes/:id/perfil (Definir Perfil)
        const respostasQuestionario = {
            "respostas": {
                "toleranciaRisco": "C", // Arrojado
                "objetivo": "C",
                "conhecimento": "C"
            }
        };
        res = await axios.post(`${BASE_URL}/clientes/${clienteId}/perfil`, respostasQuestionario);
        logTest(`✅ [200] POST /clientes/${clienteId}/perfil (Definir Perfil)`, res.data);


        // --- 3. Testando Endpoints de INVESTIMENTOS e RECOMENDAÇÕES ---
        console.log('\n--- Iniciando testes de Investimentos e Recomendações ---');

        // GET /investimentos (Listar Produtos de Investimento)
        res = await axios.get(`${BASE_URL}/investimentos`);
        logTest('✅ [200] GET /investimentos (Listar Produtos)', res.data);

        // GET /clientes/:id/recomendacoes (Obter Recomendação)
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
        // Como não implementamos um endpoint de DELETE, não há etapa de limpeza.
        console.log('🏁 Suite de testes finalizada.');
    }
};

runFullApiTest();