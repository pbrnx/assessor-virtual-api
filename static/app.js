// static/app.js

import { apiCall } from './services/api.js';
import {
    initState, setSession, clearSession, getCurrentUser, getUserRole,
    updateCurrentUser, getAllProducts, setAllProducts, setUserCarteira, getUserCarteira
} from './services/state.js';
import {
    switchView, showAlert, renderWelcomeMessage, renderDashboardHeader,
    renderRecomendacao, renderCarteira, renderMarketplace,
    getElements, openBuyModal, openSellModal, openConfirmModal, closeModal
} from './services/ui.js';

let currentRecomendacao = null;

// --- HANDLERS (lógica de negócio do frontend) ---

async function handleLogin(event) {
    event.preventDefault();
    const button = event.submitter;
    const email = event.target.elements['login-email'].value;
    const senha = event.target.elements['login-senha'].value;
    try {
        const data = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }, button);
        setSession(data.cliente, data.token, data.role);
        await initializeUserFlow();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const button = event.submitter;
    const nome = event.target.elements['register-nome'].value;
    const email = event.target.elements['register-email'].value;
    const senha = event.target.elements['register-senha'].value;
    try {
        const data = await apiCall('/auth/register', { method: 'POST', body: JSON.stringify({ nome, email, senha }) }, button);
        showAlert(data.message || 'Cadastro realizado! Verifique seu e-mail.', 'success');
        switchView('login');
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();
    const button = event.submitter;
    const email = event.target.elements['forgot-email'].value;
    try {
        const data = await apiCall('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }, button);
        showAlert(data.message, 'success');
        switchView('login');
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function handleResetPassword(event) {
    event.preventDefault();
    const button = event.submitter;
    const novaSenha = event.target.elements['reset-senha'].value;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    try {
        const data = await apiCall('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, novaSenha }) }, button);
        showAlert(data.message, 'success');
        window.history.replaceState({}, document.title, window.location.pathname);
        switchView('login');
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function handleVerifyEmail(token) {
    try {
        showAlert('Verificando sua conta...', 'success');
        const data = await apiCall('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) });
        showAlert(data.message, 'success');
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        window.history.replaceState({}, document.title, window.location.pathname);
        switchView('login');
    }
}

async function handleQuestionario(event) {
    event.preventDefault();
    const button = event.submitter;
    const user = getCurrentUser();
    const formData = new FormData(event.target);
    const respostas = Object.fromEntries(formData.entries());
    try {
        const perfil = await apiCall(`/clientes/${user.id}/perfil`, { method: 'POST', body: JSON.stringify({ respostas }) }, button);
        const updatedUser = { ...user, perfilId: perfil.id };
        updateCurrentUser(updatedUser);
        await loadDashboard();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// --- MUDANÇA FINAL AQUI ---
async function handleCompra(produtoId, valor, button) { // Recebe 'valor'
    try {
        // Envia 'valor' no corpo da requisição
        await apiCall(`/clientes/${getCurrentUser().id}/carteira/comprar`, { method: 'POST', body: JSON.stringify({ produtoId, valor }) }, button);
        showAlert('Compra realizada com sucesso!');
        closeModal('buy');
        await initializeUserFlow(); // Recarrega os dados
    } catch (error) {
        showAlert(error.message, 'error');
    }
}
// --- FIM DA MUDANÇA ---

async function handleVenda(produtoId, quantidade, button) {
    try {
        await apiCall(`/clientes/${getCurrentUser().id}/carteira/vender`, { method: 'POST', body: JSON.stringify({ produtoId, quantidade }) }, button);
        showAlert('Venda realizada com sucesso!');
        closeModal('sell');
        closeModal('confirm');
        await initializeUserFlow();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function handleDeposito(event) {
    event.preventDefault();
    const button = event.submitter;
    const valor = parseFloat(event.target.elements['deposit-amount'].value);
    try {
        await apiCall(`/clientes/${getCurrentUser().id}/depositar`, { method: 'POST', body: JSON.stringify({ valor }) }, button);
        showAlert('Depósito realizado com sucesso!');
        closeModal('deposit');
        await initializeUserFlow();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function handleInvestirRecomendacao() {
    if (!currentRecomendacao) {
        showAlert('Não há recomendação para investir.', 'error');
        return;
    }
    const user = getCurrentUser();
    if (user.saldo <= 0) {
        showAlert('Você não tem saldo suficiente para investir.', 'error');
        return;
    }
    openConfirmModal(
        `Tem certeza que deseja investir todo o seu saldo de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(user.saldo)} na carteira recomendada?`,
        async () => {
            const button = getElements().dashboard.investirRecomendacaoBtn;
            try {
                await apiCall(
                    `/clientes/${user.id}/recomendacoes/investir`,
                    {
                        method: 'POST',
                        body: JSON.stringify({ carteiraRecomendada: currentRecomendacao.carteiraRecomendada })
                    },
                    button
                );
                showAlert('Investimento realizado com sucesso!', 'success');
                await loadDashboard();
            } catch (error) {
                showAlert(error.message, 'error');
            }
        }
    );
}

function handleRecalcularRecomendacao() {
    switchView('questionario');
}

async function loadDashboard() {
    const user = getCurrentUser();
    try {
        const userDetails = await apiCall(`/clientes/${user.id}`);
        updateCurrentUser(userDetails);
        const [recomendacaoData, produtosData, carteiraData] = await Promise.all([
            apiCall(`/clientes/${userDetails.id}/recomendacoes`),
            apiCall('/investimentos'),
            apiCall(`/clientes/${userDetails.id}/carteira`),
        ]);
        currentRecomendacao = recomendacaoData;
        setAllProducts(produtosData);
        setUserCarteira(carteiraData);
        renderDashboardHeader(userDetails, recomendacaoData);
        renderRecomendacao(recomendacaoData);
        renderCarteira(carteiraData);
        renderMarketplace(produtosData);
        switchView('dashboard');
    } catch (error) {
        if (error.message !== 'Não autorizado') showAlert(error.message, 'error');
    }
}

function setupEventListeners() {
    const elements = getElements();
    elements.forms.login.addEventListener('submit', handleLogin);
    elements.forms.register.addEventListener('submit', handleRegister);
    elements.forms.forgotPassword.addEventListener('submit', handleForgotPassword);
    elements.forms.resetPassword.addEventListener('submit', handleResetPassword);
    elements.forms.questionario.addEventListener('submit', handleQuestionario);
    elements.forms.deposit.addEventListener('submit', handleDeposito);
    elements.links.showRegister.addEventListener('click', (e) => { e.preventDefault(); switchView('register'); });
    elements.links.showLogin.addEventListener('click', (e) => { e.preventDefault(); switchView('login'); });
    elements.links.showForgotPassword.addEventListener('click', (e) => { e.preventDefault(); switchView('forgotPassword'); });
    elements.links.backToLogin.addEventListener('click', (e) => { e.preventDefault(); switchView('login'); });
    elements.userSession.logoutButton.addEventListener('click', () => {
        clearSession();
        window.location.reload();
    });
    elements.dashboard.marketplaceFilters.addEventListener('click', (e) => {
        if (e.target.matches('.filter-btn')) {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            renderMarketplace(getAllProducts(), e.target.dataset.risk);
        }
    });
    elements.dashboard.marketplaceGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (card && getUserRole() === 'cliente') {
            const productId = parseInt(card.dataset.productId, 10);
            const product = getAllProducts().find(p => p.id === productId);
            if (product) openBuyModal(product, getCurrentUser(), handleCompra);
        }
    });
    elements.dashboard.carteiraContainer.addEventListener('click', (e) => {
        const sellBtn = e.target.closest('.sell-btn');
        const sellAllBtn = e.target.closest('.sell-all-btn');
        const carteira = getUserCarteira();
        if (!carteira) return;
        if (sellBtn) {
            const productId = parseInt(sellBtn.dataset.productId, 10);
            const ativo = carteira.ativos.find(a => a.produtoId === productId);
            if (ativo) openSellModal(ativo, handleVenda);
        } else if (sellAllBtn) {
            const productId = parseInt(sellAllBtn.dataset.productId, 10);
            const ativo = carteira.ativos.find(a => a.produtoId === productId);
            if (ativo) {
                openConfirmModal(
                    `Tem certeza que deseja vender todas as ${ativo.quantidade.toFixed(4)} cotas de ${ativo.nome}?`,
                    () => handleVenda(ativo.produtoId, ativo.quantidade, sellAllBtn)
                );
            }
        }
    });
    elements.dashboard.investirRecomendacaoBtn.addEventListener('click', handleInvestirRecomendacao);
    elements.dashboard.recalcularRecomendacaoBtn.addEventListener('click', handleRecalcularRecomendacao);
    Object.values(elements.modals).forEach(modal => {
        if (modal.overlay) modal.overlay.addEventListener('click', (e) => { if (e.target === modal.overlay) closeModal(modal.overlay.id.split('-')[0]); });
        if (modal.closeBtn) modal.closeBtn.addEventListener('click', () => closeModal(modal.overlay.id.split('-')[0]));
    });
}

async function initializeUserFlow() {
    const user = getCurrentUser();
    const role = getUserRole();
    if (!user) {
        switchView('login');
        return;
    }
    renderWelcomeMessage(user.nome);
    if (role === 'admin') {
        try {
            const elements = getElements();
            const produtosData = await apiCall('/investimentos');
            setAllProducts(produtosData);
            elements.dashboard.header.innerHTML = `<div class="profile-info"><h1>Painel do Administrador</h1></div>`;
            elements.dashboard.recomendacaoContainer.parentElement.style.display = 'none';
            elements.dashboard.carteiraContainer.closest('.sidebar').style.display = 'none';
            document.querySelector('.main-content').style.gridTemplateColumns = '1fr';
            renderMarketplace(produtosData);
            switchView('dashboard');
        } catch (error) {
            if (error.message !== 'Não autorizado') showAlert(error.message, 'error');
        }
        return;
    }
    try {
        const elements = getElements();
        elements.dashboard.recomendacaoContainer.parentElement.style.display = 'block';
        elements.dashboard.carteiraContainer.closest('.sidebar').style.display = 'block';
        document.querySelector('.main-content').style.gridTemplateColumns = '';
        const userDetails = await apiCall(`/clientes/${user.id}`);
        updateCurrentUser(userDetails);
        if (userDetails.perfilId) {
            await loadDashboard();
        } else {
            switchView('questionario');
        }
    } catch (error) {
        if (error.message !== 'Não autorizado') showAlert(error.message, 'error');
    }
}

async function handleUrlActions() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const action = urlParams.get('action');
    if (!token || !action) return false;
    if (action === 'resetPassword') {
        switchView('resetPassword');
        return true;
    }
    if (action === 'verifyEmail') {
        await handleVerifyEmail(token);
        return true;
    }
    return false;
}

async function main() {
    const urlActionHandled = await handleUrlActions();
    if (urlActionHandled) {
        setupEventListeners();
        return;
    }
    initState();
    setupEventListeners();
    if (getCurrentUser()) {
        await initializeUserFlow();
    } else {
        switchView('login');
    }
}

main();