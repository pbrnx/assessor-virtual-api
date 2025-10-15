// static/app.js

import { apiCall } from './services/api.js';
import { 
    initState, setSession, clearSession, getCurrentUser, 
    updateCurrentUser, getAllProducts, setAllProducts, setUserCarteira, getUserCarteira,
    setUserRecomendacao, getUserRecomendacao 
} from './services/state.js';
import { 
    switchView, showAlert, renderWelcomeMessage, renderDashboardHeader,
    renderRecomendacao, renderCarteira, renderMarketplace,
    getElements, openBuyModal, openSellModal, openConfirmModal, closeModal, formatCurrency
} from './services/ui.js';

let actionToken = null;

// --- HANDLERS (lógica de negócio do frontend) ---

async function handleLogin(event) {
    event.preventDefault();
    const button = event.submitter;
    const email = event.target.elements['login-email'].value;
    const senha = event.target.elements['login-senha'].value;
    try {
        const data = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }, button);
        setSession(data.cliente, data.token);
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
    const token = actionToken;
    try {
        const data = await apiCall('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, novaSenha }) }, button);
        showAlert(data.message, 'success');
        switchView('login');
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function handleVerifyEmail() {
    const token = actionToken;
    try {
        showAlert('Verificando sua conta...', 'success');
        const data = await apiCall('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) });
        showAlert(data.message, 'success');
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
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

async function handleCompra(produtoId, quantidade, button) {
    // <<<< CORRIGIDO: Validação mais robusta dos dados antes de enviar >>>>
    const idNum = Number(produtoId);
    const qtdNum = Number(quantidade);

    if (isNaN(idNum) || idNum <= 0) {
        showAlert('Ocorreu um erro interno (ID do produto inválido).', 'error');
        return;
    }
    if (isNaN(qtdNum) || qtdNum <= 0) {
        showAlert('A quantidade para compra deve ser um número positivo.', 'error');
        return;
    }

    const payload = { produtoId: idNum, quantidade: qtdNum };

    try {
        await apiCall(`/clientes/${getCurrentUser().id}/carteira/comprar`, { 
            method: 'POST', 
            body: JSON.stringify(payload) 
        }, button);
        showAlert('Compra realizada com sucesso!');
        closeModal('buy');
        await initializeUserFlow();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function handleVenda(produtoId, quantidade, button) {
    const idNum = Number(produtoId);
    const qtdNum = Number(quantidade);

    if (isNaN(idNum) || idNum <= 0) {
        showAlert('Ocorreu um erro interno (ID do produto inválido).', 'error');
        return;
    }
    if (isNaN(qtdNum) || qtdNum <= 0) {
        showAlert('A quantidade para venda deve ser um número positivo.', 'error');
        return;
    }
    
    const payload = { produtoId: idNum, quantidade: qtdNum };

    try {
        await apiCall(`/clientes/${getCurrentUser().id}/carteira/vender`, { 
            method: 'POST', 
            body: JSON.stringify(payload) 
        }, button);
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
    if (!valor || valor <= 0) {
        showAlert('Por favor, insira um valor de depósito válido.', 'error');
        return;
    }
    try {
        await apiCall(`/clientes/${getCurrentUser().id}/depositar`, { method: 'POST', body: JSON.stringify({ valor }) }, button);
        showAlert('Depósito realizado com sucesso!');
        closeModal('deposit');
        await initializeUserFlow();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function handleInvestirRecomendacao(event) {
    const button = event.target;
    const user = getCurrentUser();
    const recomendacao = getUserRecomendacao();

    if (!recomendacao || !recomendacao.carteiraRecomendada || recomendacao.carteiraRecomendada.length === 0) {
        showAlert('Não foi possível encontrar a carteira recomendada para investir.', 'error');
        return;
    }
    
    if (!user.saldo || user.saldo <= 0) {
        showAlert('Você não tem saldo suficiente para investir.', 'error');
        return;
    }

    openConfirmModal(
        `Tem certeza que deseja investir todo o seu saldo de ${formatCurrency(user.saldo)} na carteira recomendada?`,
        async () => {
            try {
                const payload = { carteiraRecomendada: recomendacao.carteiraRecomendada };
                await apiCall(`/clientes/${user.id}/recomendacoes/investir`, { 
                    method: 'POST', 
                    body: JSON.stringify(payload) 
                }, button);
                showAlert('Investimento realizado com sucesso!', 'success');
                await initializeUserFlow();
            } catch (error) {
                showAlert(error.message, 'error');
            }
        }
    );
}

async function handleRecalcularRecomendacao(event) {
    switchView('questionario');
}

async function loadDashboard() {
    const user = getCurrentUser();
    try {
        const [userDetails, recomendacaoData, produtosData, carteiraData] = await Promise.all([
            apiCall(`/clientes/${user.id}`),
            apiCall(`/clientes/${user.id}/recomendacoes`),
            apiCall('/investimentos'),
            apiCall(`/clientes/${user.id}/carteira`),
        ]);

        updateCurrentUser(userDetails);
        setAllProducts(produtosData);
        setUserCarteira(carteiraData);
        setUserRecomendacao(recomendacaoData);
        
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

    elements.userSession.logoutButton.addEventListener('click', () => { clearSession(); switchView('login'); });

    elements.dashboard.marketplaceFilters.addEventListener('click', (e) => {
        if (e.target.matches('.filter-btn')) {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            renderMarketplace(getAllProducts(), e.target.dataset.risk);
        }
    });

    elements.dashboard.marketplaceGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (card) {
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
    if (!user) {
        switchView('login');
        return;
    }
    renderWelcomeMessage(user.nome);
    try {
        const userDetails = await apiCall(`/clientes/${user.id}`);
        updateCurrentUser(userDetails);
        if (userDetails.perfilId) {
            await loadDashboard();
        } else {
            switchView('questionario');
        }
    } catch (error) {
        if (error.message !== 'Não autorizado') {
            showAlert(error.message, 'error');
        }
    }
}

async function handleUrlActions() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const action = urlParams.get('action');
    
    if (!token || !action) return false;

    actionToken = token;
    window.history.replaceState({}, document.title, window.location.pathname);

    if (action === 'resetPassword') {
        switchView('resetPassword');
        return true;
    }
    if (action === 'verifyEmail') {
        await handleVerifyEmail();
        return true;
    }
    return false;
}

async function main() {
    const urlActionHandled = await handleUrlActions();
    setupEventListeners();
    if (urlActionHandled) {
        return;
    }
    initState();
    if (getCurrentUser()) {
        await initializeUserFlow();
    } else {
        switchView('login');
    }
}

main();