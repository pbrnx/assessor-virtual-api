// static/services/state.js

/**
 * Módulo para gerenciar o estado da sessão do usuário e dados da aplicação.
 * Adicionado: userTheme para controle de Light/Dark Mode.
 */

let state = {
    currentUser: null,
    authToken: null,
    allProducts: [],
    userCarteira: null,
    userRecomendacao: null, 
    userTheme: null, // Variável para armazenar 'light-mode' ou 'dark-mode'
};

/**
 * Inicia o estado da aplicação, carregando dados do sessionStorage e a preferência de tema.
 */
export function initState() {
    const storedUser = sessionStorage.getItem('currentUser');
    const storedToken = sessionStorage.getItem('authToken');

    if (storedUser && storedToken) {
        state.currentUser = JSON.parse(storedUser);
        state.authToken = storedToken;
    }
    
    // LÓGICA DO TEMA: Carrega do localStorage ou define o padrão
    const storedTheme = localStorage.getItem('userTheme');
    if (storedTheme) {
        state.userTheme = storedTheme;
    } else {
        // Define o padrão: se o sistema operacional prefere 'light', usa 'light-mode', senão 'dark-mode'
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        state.userTheme = prefersLight ? 'light-mode' : 'dark-mode';
    }
}

/**
 * Define a sessão do usuário no estado e no sessionStorage.
 */
export function setSession(user, token) {
    state.currentUser = user;
    state.authToken = token;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    sessionStorage.setItem('authToken', token);
}

/**
 * Limpa a sessão do usuário do estado e do sessionStorage.
 * O userTheme não é limpo, pois é uma preferência de UI persistente.
 */
export function clearSession() {
    state.currentUser = null;
    state.authToken = null;
    state.allProducts = [];
    state.userCarteira = null;
    state.userRecomendacao = null;
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
}

// --- Getters ---
export function getCurrentUser() { return state.currentUser; }
export function getAuthToken() { return state.authToken; }
export function getAllProducts() { return state.allProducts; }
export function getUserCarteira() { return state.userCarteira; }
export function getUserRecomendacao() { return state.userRecomendacao; } 
export function getUserTheme() { return state.userTheme; } 

// --- Setters / Updaters ---
export function updateCurrentUser(updatedUser) {
    state.currentUser = updatedUser;
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
}

export function setAllProducts(products) {
    state.allProducts = products;
}

export function setUserCarteira(carteira) {
    state.userCarteira = carteira;
}

export function setUserRecomendacao(recomendacao) { 
    state.userRecomendacao = recomendacao;
}

/**
 * Define o novo tema do usuário e o salva no localStorage.
 */
export function setUserTheme(theme) {
    state.userTheme = theme;
    localStorage.setItem('userTheme', theme);
}