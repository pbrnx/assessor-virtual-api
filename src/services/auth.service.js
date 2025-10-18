// src/services/auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const clienteRepository = require('../repositories/cliente.repository');
const authConfig = require('../config/auth.config');
const emailService = require('./email.service');

// --- NOVA FUNÇÃO DE VALIDAÇÃO ---
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
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(senha);
}
// ---------------------------------

class AuthService {

    async register(clienteData) {
        const { nome, email, senha } = clienteData;

        const emailExistente = await clienteRepository.findByEmail(email); //
        if (emailExistente) {
            throw new Error('Este e-mail já está cadastrado.');
        }

        // --- VALIDAÇÃO DA SENHA ---
        if (!isSenhaForte(senha)) {
            throw new Error('A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial (@$!%*?&).');
        }
        // --------------------------

        const senhaCriptografada = bcrypt.hashSync(senha, 8); //

        const novoCliente = await clienteRepository.create({ //
            nome,
            email,
            senha: senhaCriptografada
        });

        // Gera um token de verificação
        const verificationToken = jwt.sign({ id: novoCliente.id }, authConfig.secret, { //
            expiresIn: 3600 // 1h pra verificar
        });

        // [CORREÇÃO DE PERFORMANCE] Envia o e-mail em segundo plano (Fire-and-Forget)
        emailService.sendAccountVerificationEmail(novoCliente.email, verificationToken) //
            .catch(err => {
                console.error(`[BACKGROUND JOB FAILED] Falha ao enviar e-mail de verificação para ${novoCliente.email}:`, err);
            });

        return novoCliente;
    }

    async login(loginData) {
        const { email, senha } = loginData;

        // --- Lógica de Login do Admin ---
        const isAdminLogin = email === process.env.ADMIN_EMAIL && senha === process.env.ADMIN_PASSWORD;

        if (isAdminLogin) {
            const adminUser = { id: 'admin', nome: 'Administrador', role: 'admin' };
            const token = jwt.sign({ id: adminUser.id, role: adminUser.role }, authConfig.secret, { //
                expiresIn: 900 // 15 minutos
            });

            return {
                cliente: {
                    id: adminUser.id,
                    nome: adminUser.nome,
                    email: process.env.ADMIN_EMAIL
                },
                token: token,
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

        const token = jwt.sign({ id: cliente.id, role: 'cliente' }, authConfig.secret, { //
            expiresIn: 1800 // 30 minutos
        });

        return {
            cliente: {
                id: cliente.id, //
                nome: cliente.nome, //
                email: cliente.email //
            },
            token: token,
            role: 'cliente'
        };
    }

    async verifyEmail(token) {
        let decoded;
        try {
            decoded = jwt.verify(token, authConfig.secret); //
        } catch (err) {
            throw new Error('Token de verificação inválido ou expirado.');
        }

        const cliente = await clienteRepository.findById(decoded.id); //
        if (!cliente) {
            throw new Error('Usuário não encontrado.');
        }

        // Tornar idempotente: se o e-mail já estiver verificado, não altera o estado novamente.
        if (cliente.emailVerificado) {
            return { message: 'E-mail já verificado.' };
        }

        await clienteRepository.updateEmailVerificado(decoded.id); //

        return { message: 'E-mail verificado com sucesso!' };
    }

    async forgotPassword(email) {
        const cliente = await clienteRepository.findByEmail(email); //
        if (!cliente) {
            console.warn(`Tentativa de reset de senha para e-mail não cadastrado: ${email}`);
            // Não lança erro para não revelar e-mails cadastrados
            return;
        }

        const resetToken = jwt.sign({ id: cliente.id }, authConfig.secret, { //
            expiresIn: 3600 // 1 hora
        });

        // [CORREÇÃO DE PERFORMANCE] Envia o e-mail em segundo plano (Fire-and-Forget)
        emailService.sendPasswordResetEmail(cliente.email, resetToken) //
            .catch(err => {
                console.error(`[BACKGROUND JOB FAILED] Falha ao enviar e-mail de redefinição para ${email}:`, err);
            });
    }

    async resetPassword(token, novaSenha) {
        let decoded;
        try {
            decoded = jwt.verify(token, authConfig.secret); //
        } catch (err) {
            throw new Error('Token de redefinição inválido ou expirado.');
        }

        // --- VALIDAÇÃO DA SENHA ---
        if (!isSenhaForte(novaSenha)) {
            throw new Error('A nova senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial (@$!%*?&).');
        }
        // --------------------------

        const senhaCriptografada = bcrypt.hashSync(novaSenha, 8); //
        await clienteRepository.updateSenha(decoded.id, senhaCriptografada); //
    }
}

module.exports = new AuthService();
