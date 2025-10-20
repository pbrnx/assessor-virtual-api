// static/app.js

// Importa ambas as funções de chamada API e funções de estado/UI
import { apiCall, apiCallWithRefresh } from './services/api.js'; //
import {
    initState, setSession, clearSession, getCurrentUser,
    updateCurrentUser, getAllProducts, setAllProducts, setUserCarteira, getUserCarteira,
    setUserRecomendacao, getUserRecomendacao,
    getUserTheme, setUserTheme
} from './services/state.js'; //
import {
    switchView, showAlert, renderWelcomeMessage, renderDashboardHeader,
    renderRecomendacao, renderCarteira, renderMarketplace,
    getElements, openBuyModal, openSellModal, openConfirmModal, closeModal, formatCurrency,
    applyUserTheme,
    forceChartRedraw
} from './services/ui.js'; //

// Variável global para armazenar token de ação (reset/verify) da URL
let actionToken = null;

// --- FUNÇÃO DE VALIDAÇÃO DE SENHA ---
/**
 * Valida a força da senha no frontend.
 * @param {string} senha - A senha a ser validada.
 * @returns {object} - Objeto com o status de cada critério e um booleano `isValid`.
 */
function validatePasswordStrength(senha) {
    const value = senha || ''; // Garante que é string
    const results = {
        length: value.length >= 8,
        lower: /[a-z]/.test(value),
        upper: /[A-Z]/.test(value),
        number: /\d/.test(value), // Usa \d para dígitos
        symbol: /[@$!%*?&+-/~`'"]/.test(value), // Símbolos comuns adicionados
    };
    // Adiciona uma propriedade geral 'isValid'
    results.isValid = Object.values(results).every(Boolean);
    return results;
}

// --- FUNÇÃO PARA ATUALIZAR UI DA VALIDAÇÃO (LISTA CHECKLIST) ---
/**
 * Atualiza a interface da lista de requisitos de senha.
 * @param {string} inputId - ID do input de senha ('register-senha' ou 'reset-senha').
 * @param {object} validationResult - Resultado da função validatePasswordStrength.
 */
function updatePasswordFeedback(inputId, validationResult) {
    const prefix = inputId.includes('register') ? 'register' : 'reset'; // Determina o prefixo dos IDs

    const criteria = [ // Mapeamento dos critérios para os IDs dos elementos da lista
        { id: `req-${prefix}-length`, key: 'length' },
        { id: `req-${prefix}-lower`, key: 'lower' },
        { id: `req-${prefix}-upper`, key: 'upper' },
        { id: `req-${prefix}-number`, key: 'number' },
        { id: `req-${prefix}-symbol`, key: 'symbol' }
    ];

    const inputElement = document.getElementById(inputId);
    const listElement = document.getElementById(`${prefix}-senha-reqs-list`);

    // Sai se os elementos não existirem no DOM
    if (!inputElement || !listElement) return;

    // Controla a visibilidade da lista de requisitos
    const hasFocus = document.activeElement === inputElement;
    const hasValue = inputElement.value.length > 0;
    listElement.style.display = (hasFocus || hasValue) ? 'block' : 'none';

    // Atualiza o estado visual (classe 'valid') de cada item da lista
    criteria.forEach(item => {
        const liElement = document.getElementById(item.id);
        if (liElement) {
            liElement.classList.toggle('valid', validationResult[item.key]);
        }
    });

    // Atualiza o atributo 'aria-invalid' no input se houver valor digitado
    if (hasValue) {
        inputElement.setAttribute('aria-invalid', !validationResult.isValid);
    } else {
        // Se vazio, remove 'aria-invalid' e reseta a lista visualmente
        inputElement.removeAttribute('aria-invalid');
        criteria.forEach(item => {
            const liElement = document.getElementById(item.id);
            if (liElement) liElement.classList.remove('valid');
        });
    }
}


// --- HANDLERS (lógica de negócio do frontend) ---

/**
 * Lida com o envio do formulário de login.
 * @param {Event} event - O evento de submit do formulário.
 */
async function handleLogin(event) {
    event.preventDefault(); // Impede o recarregamento da página
    const button = event.submitter; // Botão que disparou o evento
    const email = event.target.elements['login-email'].value;
    const senha = event.target.elements['login-senha'].value;
    try {
        // Usa apiCall normal (sem refresh) para o endpoint de login
        const data = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }, button); //
        // Armazena ambos os tokens (access e refresh) e os dados do cliente
        setSession(data.cliente, data.accessToken, data.refreshToken); //
        await initializeUserFlow(); // Inicia o fluxo do usuário logado
    } catch (error) {
        showAlert(error.message || 'Erro desconhecido no login.', 'error'); //
    }
}

/**
 * Lida com o envio do formulário de registro.
 * @param {Event} event - O evento de submit do formulário.
 */
async function handleRegister(event) {
    event.preventDefault();
    const button = event.submitter;
    const nome = event.target.elements['register-nome'].value;
    const email = event.target.elements['register-email'].value;
    const senhaInput = event.target.elements['register-senha'];
    const senha = senhaInput.value;

    // Valida a força da senha antes de enviar
    const passwordValidation = validatePasswordStrength(senha);
    updatePasswordFeedback('register-senha', passwordValidation); // Atualiza UI

    if (!passwordValidation.isValid) {
        senhaInput.focus(); // Foca no campo se inválido
        const listElement = document.getElementById('register-senha-reqs-list');
        if (listElement) listElement.style.display = 'block'; // Garante visibilidade
        return; // Impede o envio
    }

    try {
        // Usa apiCall normal para registro
        const data = await apiCall('/auth/register', { method: 'POST', body: JSON.stringify({ nome, email, senha }) }, button); //
        showAlert(data.message || 'Cadastro realizado! Verifique seu e-mail.', 'success'); //
        switchView('login'); // Redireciona para login após sucesso
    } catch (error) {
        // Trata erro específico de senha vindo do backend
        if (error.message && error.message.toLowerCase().includes('senha')) {
             updatePasswordFeedback('register-senha', {isValid: false, length: false, lower: false, upper: false, number: false, symbol: false}); // Marca como inválido na UI
             const listElement = document.getElementById('register-senha-reqs-list');
             if(listElement) listElement.style.display = 'block';
        }
        showAlert(error.message || 'Erro ao registrar.', 'error'); //
    }
}

/**
 * Lida com o envio do formulário "Esqueci minha senha".
 * @param {Event} event - O evento de submit do formulário.
 */
async function handleForgotPassword(event) {
    event.preventDefault();
    const button = event.submitter;
    const email = event.target.elements['forgot-email'].value;
    try {
        // Usa apiCall normal
        const data = await apiCall('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }, button); //
        showAlert(data.message, 'success'); //
        switchView('login'); // Volta para login
    } catch (error) {
        showAlert(error.message || 'Erro ao solicitar redefinição.', 'error'); //
    }
}

/**
 * Lida com o envio do formulário de redefinição de senha.
 * @param {Event} event - O evento de submit do formulário.
 */
async function handleResetPassword(event) {
    event.preventDefault();
    const button = event.submitter;
    const senhaInput = event.target.elements['reset-senha'];
    const novaSenha = senhaInput.value;
    const token = actionToken; // Pega o token armazenado da URL

    if (!token) {
        showAlert('Token de redefinição inválido ou ausente.', 'error'); //
        switchView('login'); //
        return;
    }

    // Valida a força da nova senha
    const passwordValidation = validatePasswordStrength(novaSenha);
    updatePasswordFeedback('reset-senha', passwordValidation);

    if (!passwordValidation.isValid) {
        senhaInput.focus();
        const listElement = document.getElementById('reset-senha-reqs-list');
        if (listElement) listElement.style.display = 'block';
        return; // Impede o envio
    }

    try {
        // Usa apiCall normal
        const data = await apiCall('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, novaSenha }) }, button); //
        showAlert(data.message, 'success'); //
        actionToken = null; // Limpa o token após o uso
        switchView('login'); //
    } catch (error) {
        // Trata erro específico de senha vindo do backend
        if (error.message && error.message.toLowerCase().includes('senha')) {
             updatePasswordFeedback('reset-senha', {isValid: false, length: false, lower: false, upper: false, number: false, symbol: false}); // Marca como inválido
             const listElement = document.getElementById('reset-senha-reqs-list');
             if(listElement) listElement.style.display = 'block';
        }
        showAlert(error.message || 'Erro ao redefinir senha.', 'error'); //
    }
}

/**
 * Lida com a ação de verificação de e-mail usando o token da URL.
 */
async function handleVerifyEmail() {
    const token = actionToken; // Pega o token armazenado da URL
    if (!token) return; // Se não houver token (deveria ter sido tratado por handleUrlActions)

    try {
        showAlert('Verificando sua conta...', 'info'); //
        // Usa apiCall normal
        const data = await apiCall('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }); //
        showAlert(data.message, 'success'); //
    } catch (error) {
        showAlert(error.message || 'Erro ao verificar e-mail.', 'error'); //
    } finally {
        actionToken = null; // Limpa o token após a tentativa
        switchView('login'); // Sempre redireciona para login depois
    }
}

/**
 * Lida com o envio do formulário do questionário de perfil.
 */
async function handleQuestionario(event) {
    event.preventDefault();
    const button = event.submitter;
    const user = getCurrentUser(); //
    if (!user) {
        showAlert('Erro: Usuário não autenticado.', 'error'); //
        return;
    }
    const formData = new FormData(event.target);
    const respostas = Object.fromEntries(formData.entries());
    try {
        // --- USA apiCallWithRefresh ---
        const perfil = await apiCallWithRefresh(`/clientes/${user.id}/perfil`, { method: 'POST', body: JSON.stringify({ respostas }) }, button); //
        // --- FIM DA MUDANÇA ---

        // Atualiza o usuário localmente com o perfilId retornado pela API
        if (perfil && perfil.id) {
             const updatedUser = { ...user, perfilId: perfil.id };
             updateCurrentUser(updatedUser); //
        } else {
             console.warn("API de perfil não retornou ID, usuário local pode não estar atualizado.");
        }
        await loadDashboard(); // Recarrega o dashboard com os dados atualizados
    } catch (error) {
         // O erro de sessão expirada já será tratado dentro de apiCallWithRefresh
        if (!error.message || !error.message.includes('Sessão expirada')) {
            showAlert(error.message || 'Erro ao definir perfil.', 'error'); //
        }
    }
}

/**
 * Lida com a confirmação de compra de um ativo (chamado pelo modal).
/**
 * Lida com a confirmação de compra de um ativo (chamado pelo modal).
 * @param {number} produtoId - ID do produto a comprar.
 * @param {number} valor - Valor monetário a investir.
 * @param {HTMLElement} button - Botão de confirmação do modal.
 */
async function handleCompra(produtoId, valor, button) {
    // Converte os inputs para números
    const idNum = Number(produtoId);
    const valNum = Number(valor);

    // Validações básicas dos inputs
    if (isNaN(idNum) || idNum <= 0) {
        showAlert('Ocorreu um erro interno (ID do produto inválido).', 'error'); // Exibe alerta de erro
        return; // Interrompe a função se o ID for inválido
    }
    if (isNaN(valNum) || valNum <= 0) {
        showAlert('O valor para compra deve ser um número positivo.', 'error'); // Exibe alerta de erro
        return; // Interrompe a função se o valor for inválido
    }

    // Obtém o usuário atual do estado
    const user = getCurrentUser();
    // Verifica se o usuário está autenticado
    if (!user) {
        showAlert('Erro: Usuário não autenticado.', 'error'); // Exibe alerta de erro
        return; // Interrompe a função se não houver usuário
    }

    // Cria o payload para a requisição da API, enviando o 'valor'
    const payload = { produtoId: idNum, valor: valNum }; // <<< CORREÇÃO: Envia 'valor'

    try {
        // Chama a API para realizar a compra usando apiCallWithRefresh
        // Passa o ID do cliente, endpoint, método POST, corpo da requisição e o botão
        await apiCallWithRefresh(`/clientes/${user.id}/carteira/comprar`, {
            method: 'POST',
            body: JSON.stringify(payload) // Converte o payload para JSON
        }, button); // Passa o botão para desabilitar durante a chamada

        // Se a chamada for bem-sucedida
        showAlert('Compra realizada com sucesso!', 'success'); // Exibe mensagem de sucesso
        closeModal('buy'); // Fecha o modal de compra
        await initializeUserFlow(); // Recarrega os dados do dashboard para refletir a compra

    } catch (error) {
        // Se ocorrer um erro durante a chamada da API
        // Verifica se o erro NÃO é de sessão expirada (já tratado pelo apiCallWithRefresh)
        if (!error.message || !error.message.includes('Sessão expirada')) {
            // Exibe a mensagem de erro da API ou uma mensagem genérica
            showAlert(error.message || 'Erro ao realizar compra.', 'error');
        }
        // Nota: O erro de sessão expirada já causa redirecionamento para login dentro de apiCallWithRefresh
    }
}
/**
 * Lida com a confirmação de venda de um ativo (chamado pelo modal).
 * @param {number} produtoId - ID do produto a vender.
 * @param {number} quantidade - Quantidade de cotas a vender.
 * @param {HTMLElement} button - Botão de confirmação do modal.
 */
async function handleVenda(produtoId, quantidade, button) {
    const idNum = Number(produtoId);
    const qtdNum = Number(quantidade);

    // Validações básicas
    if (isNaN(idNum) || idNum <= 0) {
        showAlert('Ocorreu um erro interno (ID do produto inválido).', 'error'); //
        return;
    }
    if (isNaN(qtdNum) || qtdNum <= 0) {
        showAlert('A quantidade para venda deve ser um número positivo.', 'error'); //
        return;
    }
    const user = getCurrentUser(); //
     if (!user) {
        showAlert('Erro: Usuário não autenticado.', 'error'); //
        return;
    }

    const payload = { produtoId: idNum, quantidade: qtdNum };

    try {
        // --- USA apiCallWithRefresh ---
        await apiCallWithRefresh(`/clientes/${user.id}/carteira/vender`, { //
            method: 'POST',
            body: JSON.stringify(payload)
        }, button);
        // --- FIM DA MUDANÇA ---
        showAlert('Venda realizada com sucesso!', 'success'); //
        closeModal('sell'); // Fecha modal de venda
        // closeModal('confirm'); // Fecha modal de confirmação (se houver um antes)
        await initializeUserFlow(); // Recarrega dados
    } catch (error) {
         if (!error.message || !error.message.includes('Sessão expirada')) {
            showAlert(error.message || 'Erro ao realizar venda.', 'error'); //
        }
    }
}

/**
 * Lida com o envio do formulário de depósito.
 * @param {Event} event - O evento de submit do formulário.
 */
async function handleDeposito(event) {
    event.preventDefault();
    const button = event.submitter;
    const valor = parseFloat(event.target.elements['deposit-amount'].value);
    if (!valor || valor <= 0) {
        showAlert('Por favor, insira um valor de depósito válido e positivo.', 'error'); //
        return;
    }
     const user = getCurrentUser(); //
     if (!user) {
        showAlert('Erro: Usuário não autenticado.', 'error'); //
        return;
    }

    try {
        // --- USA apiCallWithRefresh ---
        await apiCallWithRefresh(`/clientes/${user.id}/depositar`, { method: 'POST', body: JSON.stringify({ valor }) }, button); //
        // --- FIM DA MUDANÇA ---
        showAlert('Depósito realizado com sucesso!', 'success'); //
        closeModal('deposit'); //
        await initializeUserFlow(); // Recarrega dados
    } catch (error) {
        if (!error.message || !error.message.includes('Sessão expirada')) {
            showAlert(error.message || 'Erro ao realizar depósito.', 'error'); //
        }
    }
}

/**
 * Lida com o clique no botão "Investir com 1 clique" (investir na recomendação).
 * @param {Event} event - O evento de clique no botão.
 */
async function handleInvestirRecomendacao(event) {
    const button = event.target.closest('button'); // Pega o botão clicado
    const user = getCurrentUser(); //
    const recomendacao = getUserRecomendacao(); //

    if (!user) {
         showAlert('Erro: Usuário não autenticado.', 'error'); //
         return;
    }
    if (!recomendacao || !recomendacao.carteiraRecomendada || recomendacao.carteiraRecomendada.length === 0) {
        showAlert('Não foi possível encontrar a carteira recomendada para investir.', 'error'); //
        return;
    }
    if (!user.saldo || user.saldo <= 0) {
        showAlert('Você não tem saldo suficiente para investir.', 'error'); //
        return;
    }

    // Abre modal de confirmação
    openConfirmModal( //
        `Tem certeza que deseja investir todo o seu saldo de ${formatCurrency(user.saldo)} na carteira recomendada?`, //
        async () => { // Função a ser executada se o usuário confirmar
            try {
                // Prepara o payload com a carteira recomendada
                const payload = { carteiraRecomendada: recomendacao.carteiraRecomendada }; //
                // --- USA apiCallWithRefresh ---
                await apiCallWithRefresh(`/clientes/${user.id}/recomendacoes/investir`, { //
                    method: 'POST',
                    body: JSON.stringify(payload)
                }, button); // Passa o botão original para desabilitar/habilitar
                // --- FIM DA MUDANÇA ---
                showAlert('Investimento realizado com sucesso!', 'success'); //
                await initializeUserFlow(); // Recarrega dados
            } catch (error) {
                if (!error.message || !error.message.includes('Sessão expirada')) {
                    showAlert(error.message || 'Erro ao investir na recomendação.', 'error'); //
                }
            }
        }
    );
}

/**
 * Lida com o clique no botão "Recalcular Perfil".
 */
async function handleRecalcularRecomendacao(event) {
    switchView('questionario'); // Simplesmente muda para a tela do questionário
}

/**
 * Lida com o clique no botão de alternar tema (Light/Dark).
 */
function handleThemeToggle() {
    const currentTheme = getUserTheme(); //
    const newTheme = currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode';
    setUserTheme(newTheme); // Salva a nova preferência
    applyUserTheme(newTheme); // Aplica o novo tema visualmente
    forceChartRedraw(); // Força o gráfico a redesenhar com as cores do novo tema
}

/**
 * Carrega todos os dados necessários para exibir o dashboard.
 */
async function loadDashboard() {
    const user = getCurrentUser(); //
    if (!user) { // Verificação extra
        console.error("Tentativa de carregar dashboard sem usuário.");
        switchView('login'); //
        return;
    }
    try {
        // --- USA apiCallWithRefresh PARA DADOS PROTEGIDOS e apiCall PARA PÚBLICOS ---
        const [userDetails, recomendacaoData, produtosData, carteiraData] = await Promise.all([
            apiCallWithRefresh(`/clientes/${user.id}`),               // Detalhes do usuário (protegido)
            apiCallWithRefresh(`/clientes/${user.id}/recomendacoes`), // Recomendações (protegido)
            apiCall('/investimentos'),                           // Lista de produtos (público)
            apiCallWithRefresh(`/clientes/${user.id}/carteira`),      // Carteira do usuário (protegido)
        ]);
        // --- FIM DA MUDANÇA ---

        // Atualiza o estado global com os dados recebidos
        updateCurrentUser(userDetails); //
        setAllProducts(produtosData); //
        setUserCarteira(carteiraData); //
        setUserRecomendacao(recomendacaoData); //

        // Renderiza os componentes do dashboard com os dados atualizados
        renderDashboardHeader(userDetails, recomendacaoData); //
        renderRecomendacao(recomendacaoData); //
        renderCarteira(carteiraData); //
        renderMarketplace(produtosData); //
        switchView('dashboard'); // Exibe a view do dashboard
    } catch (error) {
        // Evita mostrar alerta duplicado se o erro já foi tratado pelo apiCallWithRefresh
        if (!error.message || !error.message.includes('Sessão expirada')) {
            showAlert(error.message || 'Erro ao carregar dados do dashboard.', 'error'); //
             // Considerar redirecionar para login se o erro for grave ou persistente
             // clearSession(); switchView('login');
        }
    }
}

/**
 * Configura todos os event listeners da aplicação.
 */
function setupEventListeners() {
    const elements = getElements(); //

    // Formulários
    elements.forms.login.addEventListener('submit', handleLogin);
    elements.forms.register.addEventListener('submit', handleRegister);
    elements.forms.forgotPassword.addEventListener('submit', handleForgotPassword);
    elements.forms.resetPassword.addEventListener('submit', handleResetPassword);
    elements.forms.questionario.addEventListener('submit', handleQuestionario);
    elements.forms.deposit.addEventListener('submit', handleDeposito);

    // Validação dinâmica de senha (Registro e Reset)
    ['register', 'reset'].forEach(prefix => {
        const senhaInput = document.getElementById(`${prefix}-senha`);
        if (senhaInput) {
            const listElement = document.getElementById(`${prefix}-senha-reqs-list`);
            senhaInput.addEventListener('input', () => updatePasswordFeedback(`${prefix}-senha`, validatePasswordStrength(senhaInput.value)));
            senhaInput.addEventListener('focus', () => {
                if (listElement) listElement.style.display = 'block';
                updatePasswordFeedback(`${prefix}-senha`, validatePasswordStrength(senhaInput.value));
            });
            senhaInput.addEventListener('blur', () => {
                if (listElement && !senhaInput.value) listElement.style.display = 'none';
            });
        }
    });

    // Links de Navegação entre views de autenticação
    elements.links.showRegister.addEventListener('click', (e) => { e.preventDefault(); switchView('register'); }); //
    elements.links.showLogin.addEventListener('click', (e) => { e.preventDefault(); switchView('login'); }); //
    elements.links.showForgotPassword.addEventListener('click', (e) => { e.preventDefault(); switchView('forgotPassword'); }); //
    elements.links.backToLogin.addEventListener('click', (e) => { e.preventDefault(); switchView('login'); }); //

    // Botão de Logout
    elements.userSession.logoutButton.addEventListener('click', () => { clearSession(); switchView('login'); }); //

    // Botão de Tema
    if (elements.userSession.themeToggleButton) {
        elements.userSession.themeToggleButton.addEventListener('click', handleThemeToggle);
    }

    // Botão Abrir Modal Depósito
    const depositBtn = document.getElementById('deposit-btn');
    if (depositBtn) {
        depositBtn.addEventListener('click', () => {
             // Limpa campo valor ao abrir modal (opcional)
             const amountInput = document.getElementById('deposit-amount');
             if(amountInput) amountInput.value = '';
            elements.modals.deposit.overlay.classList.remove('overlay--hidden'); // Mostra o modal
        });
    }

    // Filtros do Marketplace
    elements.dashboard.marketplaceFilters.addEventListener('click', (e) => {
        if (e.target.matches('.chip')) {
            const activeButton = elements.dashboard.marketplaceFilters.querySelector('.chip.chip--active');
            if (activeButton) activeButton.classList.remove('chip--active');
            e.target.classList.add('chip--active');
            renderMarketplace(getAllProducts(), e.target.dataset.risk); // Re-renderiza o marketplace com o filtro
        }
    });

    // Cliques nos Cards do Marketplace (para abrir modal de compra)
    elements.dashboard.marketplaceGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.product');
        if (card) {
            const productId = parseInt(card.dataset.productId, 10);
            const user = getCurrentUser(); //
            const product = getAllProducts().find(p => p.id === productId); //
            if (product && user) {
                // Passa o produto completo, usuário e a função handleCompra como callback
                openBuyModal(product, user, handleCompra); //
            } else {
                console.error("Produto ou usuário não encontrado para abrir modal de compra.");
            }
        }
    });

    // Cliques nos Botões "Vender" da Carteira
    elements.dashboard.carteiraContainer.addEventListener('click', (e) => {
        const sellBtn = e.target.closest('.btn--sell');
        if (!sellBtn) return; // Sai se não clicou no botão vender

        const carteira = getUserCarteira(); //
        if (!carteira) return; // Sai se a carteira não estiver carregada

        const productId = parseInt(sellBtn.dataset.productId, 10);
        const ativo = carteira.ativos.find(a => a.produtoId === productId); // Encontra o ativo na carteira
        if (ativo) {
            // Passa o ativo encontrado e a função handleVenda como callback
            openSellModal(ativo, handleVenda); //
        } else {
            console.error("Ativo não encontrado na carteira para venda.");
        }
    });

    // Botões de Ação do Dashboard
    elements.dashboard.investirRecomendacaoBtn.addEventListener('click', handleInvestirRecomendacao);
    elements.dashboard.recalcularRecomendacaoBtn.addEventListener('click', handleRecalcularRecomendacao);

    // Fechar Modais (clicando fora ou no botão X)
    Object.values(elements.modals).forEach(modal => {
        // Fecha clicando no overlay (fundo)
        if (modal.overlay) {
            modal.overlay.addEventListener('click', (e) => {
                if (e.target === modal.overlay) { // Garante que clicou no overlay, não no conteúdo
                    closeModal(modal.overlay.id.split('-')[0]); // Extrai o nome do modal do ID (ex: 'buy-modal' -> 'buy')
                }
            });
        }
        // Fecha clicando no botão 'X'
        if (modal.closeBtn) {
            modal.closeBtn.addEventListener('click', () => closeModal(modal.overlay.id.split('-')[0])); //
        }
    });

    // Botão Cancelar do Modal de Confirmação
    const cancelBtn = document.getElementById('confirm-modal-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModal('confirm')); //
    }
}

/**
 * Inicializa o fluxo do usuário após login ou recarregamento da página com sessão ativa.
 * Busca dados do usuário e decide se mostra o questionário ou o dashboard.
 */
async function initializeUserFlow() {
    const user = getCurrentUser(); //
    if (!user || !user.id) { // Verifica se user e user.id existem
        console.log("initializeUserFlow: Nenhum usuário encontrado, redirecionando para login.");
        clearSession(); // Garante que tudo está limpo
        switchView('login'); //
        return;
    }

    renderWelcomeMessage(user.nome); // Mostra "Olá, [Nome]"
    applyUserTheme(getUserTheme()); // Aplica o tema salvo

    try {
        // --- USA apiCallWithRefresh ---
        // Busca os detalhes MAIS ATUAIS do usuário (incluindo perfilId)
        const userDetails = await apiCallWithRefresh(`/clientes/${user.id}`); //
        // --- FIM DA MUDANÇA ---

        updateCurrentUser(userDetails); // Atualiza o estado com os dados mais recentes

        // Verifica se o perfil do investidor já foi definido
        if (userDetails.perfilId) {
            await loadDashboard(); // Carrega e mostra o dashboard
        } else {
            switchView('questionario'); // Mostra o questionário se o perfil não estiver definido
        }
    } catch (error) {
        // O erro de sessão expirada já será tratado dentro de apiCallWithRefresh
        if (!error.message || !error.message.includes('Sessão expirada')) {
            showAlert(error.message || 'Erro ao buscar dados iniciais do usuário.', 'error'); //
            // Em caso de erro grave, pode ser útil deslogar
            // clearSession(); switchView('login');
        }
    }
}

/**
 * Verifica se há ações pendentes na URL (reset de senha, verificação de e-mail).
 * @returns {Promise<boolean>} - True se uma ação da URL foi tratada, False caso contrário.
 */
async function handleUrlActions() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const action = urlParams.get('action');

    // Se não houver token ou ação na URL, não faz nada
    if (!token || !action) return false;

    // Armazena o token globalmente para uso posterior (ex: handleResetPassword)
    actionToken = token;
    // Limpa os parâmetros da URL para evitar reprocessamento
    window.history.replaceState({}, document.title, window.location.pathname);

    if (action === 'resetPassword') {
        switchView('resetPassword'); // Mostra a tela de redefinição de senha
        return true; // Indica que uma ação foi tratada
    }
    if (action === 'verifyEmail') {
        await handleVerifyEmail(); // Chama a função que faz a chamada API para verificar
        return true; // Indica que uma ação foi tratada
    }

    // Se a ação não for reconhecida, limpa o token e continua
    actionToken = null;
    return false;
}

/**
 * Função principal que inicializa a aplicação.
 */
async function main() {
    setupEventListeners(); // Configura todos os listeners de eventos
    initState(); // Carrega o estado inicial da sessão e tema
    applyUserTheme(getUserTheme()); // Aplica o tema visualmente

    // Verifica e trata ações da URL antes de verificar a sessão
    const urlActionHandled = await handleUrlActions();
    if (urlActionHandled) {
        // Se uma ação da URL foi tratada (ex: reset, verify),
        // a própria função de tratamento (handleVerifyEmail, ou o submit de handleResetPassword)
        // cuidará de redirecionar para o login ao final.
        return; // Interrompe a execução aqui.
    }

    // Se não havia ação na URL, verifica se há um usuário logado
    if (getCurrentUser()) { //
        await initializeUserFlow(); // Tenta carregar os dados do usuário logado
    } else {
        switchView('login'); // Se não houver usuário, mostra a tela de login
    }
}

// Inicia a aplicação quando o script é carregado
main();