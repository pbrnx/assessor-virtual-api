// static/services/ui.js

/**
 * Módulo para gerenciar todas as interações com a Interface do Usuário (UI).
 */

const elements = {
    views: {
        login: document.getElementById('login-view'),
        register: document.getElementById('register-view'),
        forgotPassword: document.getElementById('forgot-password-view'),
        resetPassword: document.getElementById('reset-password-view'),
        questionario: document.getElementById('questionario-view'),
        dashboard: document.getElementById('dashboard-view'),
    },
    forms: {
        login: document.getElementById('login-form'),
        register: document.getElementById('register-form'),
        forgotPassword: document.getElementById('forgot-password-form'),
        resetPassword: document.getElementById('reset-password-form'),
        questionario: document.getElementById('questionario-form'),
        deposit: document.getElementById('deposit-form'),
    },
    links: {
        showRegister: document.getElementById('show-register-link'),
        showLogin: document.getElementById('show-login-link'),
        showForgotPassword: document.getElementById('show-forgot-password-link'),
        backToLogin: document.getElementById('back-to-login-link'),
    },
    userSession: {
        nav: document.getElementById('user-session-nav'),
        welcomeMessage: document.getElementById('welcome-message'),
        logoutButton: document.getElementById('logout-button'),
    },
    dashboard: {
        header: document.getElementById('dashboard-header'),
        recomendacaoContainer: document.getElementById('recomendacao-container'),
        marketplaceGrid: document.getElementById('marketplace-grid'),
        marketplaceFilters: document.getElementById('marketplace-filters'),
        carteiraContainer: document.getElementById('carteira-container'),
        carteiraChartCanvas: document.getElementById('carteira-chart').getContext('2d'),
        investirRecomendacaoBtn: document.getElementById('investir-recomendacao-btn'),
        recalcularRecomendacaoBtn: document.getElementById('recalcular-recomendacao-btn'),
    },
    modals: {
        buy: { overlay: document.getElementById('buy-modal'), closeBtn: document.getElementById('buy-modal-close-btn'), body: document.getElementById('buy-modal-body') },
        sell: { overlay: document.getElementById('sell-modal'), closeBtn: document.getElementById('sell-modal-close-btn'), body: document.getElementById('sell-modal-body') },
        deposit: { overlay: document.getElementById('deposit-modal'), closeBtn: document.getElementById('deposit-modal-close-btn') },
        confirm: { overlay: document.getElementById('confirm-modal'), closeBtn: document.getElementById('confirm-modal-close-btn'), message: document.getElementById('confirm-modal-message'), confirmBtn: document.getElementById('confirm-modal-confirm-btn') }
    },
    loadingOverlay: document.getElementById('loading-overlay'),
    alertContainer: document.getElementById('alert-container'),
};

let carteiraChartInstance = null;
export const getElements = () => elements;
export const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const showLoader = () => elements.loadingOverlay.classList.remove('hidden');
export const hideLoader = () => elements.loadingOverlay.classList.add('hidden');

export function showAlert(message, type = 'success') {
    elements.alertContainer.textContent = message;
    elements.alertContainer.className = `alert ${type}`;
    elements.alertContainer.classList.remove('hidden');
    setTimeout(() => elements.alertContainer.classList.add('hidden'), 5000);
}

export function switchView(viewName) {
    Object.values(elements.views).forEach(view => view.classList.add('hidden'));
    if (elements.views[viewName]) {
        elements.views[viewName].classList.remove('hidden');
    }
    const isAuthView = ['login', 'register', 'forgotPassword', 'resetPassword'].includes(viewName);
    elements.userSession.nav.classList.toggle('hidden', isAuthView);
}

export function renderWelcomeMessage(userName) {
    elements.userSession.welcomeMessage.textContent = `Olá, ${userName.split(' ')[0]}!`;
}

export function renderDashboardHeader(user, recomendacaoData) {
    elements.dashboard.header.innerHTML = `<div class="profile-info"><h1>Seu Dashboard <span class="profile-badge">${recomendacaoData.perfilInvestidor}</span></h1></div><div class="account-balance"><span>Saldo em conta</span><div class="saldo">${formatCurrency(user.saldo)}</div><button id="deposit-btn" class="form-button secondary">Depositar</button></div>`;
    document.getElementById('deposit-btn').addEventListener('click', () => {
        elements.modals.deposit.overlay.classList.remove('hidden');
    });
}

export function renderRecomendacao(recomendacaoData) {
    elements.dashboard.recomendacaoContainer.innerHTML = recomendacaoData.carteiraRecomendada.map(item => `<div class="recomendacao-card"><div><h4>${item.nome}</h4><p class="info">Tipo: ${item.tipo} | Risco: ${item.risco}</p></div><div class="percentual">${item.percentualAlocacao}%</div></div>`).join('');
}

export function renderCarteira(carteiraData) {
    if (!carteiraData || carteiraData.ativos.length === 0) {
        elements.dashboard.carteiraContainer.innerHTML = `<div class="carteira-placeholder">Você ainda não possui ativos.</div>`;
    } else {
        const ativosHTML = carteiraData.ativos.map(ativo => `<div class="carteira-item"><div class="item-header"><span>${ativo.nome}</span><div class="item-actions"><button class="sell-all-btn" data-product-id="${ativo.produtoId}" title="Vender todas as cotas">Vender Tudo</button><button class="sell-btn" data-product-id="${ativo.produtoId}">Vender</button></div></div><div class="item-body"><div>${ativo.quantidade.toFixed(4)} cotas x ${formatCurrency(ativo.precoUnitario)}</div><div><strong>Total: ${formatCurrency(ativo.valorTotal)}</strong></div></div></div>`).join('');
        const totalHTML = `<hr><div class="item-header"><span>TOTAL INVESTIDO</span> <span>${formatCurrency(carteiraData.valorTotalInvestido)}</span></div>`;
        elements.dashboard.carteiraContainer.innerHTML = ativosHTML + totalHTML;
    }
    renderCarteiraChart(carteiraData);
}

function renderCarteiraChart(carteiraData) {
    if (carteiraChartInstance) carteiraChartInstance.destroy();
    const chartContainer = document.querySelector('.chart-container');
    if (!carteiraData || carteiraData.ativos.length === 0) {
        chartContainer.classList.add('hidden');
        return;
    }
    chartContainer.classList.remove('hidden');
    carteiraChartInstance = new Chart(elements.dashboard.carteiraChartCanvas, {
        type: 'pie', data: { labels: carteiraData.ativos.map(a => a.nome), datasets: [{ data: carteiraData.ativos.map(a => a.valorTotal), backgroundColor: ['#4a6cf7', '#13c296', '#fd7e14', '#dc3545', '#6f42c1', '#20c997', '#0dcaf0', '#ffc107'], borderColor: '#ffffff', borderWidth: 2 }] },
        options: { responsive: true, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${formatCurrency(context.parsed)}` } } } }
    });
}

export function renderMarketplace(products, riskFilter = 'todos') {
    const filteredProducts = riskFilter === 'todos' ? products : products.filter(p => p.risco.toLowerCase() === riskFilter.toLowerCase());
    elements.dashboard.marketplaceGrid.innerHTML = filteredProducts.map(p => `<div class="product-card" data-product-id="${p.id}"><h4>${p.nome}</h4><div class="price">${formatCurrency(p.preco)}</div><div class="details"><span>${p.tipo}</span><span class="risk-badge ${p.risco.toLowerCase()}">${p.risco}</span></div></div>`).join('');
}

export function openBuyModal(product, currentUser, onConfirm) {
    elements.modals.buy.body.innerHTML = `<h3>Comprar ${product.nome}</h3><div class="product-info"><p><strong>Preço:</strong> ${formatCurrency(product.preco)}</p></div><p class="info-saldo">Seu saldo: ${formatCurrency(currentUser.saldo)}</p><form id="buy-form"><div class="form-group"><label for="buy-quantity">Quantidade</label><input type="number" id="buy-quantity" class="form-input" min="0.0001" step="any" required></div><p>Custo total: <span class="valor-total" id="valor-total-compra">${formatCurrency(0)}</span></p><button type="submit" class="form-button">Confirmar Compra</button></form>`;
    const quantityInput = document.getElementById('buy-quantity'), totalSpan = document.getElementById('valor-total-compra');
    quantityInput.addEventListener('input', () => totalSpan.textContent = formatCurrency((parseFloat(quantityInput.value) || 0) * product.preco));
    document.getElementById('buy-form').addEventListener('submit', (e) => { e.preventDefault(); onConfirm(product.id, parseFloat(quantityInput.value), e.submitter); });
    elements.modals.buy.overlay.classList.remove('hidden');
}

export function openSellModal(ativo, onConfirm) {
    elements.modals.sell.body.innerHTML = `<h3>Vender ${ativo.nome}</h3><div class="product-info"><p><strong>Preço Atual:</strong> ${formatCurrency(ativo.precoUnitario)}</p></div><p class="info-saldo">Você possui: ${ativo.quantidade.toFixed(4)} cotas</p><form id="sell-form"><div class="form-group"><label for="sell-quantity">Quantidade</label><input type="number" id="sell-quantity" class="form-input" max="${ativo.quantidade}" min="0.0001" step="any" required></div><p>Valor da venda: <span class="valor-total" id="valor-total-venda">${formatCurrency(0)}</span></p><button type="submit" class="form-button danger">Confirmar Venda</button></form>`;
    const quantityInput = document.getElementById('sell-quantity'), totalSpan = document.getElementById('valor-total-venda');
    quantityInput.addEventListener('input', () => totalSpan.textContent = formatCurrency((parseFloat(quantityInput.value) || 0) * ativo.precoUnitario));
    document.getElementById('sell-form').addEventListener('submit', (e) => { e.preventDefault(); onConfirm(ativo.produtoId, parseFloat(quantityInput.value), e.submitter); });
    elements.modals.sell.overlay.classList.remove('hidden');
}

export function openConfirmModal(message, onConfirm) {
    elements.modals.confirm.message.textContent = message;
    elements.modals.confirm.overlay.classList.remove('hidden');
    const newConfirmBtn = elements.modals.confirm.confirmBtn.cloneNode(true);
    elements.modals.confirm.confirmBtn.parentNode.replaceChild(newConfirmBtn, elements.modals.confirm.confirmBtn);
    elements.modals.confirm.confirmBtn = newConfirmBtn;
    elements.modals.confirm.confirmBtn.addEventListener('click', () => {
        elements.modals.confirm.overlay.classList.add('hidden');
        onConfirm();
    });
}

export function closeModal(modalName) {
    if (elements.modals[modalName]) {
        elements.modals[modalName].overlay.classList.add('hidden');
    }
}