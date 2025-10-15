// static/services/state.js

/**
 * Módulo para gerenciar o estado da sessão do usuário e dados da aplicação.
 */

let state = {
    currentUser: null,
    authToken: null,
    userRole: null, // Para guardar a role (admin ou cliente)
    allProducts: [],
    userCarteira: null,
};

/**
 * Inicia o estado da aplicação, carregando dados do sessionStorage se existirem.
 */
export function initState() {
    const storedUser = sessionStorage.getItem('currentUser');
    const storedToken = sessionStorage.getItem('authToken');
    const storedRole = sessionStorage.getItem('userRole'); // Carrega a role

    if (storedUser && storedToken) {
        state.currentUser = JSON.parse(storedUser);
        state.authToken = storedToken;
        state.userRole = storedRole; // Define a role no estado
    }
}

/**
 * Define a sessão do usuário no estado e no sessionStorage.
 */
export function setSession(user, token, role) { // Adicionamos 'role'
    state.currentUser = user;
    state.authToken = token;
    state.userRole = role; // Guarda a role
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('userRole', role); // Salva a role
}

/**
 * Limpa a sessão do usuário do estado e do sessionStorage.
 */
export function clearSession() {
    state.currentUser = null;
    state.authToken = null;
    state.userRole = null; // Limpa a role
    state.allProducts = [];
    state.userCarteira = null;
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole'); // Remove a role
}

// --- Getters ---
export function getCurrentUser() { return state.currentUser; }
export function getAuthToken() { return state.authToken; }
export function getUserRole() { return state.userRole; } // Novo getter para a role
export function getAllProducts() { return state.allProducts; }
export function getUserCarteira() { return state.userCarteira; }

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