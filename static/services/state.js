// static/services/state.js

/**
 * Módulo para gerenciar o estado da sessão do usuário e dados da aplicação.
 */

let state = {
    currentUser: null,
    authToken: null,
    allProducts: [],
    userCarteira: null,
    userRecomendacao: null, // <<<< ADICIONADO: Para guardar a recomendação >>>>
};

/**
 * Inicia o estado da aplicação, carregando dados do sessionStorage se existirem.
 */
export function initState() {
    const storedUser = sessionStorage.getItem('currentUser');
    const storedToken = sessionStorage.getItem('authToken');

    if (storedUser && storedToken) {
        state.currentUser = JSON.parse(storedUser);
        state.authToken = storedToken;
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
 */
export function clearSession() {
    state.currentUser = null;
    state.authToken = null;
    state.allProducts = [];
    state.userCarteira = null;
    state.userRecomendacao = null; // <<<< ADICIONADO: Limpar no logout >>>>
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
}

// --- Getters ---
export function getCurrentUser() { return state.currentUser; }
export function getAuthToken() { return state.authToken; }
export function getAllProducts() { return state.allProducts; }
export function getUserCarteira() { return state.userCarteira; }
export function getUserRecomendacao() { return state.userRecomendacao; } // <<<< ADICIONADO >>>>

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

export function setUserRecomendacao(recomendacao) { // <<<< ADICIONADO >>>>
    state.userRecomendacao = recomendacao;
}