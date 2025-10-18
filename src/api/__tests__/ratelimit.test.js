const axios = require('axios'); // Instale com: npm install axios

const TARGET_URL = 'http://localhost:3000/api/auth/login'; // Ou outra rota
const REQUESTS_TO_SEND = 11; // Mais que o limite de 10

async function testLimit() {
    console.log(`Enviando ${REQUESTS_TO_SEND} requisições para ${TARGET_URL}...`);
    for (let i = 1; i <= REQUESTS_TO_SEND; i++) {
        try {
            const response = await axios.post(TARGET_URL, {
                email: `teste${i}@teste.com`,
                senha: '123'
            });
            console.log(`Req ${i}: Status ${response.status}`);
        } catch (error) {
            if (error.response) {
                // Erro retornado pela API (o que esperamos para 429)
                console.error(`Req ${i}: Erro - Status ${error.response.status} - Mensagem: ${error.response.data.message || error.response.data}`);
                // Verifica os headers do rate limit
                console.log('  Headers RateLimit:', {
                    limit: error.response.headers['ratelimit-limit'],
                    remaining: error.response.headers['ratelimit-remaining'],
                    reset: error.response.headers['ratelimit-reset'] ? new Date(parseInt(error.response.headers['ratelimit-reset'], 10) * 1000).toLocaleTimeString() : 'N/A',
                });

            } else {
                // Erro de rede/conexão
                console.error(`Req ${i}: Erro de conexão - ${error.message}`);
            }
        }
        // Pequena pausa para não sobrecarregar tudo instantaneamente (opcional)
        // await new Promise(resolve => setTimeout(resolve, 50));
    }
}

testLimit();