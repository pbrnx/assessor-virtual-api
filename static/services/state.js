// static/services/state.js

/**
 * Módulo para gerenciar o estado da sessão do usuário e dados da aplicação.
 * Adicionado: userTheme para controle de Light/Dark Mode.
 * Atualizado: Gerenciamento de accessToken e refreshToken.
 */

let state = {
    currentUser: null,
    accessToken: null,  // Renomeado de authToken para accessToken
    refreshToken: null, // Novo estado para refresh token
    allProducts: [],
    userCarteira: null,
    userRecomendacao: null,
    userTheme: null, // Variável para armazenar 'light-mode' ou 'dark-mode'
};

/**
 * Inicia o estado da aplicação, carregando dados do sessionStorage/localStorage e a preferência de tema.
 */
export function initState() {
    const storedUser = sessionStorage.getItem('currentUser');
    const storedAccessToken = sessionStorage.getItem('accessToken'); // Busca accessToken da sessionStorage
    const storedRefreshToken = localStorage.getItem('refreshToken'); // Busca refreshToken da localStorage

    // Precisa pelo menos do usuário e access token para considerar a sessão inicial válida
    if (storedUser && storedAccessToken) {
        try {
            state.currentUser = JSON.parse(storedUser);
            state.accessToken = storedAccessToken;
            state.refreshToken = storedRefreshToken; // Carrega refreshToken se existir
        } catch (e) {
            console.error("Erro ao parsear usuário do sessionStorage:", e);
            // Limpa dados inválidos se o parse falhar
            clearSession();
        }
    } else {
        // Se não houver usuário ou accessToken, garante que tudo está limpo
        clearSession();
    }

    // Lógica do tema: Carrega do localStorage ou define o padrão
    const storedTheme = localStorage.getItem('userTheme');
    if (storedTheme) {
        state.userTheme = storedTheme;
    } else {
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        state.userTheme = prefersLight ? 'light-mode' : 'dark-mode';
    }
}

/**
 * Define a sessão do usuário no estado e no armazenamento apropriado.
 * @param {object} user - Objeto do usuário.
 * @param {string} accessToken - Token de acesso JWT.
 * @param {string} refreshToken - Token de refresh JWT.
 */
export function setSession(user, accessToken, refreshToken) {
    state.currentUser = user;
    state.accessToken = accessToken;
    state.refreshToken = refreshToken;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    sessionStorage.setItem('accessToken', accessToken); // Access token na sessionStorage (curta duração)
    localStorage.setItem('refreshToken', refreshToken);   // Refresh token na localStorage (longa duração)
}

/**
 * Limpa a sessão do usuário do estado e do armazenamento.
 * O userTheme não é limpo, pois é uma preferência de UI persistente.
 */
export function clearSession() {
    state.currentUser = null;
    state.accessToken = null;
    state.refreshToken = null; // Limpa refreshToken do estado
    state.allProducts = [];
    state.userCarteira = null;
    state.userRecomendacao = null;
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('accessToken'); // Remove accessToken da sessionStorage
    localStorage.removeItem('refreshToken');   // Remove refreshToken da localStorage
}

// --- Getters ---
export function getCurrentUser() { return state.currentUser; }
export function getAccessToken() { return state.accessToken; } // Renomeado de getAuthToken
export function getRefreshToken() { return state.refreshToken; } // Novo
export function getAllProducts() { return state.allProducts; }
export function getUserCarteira() { return state.userCarteira; }
export function getUserRecomendacao() { return state.userRecomendacao; }
export function getUserTheme() { return state.userTheme; }

// --- Setters / Updaters ---

/**
 * Atualiza apenas o Access Token no estado e na sessionStorage.
 * Usado após um refresh bem-sucedido.
 * @param {string} token - O novo Access Token.
 */
export function setAccessToken(token) {
    state.accessToken = token;
    sessionStorage.setItem('accessToken', token);
}

/**
 * Atualiza os dados do usuário atual no estado e na sessionStorage.
 * @param {object} updatedUser - Objeto com os dados atualizados do usuário.
 */
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
 * @param {string} theme - O nome do tema ('light-mode' ou 'dark-mode').
 */
export function setUserTheme(theme) {
    state.userTheme = theme;
    localStorage.setItem('userTheme', theme);
}