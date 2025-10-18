// src/services/auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const clienteRepository = require('../repositories/cliente.repository');
const authConfig = require('../config/auth.config');
const emailService = require('./email.service');

/**
 * Valida a força da senha.
 * Requisitos: Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 especial.
 * @param {string} senha - A senha a ser validada.
 * @returns {boolean} - True se a senha for válida, false caso contrário.
 */
function isSenhaForte(senha) {
    if (!senha || senha.length < 8) {
        return false;
    }
    // Regex: Pelo menos 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+\-\/~`'"])[A-Za-z\d@$!%*?&+\-\/~`'"]{8,}$/;
    return regex.test(senha);
}

/**
 * Gera um Access Token JWT.
 * @param {object} payload - Dados a serem incluídos no token (ex: { id: userId, role: userRole }).
 * @returns {string} O token JWT de acesso gerado.
 */
function generateAccessToken(payload) {
    return jwt.sign(payload, authConfig.secret, {
        expiresIn: parseInt(authConfig.jwtExpiration, 10) // Usa a expiração do config
    });
}

/**
 * Gera um Refresh Token JWT.
 * @param {object} payload - Dados a serem incluídos no token (ex: { id: userId, role: userRole }).
 * @returns {string} O token JWT de refresh gerado.
 */
function generateRefreshToken(payload) {
    return jwt.sign(payload, authConfig.jwtRefreshSecret, { // Usa o segredo de refresh
        expiresIn: parseInt(authConfig.jwtRefreshExpiration, 10) // Usa a expiração de refresh
    });
}

class AuthService {

    /**
     * Registra um novo cliente, envia e-mail de verificação.
     * @param {object} clienteData - Dados do cliente (nome, email, senha).
     * @returns {Promise<object>} Objeto do novo cliente (sem a senha).
     */
    async register(clienteData) {
        const { nome, email, senha } = clienteData;

        const emailExistente = await clienteRepository.findByEmail(email); //
        if (emailExistente) {
            throw new Error('Este e-mail já está cadastrado.');
        }

        if (!isSenhaForte(senha)) { //
            throw new Error('A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial (@$!%*?&).');
        }

        const senhaCriptografada = bcrypt.hashSync(senha, 8); //

        const novoCliente = await clienteRepository.create({ //
            nome,
            email,
            senha: senhaCriptografada
        });

        // Gera um token de verificação (JWT simples com segredo principal)
        const verificationToken = jwt.sign({ id: novoCliente.id }, authConfig.secret, { //
            expiresIn: 3600 // 1h para verificar
        });

        // Envia o e-mail em segundo plano
        emailService.sendAccountVerificationEmail(novoCliente.email, verificationToken) //
            .catch(err => {
                console.error(`[BACKGROUND JOB FAILED] Falha ao enviar e-mail de verificação para ${novoCliente.email}:`, err);
            });

        // Retorna apenas os dados básicos do cliente, sem tokens de sessão
        return { id: novoCliente.id, nome: novoCliente.nome, email: novoCliente.email };
    }

    /**
     * Autentica um usuário (cliente ou admin) e retorna Access e Refresh Tokens.
     * @param {object} loginData - Dados de login (email, senha).
     * @returns {Promise<object>} Objeto contendo dados do cliente, accessToken, refreshToken e role.
     */
    async login(loginData) {
        const { email, senha } = loginData;

        // --- Lógica de Login do Admin ---
        const isAdminLogin = email === process.env.ADMIN_EMAIL && senha === process.env.ADMIN_PASSWORD; //
        if (isAdminLogin) {
            const adminUser = { id: 'admin', nome: 'Administrador', role: 'admin' };
            const payload = { id: adminUser.id, role: adminUser.role };
            const accessToken = generateAccessToken(payload); //
            const refreshToken = generateRefreshToken(payload); //

            return {
                cliente: { id: adminUser.id, nome: adminUser.nome, email: process.env.ADMIN_EMAIL },
                accessToken: accessToken,
                refreshToken: refreshToken,
                role: 'admin'
            };
        }
        // --- FIM: Lógica de Login do Admin ---

        const cliente = await clienteRepository.findByEmail(email); //
        if (!cliente) {
            throw new Error('Credenciais inválidas.');
        }

        if (!cliente.emailVerificado) { //
            throw new Error('Sua conta ainda não foi ativada. Por favor, verifique seu e-mail.');
        }

        const senhaValida = bcrypt.compareSync(senha, cliente.senha); //
        if (!senhaValida) {
            throw new Error('Credenciais inválidas.');
        }

        const payload = { id: cliente.id, role: 'cliente' }; // Inclui role no payload
        const accessToken = generateAccessToken(payload); //
        const refreshToken = generateRefreshToken(payload); //

        return {
            cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email }, //
            accessToken: accessToken,
            refreshToken: refreshToken,
            role: 'cliente'
        };
    }

    /**
     * Gera um novo Access Token usando um Refresh Token válido.
     * @param {string} token - O Refresh Token fornecido pelo cliente.
     * @returns {Promise<object>} Objeto contendo o novo accessToken.
     */
    async refreshToken(token) {
        if (!token) {
            throw new Error('Refresh token é obrigatório.');
        }

        try {
            // Verifica o refresh token usando o SEGREDO DE REFRESH
            const decoded = jwt.verify(token, authConfig.jwtRefreshSecret); //

            // Cria o payload para o novo access token (baseado nos dados do refresh token)
            const payload = { id: decoded.id, role: decoded.role };

            // Gera um NOVO access token usando o SEGREDO PRINCIPAL
            const newAccessToken = generateAccessToken(payload); //

            return { accessToken: newAccessToken };

        } catch (err) {
            console.error("Erro ao verificar refresh token:", err.message);
            // Lança um erro específico para indicar falha na validação/expiração do refresh token
            throw new Error('Refresh token inválido ou expirado. Faça login novamente.');
        }
    }

    /**
     * Verifica o e-mail de um cliente usando o token de verificação.
     * @param {string} token - O token JWT de verificação.
     * @returns {Promise<object>} Mensagem de sucesso ou status.
     */
    async verifyEmail(token) {
        let decoded;
        try {
            // Verifica usando o segredo principal
            decoded = jwt.verify(token, authConfig.secret); //
        } catch (err) {
            throw new Error('Token de verificação inválido ou expirado.');
        }

        const cliente = await clienteRepository.findById(decoded.id); //
        if (!cliente) {
            throw new Error('Usuário associado ao token não encontrado.'); // Mensagem mais clara
        }

        // Se já verificado, retorna sucesso sem alterar nada (idempotente)
        if (cliente.emailVerificado) { //
            return { message: 'E-mail já verificado.' };
        }

        await clienteRepository.updateEmailVerificado(decoded.id); //
        return { message: 'E-mail verificado com sucesso!' };
    }

    /**
     * Inicia o processo de redefinição de senha enviando um e-mail.
     * @param {string} email - E-mail do cliente.
     */
    async forgotPassword(email) {
        const cliente = await clienteRepository.findByEmail(email); //
        // Não lança erro se o e-mail não existe por segurança (evita enumeração)
        if (!cliente) {
            console.warn(`Tentativa de reset de senha para e-mail não cadastrado: ${email}`);
            return;
        }

        // Gera token de reset (JWT simples com segredo principal)
        const resetToken = jwt.sign({ id: cliente.id }, authConfig.secret, { //
            expiresIn: 3600 // 1 hora
        });

        // Envia e-mail em segundo plano
        emailService.sendPasswordResetEmail(cliente.email, resetToken) //
            .catch(err => {
                console.error(`[BACKGROUND JOB FAILED] Falha ao enviar e-mail de redefinição para ${email}:`, err);
            });
    }

    /**
     * Redefine a senha do cliente usando o token de redefinição.
     * @param {string} token - O token JWT de redefinição.
     * @param {string} novaSenha - A nova senha fornecida pelo usuário.
     */
    async resetPassword(token, novaSenha) {
        let decoded;
        try {
            // Verifica usando o segredo principal
            decoded = jwt.verify(token, authConfig.secret); //
        } catch (err) {
            throw new Error('Token de redefinição inválido ou expirado.');
        }

        // Valida a força da nova senha
        if (!isSenhaForte(novaSenha)) { //
            throw new Error('A nova senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial (@$!%*?&).');
        }

        const senhaCriptografada = bcrypt.hashSync(novaSenha, 8); //
        await clienteRepository.updateSenha(decoded.id, senhaCriptografada); //
    }
}

module.exports = new AuthService();