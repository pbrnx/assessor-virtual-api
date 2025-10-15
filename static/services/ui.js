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
        themeToggleButton: document.getElementById('theme-toggle-btn'), // ADICIONADO
    },
    dashboard: {
        header: document.getElementById('dashboard-header'),
        perfilBadge: document.getElementById('perfil-badge'),
        saldoAtual: document.getElementById('saldo-atual'),
        depositBtn: document.getElementById('deposit-btn'),
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
        confirm: { overlay: document.getElementById('confirm-modal'), closeBtn: document.getElementById('confirm-modal-close-btn'), message: document.getElementById('confirm-modal-message'), confirmBtn: document.getElementById('confirm-modal-confirm-btn'), cancelBtn: document.getElementById('confirm-modal-cancel-btn') }
    },
    loadingOverlay: document.getElementById('loading-overlay'),
    alertContainer: document.getElementById('alert-container'),
};

let carteiraChartInstance = null;
let latestCarteiraData = null; // Armazena os dados mais recentes para re-renderização do gráfico

export const getElements = () => elements;
export const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function showLoader() {
    elements.loadingOverlay.classList.remove('overlay--hidden');
}
export function hideLoader() {
    elements.loadingOverlay.classList.add('overlay--hidden');
}

export function showAlert(message, type = 'success') {
    const toast = elements.alertContainer;
    toast.textContent = message;
    toast.className = `toast toast--${type}`;
    toast.classList.remove('toast--hidden');
    setTimeout(() => toast.classList.add('toast--hidden'), 5000);
}

export function switchView(viewName) {
    Object.values(elements.views).forEach(view => view.classList.add('panel--hidden'));
    if (elements.views[viewName]) {
        elements.views[viewName].classList.remove('panel--hidden');
    }
    const isAuthView = ['login', 'register', 'forgotPassword', 'resetPassword'].includes(viewName);
    elements.userSession.nav.classList.toggle('session--hidden', isAuthView);
}

// FUNÇÃO DE TEMA
export function applyUserTheme(theme) {
    const body = document.body;
    const isLightMode = theme === 'light-mode';
    
    // 1. Aplica/Remove a classe 'light-mode' no <body>
    body.classList.toggle('light-mode', isLightMode);

    // 2. Atualiza o ícone do botão para refletir o novo tema
    const iconSpan = document.getElementById('theme-icon');
    if (iconSpan) {
        iconSpan.textContent = isLightMode ? '🌙' : '☀️';
        iconSpan.ariaLabel = isLightMode ? 'Mudar para o tema escuro' : 'Mudar para o tema claro';
    }
}
// FIM DA FUNÇÃO DE TEMA


export function renderWelcomeMessage(userName) {
    elements.userSession.welcomeMessage.textContent = `Olá, ${userName.split(' ')[0]}!`;
}

export function renderDashboardHeader(user, recomendacaoData) {
    elements.dashboard.perfilBadge.textContent = recomendacaoData.perfilInvestidor;
    elements.dashboard.saldoAtual.textContent = formatCurrency(user.saldo);
}

export function renderRecomendacao(recomendacaoData) {
    const riskClassMap = { 'Baixo': 'low', 'Médio': 'mid', 'Alto': 'high' };
    elements.dashboard.recomendacaoContainer.innerHTML = recomendacaoData.carteiraRecomendada.map(item => `
        <div class="product">
            <div class="product__head">
                <h4 class="product__title">${item.nome}</h4>
                <span class="product__risk risk--${riskClassMap[item.risco]}">${item.risco}</span>
            </div>
            <div class="product__body">
                <div class="product__price">${item.percentualAlocacao}%</div>
                <p class="product__meta">${item.tipo}</p>
            </div>
        </div>`
    ).join('');
}

// ATUALIZADO: Armazena dados e renderiza o gráfico
export function renderCarteira(carteiraData) {
    latestCarteiraData = carteiraData; // Armazena os dados mais recentes
    if (!carteiraData || carteiraData.ativos.length === 0) {
        elements.dashboard.carteiraContainer.innerHTML = `<div class="list__empty">Sua carteira está vazia.</div>`;
        renderCarteiraChart(null); // Limpa o gráfico
        return;
    }
    const ativosHTML = carteiraData.ativos.map(ativo => `
        <div class="item">
            <div class="item__head">
                <span>${ativo.nome}</span>
                <div class="item__actions">
                    <button class="btn btn--sell btn--pill" data-product-id="${ativo.produtoId}">Vender</button>
                </div>
            </div>
            <div class="item__body">
                <span>${ativo.quantidade.toFixed(4)} cotas</span>
                <strong>${formatCurrency(ativo.valorTotal)}</strong>
            </div>
        </div>`
    ).join('');
    const totalHTML = `<div class="item item--total"><div class="item__head"><span>TOTAL</span><strong>${formatCurrency(carteiraData.valorTotalInvestido)}</strong></div></div>`;
    elements.dashboard.carteiraContainer.innerHTML = ativosHTML + totalHTML;
    renderCarteiraChart(carteiraData);
}

// NOVO: Função para forçar a re-renderização do gráfico (usada no toggle de tema)
export function forceChartRedraw() {
    if (latestCarteiraData) {
        renderCarteiraChart(latestCarteiraData);
    }
}

function renderCarteiraChart(carteiraData) {
    if (carteiraChartInstance) carteiraChartInstance.destroy();
    const chartContainer = document.querySelector('.canvas');
    if (!carteiraData || carteiraData.ativos.length === 0) {
        chartContainer.style.display = 'none';
        return;
    }
    chartContainer.style.display = 'block';
    
    // CORREÇÃO AQUI: Obtendo a cor da borda dinamicamente
    const isLightMode = document.body.classList.contains('light-mode');
    const borderColor = isLightMode ? '#ffffff' : '#111317';
    // Se quiser que a borda seja a cor de fundo da superfície do canvas,
    // seria var(--surface) que é #ffffff no light e #111317 no dark.
    
    carteiraChartInstance = new Chart(elements.dashboard.carteiraChartCanvas, {
        type: 'doughnut',
        data: {
            labels: carteiraData.ativos.map(a => a.nome),
            datasets: [{
                data: carteiraData.ativos.map(a => a.valorTotal),
                backgroundColor: ['#4f8cff', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#14b8a6'],
                borderColor: borderColor, 
                borderWidth: 4,
            }]
        },
        options: {
            responsive: true, cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (context) => `${context.label}: ${formatCurrency(context.parsed)}` } }
            }
        }
    });
}

export function renderMarketplace(products, riskFilter = 'todos') {
    const riskClassMap = { 'Baixo': 'low', 'Médio': 'mid', 'Alto': 'high' };
    const filteredProducts = riskFilter === 'todos' ? products : products.filter(p => p.risco.toLowerCase() === riskFilter.toLowerCase());
    elements.dashboard.marketplaceGrid.innerHTML = filteredProducts.map(p => `
        <div class="product" data-product-id="${p.id}" role="button" tabindex="0">
            <div class="product__head">
                <h4 class="product__title">${p.nome}</h4>
                <span class="product__risk risk--${riskClassMap[p.risco]}">${p.risco}</span>
            </div>
            <div class="product__body">
                <div class="product__price">${formatCurrency(p.preco)}</div>
                <p class="product__meta">${p.tipo}</p>
            </div>
        </div>`
    ).join('');
}

export function openBuyModal(product, currentUser, onConfirm) {
    elements.modals.buy.body.innerHTML = `
        <h3 id="buyModalTitle" class="dialog__title">Comprar ${product.nome}</h3>
        <p class="dialog__text">Preço da cota: ${formatCurrency(product.preco)}</p>
        <p class="dialog__text">Seu saldo: <strong>${formatCurrency(currentUser.saldo)}</strong></p>
        <form id="buy-form" class="form">
            <div class="field">
                <label for="buy-value" class="label">Valor a investir (R$)</label>
                <input type="number" id="buy-value" class="input" min="1" step="any" required placeholder="Ex: 500,00">
            </div>
            <p class="dialog__text">Quantidade aprox.: <span id="quantidade-aproximada">0.0000 cotas</span></p>
            <button type="submit" class="btn btn--primary btn--block">Confirmar Compra</button>
        </form>`;
    const valueInput = document.getElementById('buy-value');
    const quantitySpan = document.getElementById('quantidade-aproximada');
    valueInput.addEventListener('input', () => {
        const valor = parseFloat(valueInput.value) || 0;
        const quantidade = product.preco > 0 ? valor / product.preco : 0;
        quantitySpan.textContent = `${quantidade.toFixed(4)} cotas`;
    });
    document.getElementById('buy-form').addEventListener('submit', (e) => {
        e.preventDefault();
        onConfirm(product.id, parseFloat(valueInput.value), e.submitter);
    });
    elements.modals.buy.overlay.classList.remove('overlay--hidden');
}

// --- ATUALIZADO: Função `openSellModal` com a opção "Vender Tudo" ---
export function openSellModal(ativo, onConfirm) {
    elements.modals.sell.body.innerHTML = `
        <h3 id="sellModalTitle" class="dialog__title">Vender ${ativo.nome}</h3>
        <p class="dialog__text">Preço Atual: ${formatCurrency(ativo.precoUnitario)}</p>
        <p class="dialog__text">Você possui: <strong>${ativo.quantidade.toFixed(4)} cotas</strong></p>
        <form id="sell-form" class="form">
            <div class="field">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <label for="sell-quantity" class="label">Quantidade</label>
                    <button type="button" id="sell-all-btn" class="btn btn--quiet btn--pill" style="padding: 4px 10px; font-size: 0.8rem; line-height: 1;">Vender Tudo</button>
                </div>
                <input type="number" id="sell-quantity" class="input" max="${ativo.quantidade}" min="0.0001" step="any" required>
            </div>
            <p class="dialog__text">Valor da venda: <span id="valor-total-venda">${formatCurrency(0)}</span></p>
            <button type="submit" class="btn btn--danger btn--block">Confirmar Venda</button>
        </form>`;
    
    const quantityInput = document.getElementById('sell-quantity');
    const totalSpan = document.getElementById('valor-total-venda');
    const sellAllBtn = document.getElementById('sell-all-btn');

    const updateTotalValue = () => {
        const valorVenda = (parseFloat(quantityInput.value) || 0) * ativo.precoUnitario;
        totalSpan.textContent = formatCurrency(valorVenda);
    };

    quantityInput.addEventListener('input', updateTotalValue);

    sellAllBtn.addEventListener('click', () => {
        quantityInput.value = ativo.quantidade;
        updateTotalValue(); // Atualiza o valor total quando o botão é clicado
    });

    document.getElementById('sell-form').addEventListener('submit', (e) => {
        e.preventDefault();
        onConfirm(ativo.produtoId, parseFloat(quantityInput.value), e.submitter);
    });
    elements.modals.sell.overlay.classList.remove('overlay--hidden');
}


export function openConfirmModal(message, onConfirm) {
    elements.modals.confirm.message.textContent = message;
    elements.modals.confirm.overlay.classList.remove('overlay--hidden');
    const newConfirmBtn = elements.modals.confirm.confirmBtn.cloneNode(true);
    elements.modals.confirm.confirmBtn.parentNode.replaceChild(newConfirmBtn, elements.modals.confirm.confirmBtn);
    elements.modals.confirm.confirmBtn = newConfirmBtn;
    newConfirmBtn.addEventListener('click', () => {
        closeModal('confirm');
        onConfirm();
    });
}

export function closeModal(modalName) {
    if (elements.modals[modalName] && elements.modals[modalName].overlay) {
        elements.modals[modalName].overlay.classList.add('overlay--hidden');
    }
}