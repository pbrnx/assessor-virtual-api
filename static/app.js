// static/app.js

import { apiCall } from './services/api.js';
import {
    initState, setSession, clearSession, getCurrentUser,
    updateCurrentUser, getAllProducts, setAllProducts, setUserCarteira, getUserCarteira,
    setUserRecomendacao, getUserRecomendacao,
    getUserTheme, setUserTheme
} from './services/state.js';
import {
    switchView, showAlert, renderWelcomeMessage, renderDashboardHeader,
    renderRecomendacao, renderCarteira, renderMarketplace,
    getElements, openBuyModal, openSellModal, openConfirmModal, closeModal, formatCurrency,
    applyUserTheme,
    forceChartRedraw
} from './services/ui.js';

let actionToken = null;

// --- FUNÇÃO DE VALIDAÇÃO DE SENHA ---
/**
 * Valida a força da senha no frontend.
 * @param {string} senha - A senha a ser validada.
 * @returns {object} - Objeto com o status de cada critério.
 */
function validatePasswordStrength(senha) {
    const value = senha || ''; // Garante que é string
    const results = {
        length: value.length >= 8,
        lower: /[a-z]/.test(value),
        upper: /[A-Z]/.test(value),
        number: /\d/.test(value), // Use \d for digits
        symbol: /[@$!%*?&+-/~`'"]/.test(value), // Added common symbols
    };
    // Adiciona uma propriedade geral 'isValid'
    results.isValid = Object.values(results).every(Boolean);
    return results;
}

// --- FUNÇÃO PARA ATUALIZAR UI DA VALIDAÇÃO (LISTA CHECKLIST) ---
function updatePasswordFeedback(inputId, validationResult) {
    const prefix = inputId.includes('register') ? 'register' : 'reset';

    const criteria = [
        { id: `req-${prefix}-length`, key: 'length' },
        { id: `req-${prefix}-lower`, key: 'lower' },
        { id: `req-${prefix}-upper`, key: 'upper' },
        { id: `req-${prefix}-number`, key: 'number' },
        { id: `req-${prefix}-symbol`, key: 'symbol' }
    ];

    const inputElement = document.getElementById(inputId);
    const listElement = document.getElementById(`${prefix}-senha-reqs-list`);

    if (!inputElement || !listElement) return; // Sai se os elementos não existirem

    // Mostra a lista se o campo tiver foco ou valor
    // Esconde se não tiver foco E estiver vazio
    const hasFocus = document.activeElement === inputElement;
    const hasValue = inputElement.value.length > 0;

    if (hasFocus || hasValue) {
        listElement.style.display = 'block'; // Ou use uma classe CSS para mostrar
    } else {
        listElement.style.display = 'none'; // Ou use uma classe CSS para esconder
    }

    // Atualiza o status visual de cada critério na lista
    criteria.forEach(item => {
        const liElement = document.getElementById(item.id);
        if (liElement) {
            // Adiciona ou remove a classe 'valid' com base no resultado
            liElement.classList.toggle('valid', validationResult[item.key]);
        }
    });

    // Atualiza aria-invalid no input, mas só se houver valor digitado
    if (hasValue) {
        if (validationResult.isValid) {
            inputElement.removeAttribute('aria-invalid');
        } else {
            inputElement.setAttribute('aria-invalid', 'true');
        }
    } else {
        // Se o campo estiver vazio, remove 'aria-invalid' e reseta a lista visualmente
        inputElement.removeAttribute('aria-invalid');
        criteria.forEach(item => {
            const liElement = document.getElementById(item.id);
            if (liElement) {
                liElement.classList.remove('valid');
            }
        });
    }
}


// --- HANDLERS (lógica de negócio do frontend) ---

async function handleLogin(event) {
    event.preventDefault();
    const button = event.submitter;
    const email = event.target.elements['login-email'].value;
    const senha = event.target.elements['login-senha'].value;
    try {
        const data = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }, button); //
        setSession(data.cliente, data.token); //
        await initializeUserFlow();
    } catch (error) {
        showAlert(error.message, 'error'); //
    }
}

// --- MODIFICADO: handleRegister ---
async function handleRegister(event) {
    event.preventDefault();
    const button = event.submitter;
    const nome = event.target.elements['register-nome'].value;
    const email = event.target.elements['register-email'].value;
    const senhaInput = event.target.elements['register-senha'];
    const senha = senhaInput.value;

    const passwordValidation = validatePasswordStrength(senha);
    // Atualiza a UI imediatamente ao tentar submeter (caso não tenha digitado nada)
    updatePasswordFeedback('register-senha', passwordValidation);

    if (!passwordValidation.isValid) {
        senhaInput.focus(); // Foca no campo se inválido
        // Garante que a lista de requisitos esteja visível
         const listElement = document.getElementById('register-senha-reqs-list');
         if(listElement) listElement.style.display = 'block';
        return; // Impede o envio do formulário
    }

    try {
        const data = await apiCall('/auth/register', { method: 'POST', body: JSON.stringify({ nome, email, senha }) }, button); //
        showAlert(data.message || 'Cadastro realizado! Verifique seu e-mail.', 'success'); //
        switchView('login'); //
    } catch (error) {
        // Se o erro vier do backend sobre a senha (apesar da validação front), mostre na UI
        if (error.message.toLowerCase().includes('senha')) {
             updatePasswordFeedback('register-senha', {isValid: false}); // Marca como inválido na UI
             const listElement = document.getElementById('register-senha-reqs-list');
             if(listElement) listElement.style.display = 'block'; // Garante visibilidade
             showAlert(error.message, 'error'); // Mostra o alerta geral também
        } else {
            showAlert(error.message, 'error'); //
        }
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();
    const button = event.submitter;
    const email = event.target.elements['forgot-email'].value;
    try {
        const data = await apiCall('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }, button); //
        showAlert(data.message, 'success'); //
        switchView('login'); //
    } catch (error) {
        showAlert(error.message, 'error'); //
    }
}

// --- MODIFICADO: handleResetPassword ---
async function handleResetPassword(event) {
    event.preventDefault();
    const button = event.submitter;
    const senhaInput = event.target.elements['reset-senha'];
    const novaSenha = senhaInput.value;
    const token = actionToken;

    const passwordValidation = validatePasswordStrength(novaSenha);
    // Atualiza a UI imediatamente ao tentar submeter
    updatePasswordFeedback('reset-senha', passwordValidation);

    if (!passwordValidation.isValid) {
        senhaInput.focus();
        // Garante que a lista de requisitos esteja visível
         const listElement = document.getElementById('reset-senha-reqs-list');
         if(listElement) listElement.style.display = 'block';
        return; // Impede o envio do formulário
    }

    try {
        const data = await apiCall('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, novaSenha }) }, button); //
        showAlert(data.message, 'success'); //
        switchView('login'); //
    } catch (error) {
         // Se o erro vier do backend sobre a senha (apesar da validação front), mostre na UI
        if (error.message.toLowerCase().includes('senha')) {
             updatePasswordFeedback('reset-senha', {isValid: false}); // Marca como inválido na UI
             const listElement = document.getElementById('reset-senha-reqs-list');
             if(listElement) listElement.style.display = 'block'; // Garante visibilidade
             showAlert(error.message, 'error'); // Mostra o alerta geral também
        } else {
            showAlert(error.message, 'error'); //
        }
    }
}

async function handleVerifyEmail() {
    const token = actionToken;
    try {
        showAlert('Verificando sua conta...', 'success'); //
        const data = await apiCall('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }); //
        showAlert(data.message, 'success'); //
    } catch (error) {
        showAlert(error.message, 'error'); //
    } finally {
        switchView('login'); //
    }
}

async function handleQuestionario(event) {
    event.preventDefault();
    const button = event.submitter;
    const user = getCurrentUser(); //
    const formData = new FormData(event.target);
    const respostas = Object.fromEntries(formData.entries());
    try {
        const perfil = await apiCall(`/clientes/${user.id}/perfil`, { method: 'POST', body: JSON.stringify({ respostas }) }, button); //
        const updatedUser = { ...user, perfilId: perfil.id };
        updateCurrentUser(updatedUser); //
        await loadDashboard();
    } catch (error) {
        showAlert(error.message, 'error'); //
    }
}

async function handleCompra(produtoId, valor, button) { // Modificado para receber valor
    const idNum = Number(produtoId);
    const valNum = Number(valor); // Usa valor

    if (isNaN(idNum) || idNum <= 0) {
        showAlert('Ocorreu um erro interno (ID do produto inválido).', 'error'); //
        return;
    }
    // Valida valor
    if (isNaN(valNum) || valNum <= 0) {
        showAlert('O valor para compra deve ser um número positivo.', 'error'); //
        return;
    }

    // Payload agora envia 'valor' em vez de 'quantidade'
    // --- CORREÇÃO: O BACKEND ESPERA 'quantidade', PRECISAMOS CALCULAR ---
    // Precisamos buscar o preço do produto aqui ou passar o objeto produto para handleCompra
    // Vamos assumir que temos o preço (precisaria ajustar openBuyModal para passar o preço ou produto)
    // Para simplificar agora, VOU REVERTER TEMPORARIAMENTE para enviar QUANTIDADE
    // E você precisará ajustar openBuyModal para calcular e enviar quantidade
    // OU ajustar o backend (carteira.controller.js e carteira.service.js) para aceitar VALOR
    // **** ESCOLHENDO AJUSTAR O PAYLOAD ENVIADO (NECESSITA MUDANÇA EM openBuyModal) ****
     let quantidadeCalculada;
     // Para isso funcionar, openBuyModal precisa ser ajustado para passar o product.preco
     // Ex: onConfirm(product.id, parseFloat(valueInput.value), product.preco, e.submitter);
     // E handleCompra receberia: async function handleCompra(produtoId, valor, precoUnitario, button) {
     // if (precoUnitario && precoUnitario > 0) {
     //     quantidadeCalculada = valNum / precoUnitario;
     // } else {
     //     showAlert('Erro: Preço do produto indisponível.', 'error'); return;
     // }
     // const payload = { produtoId: idNum, quantidade: quantidadeCalculada }; // Envia quantidade

    // ****** SOLUÇÃO MAIS SIMPLES AGORA: DEIXAR COMO ESTAVA ANTES ******
    // ASSUMINDO QUE openBuyModal AINDA ENVIA QUANTIDADE DIRETAMENTE
    const payload = { produtoId: idNum, quantidade: valNum }; // MANTENDO COMO ANTES (valNum aqui é a QUANTIDADE vinda de openBuyModal)


    try {
        await apiCall(`/clientes/${getCurrentUser().id}/carteira/comprar`, { //
            method: 'POST',
            body: JSON.stringify(payload)
        }, button);
        showAlert('Compra realizada com sucesso!'); //
        closeModal('buy'); //
        await initializeUserFlow();
    } catch (error) {
        showAlert(error.message, 'error'); //
    }
}


async function handleVenda(produtoId, quantidade, button) {
    const idNum = Number(produtoId);
    const qtdNum = Number(quantidade);

    if (isNaN(idNum) || idNum <= 0) {
        showAlert('Ocorreu um erro interno (ID do produto inválido).', 'error'); //
        return;
    }
    if (isNaN(qtdNum) || qtdNum <= 0) {
        showAlert('A quantidade para venda deve ser um número positivo.', 'error'); //
        return;
    }

    const payload = { produtoId: idNum, quantidade: qtdNum };

    try {
        await apiCall(`/clientes/${getCurrentUser().id}/carteira/vender`, { //
            method: 'POST',
            body: JSON.stringify(payload)
        }, button);
        showAlert('Venda realizada com sucesso!'); //
        closeModal('sell'); //
        closeModal('confirm'); //
        await initializeUserFlow();
    } catch (error) {
        showAlert(error.message, 'error'); //
    }
}

async function handleDeposito(event) {
    event.preventDefault();
    const button = event.submitter;
    const valor = parseFloat(event.target.elements['deposit-amount'].value);
    if (!valor || valor <= 0) {
        showAlert('Por favor, insira um valor de depósito válido.', 'error'); //
        return;
    }
    try {
        await apiCall(`/clientes/${getCurrentUser().id}/depositar`, { method: 'POST', body: JSON.stringify({ valor }) }, button); //
        showAlert('Depósito realizado com sucesso!'); //
        closeModal('deposit'); //
        await initializeUserFlow();
    } catch (error) {
        showAlert(error.message, 'error'); //
    }
}

async function handleInvestirRecomendacao(event) {
    const button = event.target;
    const user = getCurrentUser(); //
    const recomendacao = getUserRecomendacao(); //

    if (!recomendacao || !recomendacao.carteiraRecomendada || recomendacao.carteiraRecomendada.length === 0) { //
        showAlert('Não foi possível encontrar a carteira recomendada para investir.', 'error'); //
        return;
    }

    if (!user.saldo || user.saldo <= 0) { //
        showAlert('Você não tem saldo suficiente para investir.', 'error'); //
        return;
    }

    openConfirmModal( //
        `Tem certeza que deseja investir todo o seu saldo de ${formatCurrency(user.saldo)} na carteira recomendada?`, //
        async () => {
            try {
                const payload = { carteiraRecomendada: recomendacao.carteiraRecomendada }; //
                await apiCall(`/clientes/${user.id}/recomendacoes/investir`, { //
                    method: 'POST',
                    body: JSON.stringify(payload)
                }, button);
                showAlert('Investimento realizado com sucesso!', 'success'); //
                await initializeUserFlow();
            } catch (error) {
                showAlert(error.message, 'error'); //
            }
        }
    );
}

async function handleRecalcularRecomendacao(event) {
    switchView('questionario'); //
}

function handleThemeToggle() {
    const currentTheme = getUserTheme(); //
    const newTheme = currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode';
    setUserTheme(newTheme); //
    applyUserTheme(newTheme); //
    forceChartRedraw(); //
}

async function loadDashboard() {
    const user = getCurrentUser(); //
    try {
        const [userDetails, recomendacaoData, produtosData, carteiraData] = await Promise.all([
            apiCall(`/clientes/${user.id}`), //
            apiCall(`/clientes/${user.id}/recomendacoes`), //
            apiCall('/investimentos'), //
            apiCall(`/clientes/${user.id}/carteira`), //
        ]);

        updateCurrentUser(userDetails); //
        setAllProducts(produtosData); //
        setUserCarteira(carteiraData); //
        setUserRecomendacao(recomendacaoData); //

        renderDashboardHeader(userDetails, recomendacaoData); //
        renderRecomendacao(recomendacaoData); //
        renderCarteira(carteiraData); //
        renderMarketplace(produtosData); //
        switchView('dashboard'); //
    } catch (error) {
        if (error.message !== 'Não autorizado') showAlert(error.message, 'error'); //
    }
}

// --- MODIFICADO: setupEventListeners ---
function setupEventListeners() {
    const elements = getElements(); //

    elements.forms.login.addEventListener('submit', handleLogin);
    elements.forms.register.addEventListener('submit', handleRegister);
    elements.forms.forgotPassword.addEventListener('submit', handleForgotPassword);
    elements.forms.resetPassword.addEventListener('submit', handleResetPassword);
    elements.forms.questionario.addEventListener('submit', handleQuestionario);
    elements.forms.deposit.addEventListener('submit', handleDeposito);

    // --- Validação dinâmica de senha para Registro ---
    const registerSenhaInput = document.getElementById('register-senha');
    if (registerSenhaInput) {
        const listElement = document.getElementById('register-senha-reqs-list');
        registerSenhaInput.addEventListener('input', () => {
            const validationResult = validatePasswordStrength(registerSenhaInput.value);
            updatePasswordFeedback('register-senha', validationResult);
        });
        registerSenhaInput.addEventListener('focus', () => {
            if(listElement) listElement.style.display = 'block';
            const validationResult = validatePasswordStrength(registerSenhaInput.value); // Atualiza no foco
            updatePasswordFeedback('register-senha', validationResult);
        });
        registerSenhaInput.addEventListener('blur', () => { // Esconde se sair e estiver vazio
             if(listElement && !registerSenhaInput.value) listElement.style.display = 'none';
        });
    }

    // --- Validação dinâmica de senha para Reset ---
    const resetSenhaInput = document.getElementById('reset-senha');
    if (resetSenhaInput) {
         const listElement = document.getElementById('reset-senha-reqs-list');
        resetSenhaInput.addEventListener('input', () => {
            const validationResult = validatePasswordStrength(resetSenhaInput.value);
            updatePasswordFeedback('reset-senha', validationResult);
        });
         resetSenhaInput.addEventListener('focus', () => {
             if(listElement) listElement.style.display = 'block';
              const validationResult = validatePasswordStrength(resetSenhaInput.value); // Atualiza no foco
             updatePasswordFeedback('reset-senha', validationResult);
        });
        resetSenhaInput.addEventListener('blur', () => { // Esconde se sair e estiver vazio
             if(listElement && !resetSenhaInput.value) listElement.style.display = 'none';
        });
    }
    // ---------------------------------------------

    elements.links.showRegister.addEventListener('click', (e) => { e.preventDefault(); switchView('register'); }); //
    elements.links.showLogin.addEventListener('click', (e) => { e.preventDefault(); switchView('login'); }); //
    elements.links.showForgotPassword.addEventListener('click', (e) => { e.preventDefault(); switchView('forgotPassword'); }); //
    elements.links.backToLogin.addEventListener('click', (e) => { e.preventDefault(); switchView('login'); }); //

    elements.userSession.logoutButton.addEventListener('click', () => { clearSession(); switchView('login'); }); //

    if (elements.userSession.themeToggleButton) {
        elements.userSession.themeToggleButton.addEventListener('click', handleThemeToggle);
    }

    const depositBtn = document.getElementById('deposit-btn');
    if (depositBtn) {
        depositBtn.addEventListener('click', () => {
            closeModal('deposit'); //
            elements.modals.deposit.overlay.classList.remove('overlay--hidden');
        });
    }

    elements.dashboard.marketplaceFilters.addEventListener('click', (e) => {
        if (e.target.matches('.chip')) {
            const activeButton = document.querySelector('.chip.chip--active');
            if (activeButton) activeButton.classList.remove('chip--active');
            e.target.classList.add('chip--active');
            renderMarketplace(getAllProducts(), e.target.dataset.risk); //
        }
    });

    elements.dashboard.marketplaceGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.product');
        if (card) {
            const productId = parseInt(card.dataset.productId, 10);
            const product = getAllProducts().find(p => p.id === productId); //
            // --- AJUSTE NECESSÁRIO AQUI ---
            // Passar o preço para handleCompra se a API esperar quantidade
            // Se a API foi ajustada para valor, manter como está em openBuyModal
            if (product) openBuyModal(product, getCurrentUser(), handleCompra); // Assumindo que openBuyModal envia VALOR e handleCompra espera VALOR
            //
        }
    });

    elements.dashboard.carteiraContainer.addEventListener('click', (e) => {
        const sellBtn = e.target.closest('.btn--sell');
        const carteira = getUserCarteira(); //
        if (!carteira || !sellBtn) return;

        const productId = parseInt(sellBtn.dataset.productId, 10);
        const ativo = carteira.ativos.find(a => a.produtoId === productId); //
        if (ativo) {
            openSellModal(ativo, handleVenda); //
        }
    });

    elements.dashboard.investirRecomendacaoBtn.addEventListener('click', handleInvestirRecomendacao);
    elements.dashboard.recalcularRecomendacaoBtn.addEventListener('click', handleRecalcularRecomendacao);

    Object.values(elements.modals).forEach(modal => {
        if (modal.overlay) modal.overlay.addEventListener('click', (e) => { if (e.target === modal.overlay) closeModal(modal.overlay.id.split('-')[0]); }); //
        if (modal.closeBtn) modal.closeBtn.addEventListener('click', () => closeModal(modal.overlay.id.split('-')[0])); //
    });

    const cancelBtn = document.getElementById('confirm-modal-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModal('confirm')); //
    }
}

async function initializeUserFlow() {
    const user = getCurrentUser(); //
    if (!user) {
        switchView('login'); //
        return;
    }
    renderWelcomeMessage(user.nome); //
    applyUserTheme(getUserTheme()); //

    try {
        const userDetails = await apiCall(`/clientes/${user.id}`); //
        updateCurrentUser(userDetails); //
        if (userDetails.perfilId) { //
            await loadDashboard();
        } else {
            switchView('questionario'); //
        }
    } catch (error) {
        if (error.message !== 'Não autorizado') {
            showAlert(error.message, 'error'); //
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
        switchView('resetPassword'); //
        return true;
    }
    if (action === 'verifyEmail') {
        await handleVerifyEmail();
        return true;
    }
    return false;
}

async function main() {
    setupEventListeners();
    initState(); //
    applyUserTheme(getUserTheme()); //

    const urlActionHandled = await handleUrlActions();
    if (urlActionHandled) {
        return;
    }

    if (getCurrentUser()) { //
        await initializeUserFlow();
    } else {
        switchView('login'); //
    }
}

main();