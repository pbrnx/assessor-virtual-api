// static/app.js

document.addEventListener('DOMContentLoaded', () => {
    // --- VARIÁVEIS DE ESTADO E CONSTANTES ---
    const API_BASE_URL = '/api';
    let currentUser = null; // { id, nome, email, perfilId, saldo }
    let allProducts = [];
    let userCarteira = null; // { ativos: [], valorTotalInvestido: 0 }
    let carteiraChartInstance = null; // Para guardar a instância do gráfico

    // --- SELETORES DE ELEMENTOS DO DOM ---
    const views = {
        login: document.getElementById('login-view'),
        register: document.getElementById('register-view'),
        questionario: document.getElementById('questionario-view'),
        dashboard: document.getElementById('dashboard-view'),
    };
    const forms = {
        login: document.getElementById('login-form'),
        register: document.getElementById('register-form'),
        questionario: document.getElementById('questionario-form'),
        deposit: document.getElementById('deposit-form')
    };
    const userSessionNav = document.getElementById('user-session-nav'),
        welcomeMessage = document.getElementById('welcome-message'),
        logoutButton = document.getElementById('logout-button');
    const showRegisterLink = document.getElementById('show-register-link'),
        showLoginLink = document.getElementById('show-login-link');
    const dashboardHeader = document.getElementById('dashboard-header'),
        recomendacaoContainer = document.getElementById('recomendacao-container'),
        marketplaceGrid = document.getElementById('marketplace-grid'),
        marketplaceFilters = document.getElementById('marketplace-filters'),
        carteiraContainer = document.getElementById('carteira-container');
    const buyModal = document.getElementById('buy-modal'),
        buyModalCloseBtn = document.getElementById('buy-modal-close-btn'),
        buyModalBody = document.getElementById('buy-modal-body');
    const depositModal = document.getElementById('deposit-modal'),
        depositModalCloseBtn = document.getElementById('deposit-modal-close-btn');
    const sellModal = document.getElementById('sell-modal'),
        sellModalCloseBtn = document.getElementById('sell-modal-close-btn'),
        sellModalBody = document.getElementById('sell-modal-body');
    const alertContainer = document.getElementById('alert-container');
    const investirRecomendacaoBtn = document.getElementById('investir-recomendacao-btn');
    const carteiraChartCanvas = document.getElementById('carteira-chart').getContext('2d');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Seletores para o modal de confirmação
    const confirmModal = document.getElementById('confirm-modal'),
        confirmModalCloseBtn = document.getElementById('confirm-modal-close-btn'),
        confirmModalMessage = document.getElementById('confirm-modal-message'),
        confirmModalConfirmBtn = document.getElementById('confirm-modal-confirm-btn'),
        confirmModalCancelBtn = document.getElementById('confirm-modal-cancel-btn');

    const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // --- FUNÇÕES DE LÓGICA DA APLICAÇÃO ---
    const switchView = (viewName) => {
        Object.values(views).forEach(view => view.classList.add('hidden'));
        if (views[viewName]) views[viewName].classList.remove('hidden');
        userSessionNav.classList.toggle('hidden', !['questionario', 'dashboard'].includes(viewName));
    };

    const showAlert = (message, type = 'error') => {
        alertContainer.textContent = message;
        alertContainer.className = `alert ${type}`;
        alertContainer.classList.remove('hidden');
        setTimeout(() => alertContainer.classList.add('hidden'), 5000);
    };

    const showLoader = () => loadingOverlay.classList.remove('hidden');
    const hideLoader = () => loadingOverlay.classList.add('hidden');

    // Função para abrir e gerenciar o modal de confirmação
    const openConfirmModal = (message, onConfirm) => {
        confirmModalMessage.textContent = message;
        confirmModal.classList.remove('hidden');

        // Busca a referência ATUAL dos botões que estão na página
        const currentConfirmBtn = document.getElementById('confirm-modal-confirm-btn');
        const newConfirmBtn = currentConfirmBtn.cloneNode(true); // Clona para remover eventos antigos
        currentConfirmBtn.parentNode.replaceChild(newConfirmBtn, currentConfirmBtn); // Substitui no DOM

        const currentCancelBtn = document.getElementById('confirm-modal-cancel-btn');
        const newCancelBtn = currentCancelBtn.cloneNode(true);
        currentCancelBtn.parentNode.replaceChild(newCancelBtn, currentCancelBtn);

        // Adiciona os novos eventos aos botões que acabaram de ser inseridos na página
        newConfirmBtn.addEventListener('click', () => {
            confirmModal.classList.add('hidden');
            onConfirm();
        });

        newCancelBtn.addEventListener('click', () => {
            confirmModal.classList.add('hidden');
        });
    };

    const setUserSession = (user) => {
        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        welcomeMessage.textContent = `Olá, ${user.nome.split(' ')[0]}!`;
        if (currentUser.perfilId) loadDashboard();
        else switchView('questionario');
    };

    const clearUserSession = () => {
        currentUser = allProducts = userCarteira = null;
        sessionStorage.removeItem('currentUser');
        switchView('login');
    };

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    const renderDashboardHeader = (user, recomendacaoData) => {
        dashboardHeader.innerHTML = `<div class="profile-info"><h1>Seu Dashboard <span class="profile-badge">${recomendacaoData.perfilInvestidor}</span></h1></div><div class="account-balance"><span>Saldo em conta</span><div class="saldo">${formatCurrency(user.saldo)}</div><button id="deposit-btn" class="form-button secondary">Depositar</button></div>`;
        document.getElementById('deposit-btn').addEventListener('click', () => depositModal.classList.remove('hidden'));
    };

    const renderRecomendacao = (recomendacaoData) => {
        recomendacaoContainer.innerHTML = recomendacaoData.carteiraRecomendada.map(item => `<div class="recomendacao-card"><div><h4>${item.nome}</h4><p class="info">Tipo: ${item.tipo} | Risco: ${item.risco}</p></div><div class="percentual">${item.percentualAlocacao}%</div></div>`).join('');
    };

    const renderCarteira = () => {
        if (!userCarteira || userCarteira.ativos.length === 0) {
            carteiraContainer.innerHTML = `<div class="carteira-placeholder">Você ainda não possui ativos.</div>`;
        } else {
            const ativosHTML = userCarteira.ativos.map(ativo => `
                <div class="carteira-item">
                    <div class="item-header">
                        <span>${ativo.nome}</span>
                        <div class="item-actions">
                            <button class="sell-all-btn" data-product-id="${ativo.produtoId}" title="Vender todas as cotas">Vender Tudo</button>
                            <button class="sell-btn" data-product-id="${ativo.produtoId}">Vender</button>
                        </div>
                    </div>
                    <div class="item-body">
                        <div>${ativo.quantidade.toFixed(4)} cotas x ${formatCurrency(ativo.precoUnitario)}</div>
                        <div><strong>Total: ${formatCurrency(ativo.valorTotal)}</strong></div>
                    </div>
                </div>`).join('');
            const totalHTML = `<hr><div class="item-header"><span>TOTAL INVESTIDO</span> <span>${formatCurrency(userCarteira.valorTotalInvestido)}</span></div>`;
            carteiraContainer.innerHTML = ativosHTML + totalHTML;
        }
        renderCarteiraChart();
    };

    const renderCarteiraChart = () => {
        if (carteiraChartInstance) {
            carteiraChartInstance.destroy();
        }

        const chartContainer = document.querySelector('.chart-container');
        if (!userCarteira || userCarteira.ativos.length === 0) {
            chartContainer.classList.add('hidden');
            return;
        }
        
        chartContainer.classList.remove('hidden');

        carteiraChartInstance = new Chart(carteiraChartCanvas, {
            type: 'pie',
            data: {
                labels: userCarteira.ativos.map(a => a.nome),
                datasets: [{
                    data: userCarteira.ativos.map(a => a.valorTotal),
                    backgroundColor: ['#4a6cf7', '#13c296', '#fd7e14', '#dc3545', '#6f42c1', '#20c997', '#0dcaf0', '#ffc107'],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${formatCurrency(context.parsed)}`
                        }
                    }
                }
            }
        });
    };

    const renderMarketplace = (riskFilter) => {
        const products = riskFilter === 'todos' ? allProducts : allProducts.filter(p => p.risco.toLowerCase() === riskFilter.toLowerCase());
        marketplaceGrid.innerHTML = products.map(p => `
            <div class="product-card" data-product-id="${p.id}">
                <h4>${p.nome}</h4><div class="price">${formatCurrency(p.preco)}</div>
                <div class="details"><span>${p.tipo}</span><span class="risk-badge ${p.risco.toLowerCase()}">${p.risco}</span></div>
            </div>`).join('');
    };

    const openBuyModal = (productId) => {
        const product = allProducts.find(p => p.id == productId);
        if (!product) return;
        buyModalBody.innerHTML = `<h3>Comprar ${product.nome}</h3><div class="product-info"><p><strong>Preço:</strong> ${formatCurrency(product.preco)}</p></div><p class="info-saldo">Seu saldo: ${formatCurrency(currentUser.saldo)}</p><form id="buy-form"><div class="form-group"><label for="buy-quantity">Quantidade</label><input type="number" id="buy-quantity" class="form-input" min="0.0001" step="any" required></div><p>Custo total: <span class="valor-total" id="valor-total-compra">${formatCurrency(0)}</span></p><button type="submit" class="form-button">Confirmar Compra</button></form>`;
        const quantityInput = document.getElementById('buy-quantity'), totalSpan = document.getElementById('valor-total-compra');
        quantityInput.addEventListener('input', () => totalSpan.textContent = formatCurrency((parseFloat(quantityInput.value) || 0) * product.preco));
        document.getElementById('buy-form').addEventListener('submit', (e) => { e.preventDefault(); handleCompra(product.id, parseFloat(quantityInput.value), e.submitter); });
        buyModal.classList.remove('hidden');
    };
    
    const openSellModal = (productId) => {
        const ativo = userCarteira.ativos.find(a => a.produtoId == productId);
        if (!ativo) return;
        sellModalBody.innerHTML = `<h3>Vender ${ativo.nome}</h3><div class="product-info"><p><strong>Preço Atual:</strong> ${formatCurrency(ativo.precoUnitario)}</p></div><p class="info-saldo">Você possui: ${ativo.quantidade.toFixed(4)} cotas</p><form id="sell-form"><div class="form-group"><label for="sell-quantity">Quantidade</label><input type="number" id="sell-quantity" class="form-input" max="${ativo.quantidade}" min="0.0001" step="any" required></div><p>Valor da venda: <span class="valor-total" id="valor-total-venda">${formatCurrency(0)}</span></p><button type="submit" class="form-button danger">Confirmar Venda</button></form>`;
        const quantityInput = document.getElementById('sell-quantity'), totalSpan = document.getElementById('valor-total-venda');
        quantityInput.addEventListener('input', () => totalSpan.textContent = formatCurrency((parseFloat(quantityInput.value) || 0) * ativo.precoUnitario));
        document.getElementById('sell-form').addEventListener('submit', (e) => { e.preventDefault(); handleVenda(ativo.produtoId, parseFloat(quantityInput.value), e.submitter); });
        sellModal.classList.remove('hidden');
    };

    // --- FUNÇÕES DE API ---
    const apiCall = async (endpoint, options = {}, buttonElement = null) => {
        showLoader();
        if (buttonElement) buttonElement.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Ocorreu um erro na requisição.');
            return data;
        } finally {
            hideLoader();
            if (buttonElement) buttonElement.disabled = false;
        }
    };

    const loadDashboard = async () => {
        try {
            const [recomendacaoData, productsData, carteiraData] = await Promise.all([
                apiCall(`/clientes/${currentUser.id}/recomendacoes`),
                apiCall(`/investimentos`),
                apiCall(`/clientes/${currentUser.id}/carteira`)
            ]);
            allProducts = productsData; userCarteira = carteiraData;
            renderDashboardHeader(currentUser, recomendacaoData);
            renderRecomendacao(recomendacaoData);
            renderMarketplace('todos');
            renderCarteira();
            switchView('dashboard');
        } catch (error) { showAlert(error.message); }
    };

    const handleLogin = async (email, button) => {
        try {
            const clientes = await apiCall('/clientes', {}, button);
            const user = clientes.find(c => c.email.toLowerCase() === email.toLowerCase());
            if (user) setUserSession(await apiCall(`/clientes/${user.id}`, {}, button));
            else showAlert('E-mail não encontrado. Por favor, cadastre-se.');
        } catch (error) { showAlert(error.message); }
    };
    
    const handleRegister = async (nome, email, button) => {
        try { 
            setUserSession(await apiCall('/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome, email }) }, button));
        } catch (error) { showAlert(error.message); }
    };

    const handleQuestionario = async (respostas, button) => {
        try {
            const perfil = await apiCall(`/clientes/${currentUser.id}/perfil`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ respostas }) }, button);
            currentUser.perfilId = perfil.id;
            loadDashboard();
        } catch (error) { showAlert(error.message); }
    };

    const handleDeposito = async (valor, button) => {
        try {
            currentUser = await apiCall(`/clientes/${currentUser.id}/depositar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor }) }, button);
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            showAlert('Depósito realizado com sucesso!', 'success');
            depositModal.classList.add('hidden');
            loadDashboard();
        } catch (error) { showAlert(error.message); }
    };

    const handleCompra = async (produtoId, quantidade, button) => {
        try {
            await apiCall(`/clientes/${currentUser.id}/carteira/comprar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ produtoId, quantidade }) }, button);
            currentUser = await apiCall(`/clientes/${currentUser.id}`);
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            showAlert('Compra realizada com sucesso!', 'success');
            buyModal.classList.add('hidden');
            loadDashboard();
        } catch (error) { showAlert(error.message); }
    };
    
    const handleVenda = async (produtoId, quantidade, button) => {
        try {
            await apiCall(`/clientes/${currentUser.id}/carteira/vender`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ produtoId, quantidade }) }, button);
            currentUser = await apiCall(`/clientes/${currentUser.id}`);
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            showAlert('Venda realizada com sucesso!', 'success');
            sellModal.classList.add('hidden');
            loadDashboard();
        } catch (error) { showAlert(error.message); }
    };
    
    const handleInvestirRecomendacao = async (button) => {
        if (currentUser.saldo <= 0) {
            showAlert('Você não tem saldo para investir. Faça um depósito primeiro.');
            return;
        }
        try {
            await apiCall(`/clientes/${currentUser.id}/recomendacoes/investir`, { method: 'POST' }, button);
            currentUser = await apiCall(`/clientes/${currentUser.id}`);
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            showAlert('Investimento na carteira recomendada realizado com sucesso!', 'success');
            loadDashboard();
        } catch (error) { showAlert(error.message); }
    };

    // --- EVENT LISTENERS ---
    forms.login.addEventListener('submit', (e) => { e.preventDefault(); handleLogin(e.target.elements['login-email'].value, e.submitter); });
    forms.register.addEventListener('submit', (e) => { e.preventDefault(); handleRegister(e.target.elements['register-nome'].value, e.target.elements['register-email'].value, e.submitter); });
    forms.questionario.addEventListener('submit', (e) => { e.preventDefault(); handleQuestionario(Object.fromEntries(new FormData(e.target).entries()), e.submitter); });
    forms.deposit.addEventListener('submit', (e) => { e.preventDefault(); handleDeposito(parseFloat(e.target.elements['deposit-amount'].value), e.submitter); });
    logoutButton.addEventListener('click', clearUserSession);
    showRegisterLink.addEventListener('click', () => switchView('register'));
    showLoginLink.addEventListener('click', () => switchView('login'));
    marketplaceFilters.addEventListener('click', (e) => { if (e.target.matches('.filter-btn')) { document.querySelector('.filter-btn.active').classList.remove('active'); e.target.classList.add('active'); renderMarketplace(e.target.dataset.risk); } });
    marketplaceGrid.addEventListener('click', (e) => { const card = e.target.closest('.product-card'); if (card) openBuyModal(card.dataset.productId); });
    
    carteiraContainer.addEventListener('click', (e) => { 
        const sellBtn = e.target.closest('.sell-btn');
        const sellAllBtn = e.target.closest('.sell-all-btn');

        if (sellBtn) {
            openSellModal(sellBtn.dataset.productId);
        } else if (sellAllBtn) {
            const productId = sellAllBtn.dataset.productId;
            const ativo = userCarteira.ativos.find(a => a.produtoId == productId);
            if (ativo) {
                // Chama o modal de confirmação
                openConfirmModal(
                    `Tem certeza que deseja vender todas as ${ativo.quantidade.toFixed(4)} cotas de ${ativo.nome}?`,
                    () => {
                        // Esta função será executada apenas se o usuário clicar em "Confirmar"
                        handleVenda(ativo.produtoId, ativo.quantidade, sellAllBtn);
                    }
                );
            }
        }
    });

    [buyModal, depositModal, sellModal, confirmModal].forEach(modal => { 
        modal.addEventListener('click', (e) => { 
            if (e.target === modal) modal.classList.add('hidden'); 
        }); 
    });
    [buyModalCloseBtn, depositModalCloseBtn, sellModalCloseBtn, confirmModalCloseBtn].forEach(btn => {
        btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.add('hidden'));
    });
    investirRecomendacaoBtn.addEventListener('click', (e) => handleInvestirRecomendacao(e.currentTarget));

    // --- INICIALIZAÇÃO ---
    const init = () => { if (sessionStorage.getItem('currentUser')) setUserSession(JSON.parse(sessionStorage.getItem('currentUser'))); else switchView('login'); };
    init();
});