// static/services/api.js

import { getAuthToken, clearSession } from './state.js'; //
import { showAlert, showLoader, hideLoader } from './ui.js'; //

const API_BASE_URL = '/api';

/**
 * Função centralizada para fazer chamadas à API.
 * @param {string} endpoint - O endpoint da API a ser chamado (ex: '/clientes').
 * @param {object} options - As opções para a requisição fetch (method, body, etc.).
 * @param {HTMLElement|null} buttonElement - O botão que iniciou a ação, para desabilitá-lo.
 * @returns {Promise<any>} - A resposta da API em formato JSON.
 */
export async function apiCall(endpoint, options = {}, buttonElement = null) {
    showLoader(); //
    if (buttonElement) buttonElement.disabled = true;

    const token = getAuthToken(); //
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token && !endpoint.startsWith('/auth')) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let response; // Declarar fora do try para acessar no catch
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

        // Tenta ler o corpo da resposta como JSON, independentemente do status ok
        // Isso é importante para pegar a mensagem de erro da API
        const data = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}` })); // Fallback se o corpo não for JSON

        // Se a resposta NÃO foi OK (status < 200 ou >= 300)
        if (!response.ok) {
            // Se for 401 (Não Autorizado), desloga o usuário e lança a mensagem específica da API
            if (response.status === 401 && !endpoint.startsWith('/auth/login')) { // Evita deslogar na tela de login por erro de senha
                 showAlert('Sua sessão expirou ou é inválida. Por favor, faça login novamente.', 'error'); //
                 clearSession(); //
                 window.location.hash = 'login';
            }
            // Lança um erro com a mensagem vinda da API (ou o fallback)
            throw new Error(data.message || `Erro ${response.status}`);
        }

        // Se a resposta foi OK, retorna os dados
        return data;

    } catch (error) {
        // Apenas re-lança o erro (seja o lançado acima ou um erro de rede)
        // O handler que chamou apiCall (ex: handleLogin) vai pegar esse erro
        throw error;
    } finally {
        hideLoader(); //
        if (buttonElement) buttonElement.disabled = false;
    }
}