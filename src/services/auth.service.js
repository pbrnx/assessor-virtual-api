// src/services/auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // ADICIONADO: Para hash seguro de tokens
const clienteRepository = require('../repositories/cliente.repository');
const authConfig = require('../config/auth.config');
const emailService = require('./email.service');

/**
 * Cria um hash SHA-256 de um token.
 * @param {string} token - O token em texto plano.
 * @returns {string} O hash SHA-256 do token em formato hexadecimal.
 */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Gera um token criptograficamente seguro.
 * @returns {string} Token aleatório de 64 caracteres hexadecimais.
 */
function generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Compara dois tokens de forma segura contra timing attacks.
 * @param {string} token1 - Primeiro token (hash).
 * @param {string} token2 - Segundo token (hash).
 * @returns {boolean} True se os tokens forem iguais.
 */
function compareTokens(token1, token2) {
    if (!token1 || !token2 || token1.length !== token2.length) {
        return false;
    }
    const buffer1 = Buffer.from(token1, 'hex');
    const buffer2 = Buffer.from(token2, 'hex');
    return crypto.timingSafeEqual(buffer1, buffer2);
}

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

        const emailExistente = await clienteRepository.findByEmail(email);
        if (emailExistente) {
            throw new Error('Este e-mail já está cadastrado.');
        }

        if (!isSenhaForte(senha)) {
            throw new Error('A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial (@$!%*?&).');
        }

        const senhaCriptografada = bcrypt.hashSync(senha, 8);

        const novoCliente = await clienteRepository.create({
            nome,
            email,
            senha: senhaCriptografada
        });

        // SEGURANÇA: Gera token criptograficamente seguro (não JWT!)
        const verificationToken = generateSecureToken(); // 64 chars hex
        const tokenHash = hashToken(verificationToken); // Hash SHA-256
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        // Armazena apenas o HASH no banco de dados
        await clienteRepository.setEmailVerificationToken(novoCliente.id, tokenHash, expiresAt);

        // Envia o TOKEN ORIGINAL (não o hash) por e-mail
        emailService.sendAccountVerificationEmail(novoCliente.email, verificationToken)
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

        const senhaValida = bcrypt.compareSync(senha, cliente.senha);
        if (!senhaValida) {
            throw new Error('Credenciais inválidas.');
        }

        const payload = { id: cliente.id, role: 'cliente' };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // SEGURANÇA: Armazena o hash do refresh token no DB com data de expiração
        const refreshTokenHash = hashToken(refreshToken);
        const refreshTokenExpiry = new Date(Date.now() + parseInt(authConfig.jwtRefreshExpiration, 10) * 1000); // Converte segundos para ms
        await clienteRepository.setRefreshToken(cliente.id, refreshTokenHash, refreshTokenExpiry);

        return {
            cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email },
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
            const decoded = jwt.verify(token, authConfig.jwtRefreshSecret);

            // SEGURANÇA: Verifica se o hash do token existe no banco
            const tokenHash = hashToken(token);
            const cliente = await clienteRepository.findByRefreshToken(tokenHash);

            if (!cliente) {
                throw new Error('Refresh token revogado ou inválido.');
            }

            // Verifica timing-safe (já verificamos existência, mas para consistência)
            if (!compareTokens(tokenHash, cliente.refreshToken)) {
                throw new Error('Refresh token inválido.');
            }

            // Cria o payload para o novo access token (baseado nos dados do refresh token)
            const payload = { id: decoded.id, role: decoded.role };

            // Gera um NOVO access token usando o SEGREDO PRINCIPAL
            const newAccessToken = generateAccessToken(payload);

            return { accessToken: newAccessToken };

        } catch (err) {
            console.error("Erro ao verificar refresh token:", err.message);
            // Lança um erro específico para indicar falha na validação/expiração do refresh token
            throw new Error('Refresh token inválido ou expirado. Faça login novamente.');
        }
    }

    /**
     * Verifica o e-mail de um cliente usando o token de verificação.
     * @param {string} token - O token seguro de verificação (64 chars hex).
     * @returns {Promise<object>} Mensagem de sucesso ou status.
     */
    async verifyEmail(token) {
        if (!token) {
            throw new Error('Token de verificação é obrigatório.');
        }

        // SEGURANÇA: Hash do token recebido para comparar com o DB
        const tokenHash = hashToken(token);

        // Busca cliente pelo hash do token (já verifica expiração no SQL)
        const cliente = await clienteRepository.findByEmailVerificationToken(tokenHash);

        if (!cliente) {
            throw new Error('Token de verificação inválido ou expirado.');
        }

        // SEGURANÇA: Comparação timing-safe
        if (!compareTokens(tokenHash, cliente.emailVerificationToken)) {
            throw new Error('Token de verificação inválido.');
        }

        // Se já verificado, retorna sucesso sem alterar nada (idempotente)
        if (cliente.emailVerificado) {
            return { message: 'E-mail já verificado.' };
        }

        // Marca como verificado e limpa o token
        await clienteRepository.updateEmailVerificado(cliente.id);
        return { message: 'E-mail verificado com sucesso!' };
    }

    /**
     * Inicia o processo de redefinição de senha enviando um e-mail.
     * @param {string} email - E-mail do cliente.
     */
    async forgotPassword(email) {
        const cliente = await clienteRepository.findByEmail(email);
        // Não lança erro se o e-mail não existe por segurança (evita enumeração)
        if (!cliente) {
            console.warn(`Tentativa de reset de senha para e-mail não cadastrado: ${email}`);
            return;
        }

        // SEGURANÇA: Gera token criptograficamente seguro
        const resetToken = generateSecureToken(); // 64 chars hex
        const tokenHash = hashToken(resetToken); // Hash SHA-256
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        // Armazena apenas o HASH no banco de dados
        await clienteRepository.setResetPasswordToken(cliente.id, tokenHash, expiresAt);

        // Envia o TOKEN ORIGINAL (não o hash) por e-mail
        emailService.sendPasswordResetEmail(cliente.email, resetToken)
            .catch(err => {
                console.error(`[BACKGROUND JOB FAILED] Falha ao enviar e-mail de redefinição para ${email}:`, err);
            });
    }

    /**
     * Redefine a senha do cliente usando o token de redefinição.
     * @param {string} token - O token seguro de redefinição (64 chars hex).
     * @param {string} novaSenha - A nova senha fornecida pelo usuário.
     */
    async resetPassword(token, novaSenha) {
        if (!token) {
            throw new Error('Token de redefinição é obrigatório.');
        }

        // SEGURANÇA: Hash do token recebido para comparar com o DB
        const tokenHash = hashToken(token);

        // Busca cliente pelo hash do token (já verifica expiração no SQL)
        const cliente = await clienteRepository.findByResetPasswordToken(tokenHash);

        if (!cliente) {
            throw new Error('Token de redefinição inválido ou expirado.');
        }

        // SEGURANÇA: Comparação timing-safe
        if (!compareTokens(tokenHash, cliente.resetPasswordToken)) {
            throw new Error('Token de redefinição inválido.');
        }

        // Valida a força da nova senha
        if (!isSenhaForte(novaSenha)) {
            throw new Error('A nova senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial (@$!%*?&).');
        }

        const senhaCriptografada = bcrypt.hashSync(novaSenha, 8);
        
        // SEGURANÇA: Revoga refresh token ao resetar senha
        await clienteRepository.revokeRefreshToken(cliente.id);
        
        // Atualiza a senha e limpa os tokens de reset
        await clienteRepository.updateSenha(cliente.id, senhaCriptografada);
        await clienteRepository.clearResetPasswordToken(cliente.id);
    }

    /**
     * Faz logout de um cliente revogando seu refresh token.
     * @param {number} clienteId - O ID do cliente.
     * @returns {Promise<object>} Mensagem de sucesso.
     */
    async logout(clienteId) {
        await clienteRepository.revokeRefreshToken(clienteId);
        return { message: 'Logout realizado com sucesso.' };
    }
}

module.exports = new AuthService();