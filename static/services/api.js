// static/services/api.js

import { getAuthToken, clearSession } from './state.js';
import { showAlert, showLoader, hideLoader } from './ui.js';

const API_BASE_URL = '/api';

/**
 * Função centralizada para fazer chamadas à API.
 * @param {string} endpoint - O endpoint da API a ser chamado (ex: '/clientes').
 * @param {object} options - As opções para a requisição fetch (method, body, etc.).
 * @param {HTMLElement|null} buttonElement - O botão que iniciou a ação, para desabilitá-lo.
 * @returns {Promise<any>} - A resposta da API em formato JSON.
 */
export async function apiCall(endpoint, options = {}, buttonElement = null) {
    showLoader();
    if (buttonElement) buttonElement.disabled = true;

    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Adiciona o token de autorização a todas as chamadas, exceto para as rotas de autenticação
    if (token && !endpoint.startsWith('/auth')) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

        // Se a resposta for 401 (Não Autorizado), a sessão é inválida ou expirou.
        if (response.status === 401) {
            showAlert('Sua sessão expirou. Por favor, faça login novamente.', 'error');
            clearSession(); // Limpa os dados do usuário do sessionStorage
            window.location.hash = 'login'; // Redireciona para a tela de login
            throw new Error('Não autorizado');
        }
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Ocorreu um erro na requisição.');
        }

        return data;
    } catch (error) {
        // Re-lança o erro para que a função que chamou a apiCall possa tratá-lo (ex: exibir um alerta)
        throw error;
    } finally {
        hideLoader();
        if (buttonElement) buttonElement.disabled = false;
    }
}