// static/services/api.js

import { getAccessToken, getRefreshToken, setAccessToken, clearSession } from './state.js'; // Importações atualizadas
import { showAlert, showLoader, hideLoader } from './ui.js';

const API_BASE_URL = '/api';

/**
 * Função base para fazer chamadas à API, sem lógica de refresh.
 * @param {string} endpoint - O endpoint da API (ex: '/clientes').
 * @param {object} options - Opções para fetch (method, body, etc.).
 * @param {HTMLElement|null} buttonElement - Botão para desabilitar durante a chamada.
 * @returns {Promise<any>} - Resposta JSON da API ou null para 204.
 * @throws {Error} - Lança erro com a mensagem da API ou status em caso de falha.
 */
export async function apiCall(endpoint, options = {}, buttonElement = null) {
    showLoader();
    if (buttonElement) buttonElement.disabled = true;

    const token = getAccessToken(); // Usa o Access Token
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Adiciona token de ACESSO se existir e não for rota de autenticação pública
    if (token && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register') && !endpoint.startsWith('/auth/refresh-token') && !endpoint.startsWith('/auth/forgot-password') && !endpoint.startsWith('/auth/reset-password') && !endpoint.startsWith('/auth/verify-email')) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

        // Trata respostas sem corpo (ex: 204 No Content do DELETE)
        if (response.status === 204) {
             return null;
        }

        // Tenta ler o corpo como JSON
        const data = await response.json().catch(async () => {
            // Se falhar, tenta ler como texto para obter mais detalhes do erro
            const text = await response.text();
            // Lança um erro mais informativo incluindo o texto, se houver
            throw new Error(`Erro ${response.status}: ${response.statusText} - ${text || '(Sem corpo na resposta)'}`);
        });

        // Se a resposta NÃO foi OK (status < 200 ou >= 300)
        if (!response.ok) {
            // Cria um erro que inclui o status code para verificação posterior
            const error = new Error(data.message || `Erro ${response.status}`);
            error.status = response.status; // Adiciona o status ao erro
            throw error; // Lança o erro com a mensagem da API
        }

        // Se a resposta foi OK, retorna os dados
        return data;

    } catch (error) {
        // Apenas re-lança o erro (seja o lançado acima ou um erro de rede)
        console.error(`Erro na chamada API para ${endpoint}:`, error);
        throw error;
    } finally {
        hideLoader();
        if (buttonElement) buttonElement.disabled = false;
    }
}


// --- Lógica para Refresh Automático ---

let isRefreshing = false; // Flag global para evitar múltiplas chamadas de refresh simultâneas
let failedQueue = []; // Fila para requisições que falharam com 401 enquanto o refresh estava em andamento

// Função para processar a fila de requisições pendentes após o refresh
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error); // Rejeita as promessas pendentes se o refresh falhar
        } else {
            prom.resolve(token); // Resolve as promessas (elas tentarão novamente com o novo token)
        }
    });
    failedQueue = []; // Limpa a fila
};

/**
 * Wrapper para apiCall que tenta atualizar o token automaticamente em caso de erro 401.
 * @param {string} endpoint - O endpoint da API.
 * @param {object} options - Opções para fetch.
 * @param {HTMLElement|null} buttonElement - Botão para desabilitar.
 * @returns {Promise<any>} - Resposta JSON da API ou null para 204.
 * @throws {Error} - Lança erro se a chamada inicial falhar (não 401) ou se o refresh falhar.
 */
export async function apiCallWithRefresh(endpoint, options = {}, buttonElement = null) {
    try {
        // 1. Tenta a chamada normal usando apiCall
        return await apiCall(endpoint, options, buttonElement);
    } catch (error) {
        // Guarda a requisição original para tentar novamente
        const originalRequestConfig = { endpoint, options, buttonElement };

        // 2. Verifica se o erro é 401 (Unauthorized) e NÃO é da rota de refresh
        //    (error.status foi adicionado na apiCall)
        if (error.status === 401 && !endpoint.includes('/auth/refresh-token')) {

            // 3. Se já houver um refresh em andamento, adiciona a chamada à fila
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: () => resolve(apiCall(endpoint, options, buttonElement)), // Tenta a chamada original de novo
                        reject
                    });
                });
            }

            // 4. Marca que o refresh iniciou
            isRefreshing = true;

            const refreshToken = getRefreshToken(); // Pega o refresh token do state/localStorage

            // Se não houver refresh token, desloga o usuário imediatamente
            if (!refreshToken) {
                console.log('Sem refresh token disponível, deslogando.');
                showAlert('Sua sessão expirou. Por favor, faça login novamente.', 'error');
                clearSession();
                window.location.hash = 'login'; // Redireciona para login
                isRefreshing = false;
                processQueue(new Error('Sessão expirada.'), null); // Informa erro para a fila
                return Promise.reject(error); // Rejeita a promessa original
            }

            // 5. Tenta obter um novo access token
            try {
                console.log('Access token expirado ou inválido, tentando refresh...');
                const refreshResponse = await apiCall('/auth/refresh-token', { // Usa apiCall base
                    method: 'POST',
                    body: JSON.stringify({ refreshToken: refreshToken })
                });

                const newAccessToken = refreshResponse.accessToken;
                console.log('Refresh token bem-sucedido.');
                setAccessToken(newAccessToken); // Atualiza o novo access token no state/sessionStorage

                processQueue(null, newAccessToken); // Libera a fila para tentar novamente

                // 6. Refaz a requisição original com o novo token
                console.log('Refazendo requisição original:', originalRequestConfig.endpoint);
                // Atualiza o header da requisição original (caso ela seja refeita pela fila)
                originalRequestConfig.options.headers = {
                    ...originalRequestConfig.options.headers,
                    'Authorization': `Bearer ${newAccessToken}`
                };
                return await apiCall(originalRequestConfig.endpoint, originalRequestConfig.options, originalRequestConfig.buttonElement);

            } catch (refreshError) {
                // 7. Se o refresh token falhar (inválido, expirado, etc.)
                console.error('Refresh token falhou:', refreshError);
                showAlert('Sua sessão expirou. Por favor, faça login novamente.', 'error');
                clearSession(); // Limpa a sessão
                window.location.hash = 'login'; // Redireciona para login
                processQueue(refreshError, null); // Informa erro para a fila
                return Promise.reject(refreshError); // Rejeita a promessa original
            } finally {
                isRefreshing = false; // Libera a flag de refresh em andamento
            }
        } else {
            // 8. Se o erro não for 401, apenas relança o erro original
            throw error;
        }
    }
}