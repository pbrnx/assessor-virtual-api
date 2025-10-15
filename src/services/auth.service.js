// src/services/auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const clienteRepository = require('../repositories/cliente.repository');
const authConfig = require('../config/auth.config');
const emailService = require('./email.service');

class AuthService {

    async register(clienteData) {
        const { nome, email, senha } = clienteData;

        const emailExistente = await clienteRepository.findByEmail(email);
        if (emailExistente) {
            throw new Error('Este e-mail já está cadastrado.');
        }

        const senhaCriptografada = bcrypt.hashSync(senha, 8);

        const novoCliente = await clienteRepository.create({
            nome,
            email,
            senha: senhaCriptografada
        });

        // <<<< LÓGICA ADICIONADA >>>>
        // Gera um token de verificação (pode ser de longa duração, pois é de uso único)
        const verificationToken = jwt.sign({ id: novoCliente.id }, authConfig.secret, {
            expiresIn: '7d' // 7 dias para verificar
        });

        // Envia o e-mail de verificação
        await emailService.sendAccountVerificationEmail(novoCliente.email, verificationToken);

        return novoCliente;
    }

    async login(loginData) {
        const { email, senha } = loginData;

        // --- NOVO: Lógica de Login do Admin ---
        const isAdminLogin = email === process.env.ADMIN_EMAIL && senha === process.env.ADMIN_PASSWORD;

        if (isAdminLogin) {
            const adminUser = { id: 'admin', nome: 'Administrador', role: 'admin' };
            const token = jwt.sign({ id: adminUser.id, role: adminUser.role }, authConfig.secret, {
                expiresIn: 86400 // 24 horas
            });

            return {
                cliente: {
                    id: adminUser.id,
                    nome: adminUser.nome,
                    email: process.env.ADMIN_EMAIL
                },
                token: token,
                role: 'admin' // Adiciona a role na resposta
            };
        }
        // --- FIM: Lógica de Login do Admin ---


        const cliente = await clienteRepository.findByEmail(email);
        if (!cliente) {
            throw new Error('Credenciais inválidas.');
        }

        if (!cliente.emailVerificado) {
            throw new Error('Sua conta ainda não foi ativada. Por favor, verifique seu e-mail.');
        }

        const senhaValida = bcrypt.compareSync(senha, cliente.senha);
        if (!senhaValida) {
            throw new Error('Credenciais inválidas.');
        }

        // Adiciona a role 'cliente' ao token do cliente comum
        const token = jwt.sign({ id: cliente.id, role: 'cliente' }, authConfig.secret, {
            expiresIn: 86400 // 24 horas
        });

        return {
            cliente: {
                id: cliente.id,
                nome: cliente.nome,
                email: cliente.email
            },
            token: token,
            role: 'cliente' // Adiciona a role na resposta
        };
    }

    async verifyEmail(token) {
        let decoded;
        try {
            decoded = jwt.verify(token, authConfig.secret);
        } catch (err) {
            throw new Error('Token de verificação inválido ou expirado.');
        }

        const cliente = await clienteRepository.findById(decoded.id);
        if (!cliente) {
            throw new Error('Usuário não encontrado.');
        }

        await clienteRepository.updateEmailVerificado(decoded.id);

        return { message: 'E-mail verificado com sucesso!' };
    }


    async forgotPassword(email) {
        const cliente = await clienteRepository.findByEmail(email);
        if (!cliente) {
            console.warn(`Tentativa de reset de senha para e-mail não cadastrado: ${email}`);
            return;
        }

        const resetToken = jwt.sign({ id: cliente.id }, authConfig.secret, {
            expiresIn: 3600 // 1 hora
        });

        await emailService.sendPasswordResetEmail(cliente.email, resetToken);
    }

    async resetPassword(token, novaSenha) {
        let decoded;
        try {
            decoded = jwt.verify(token, authConfig.secret);
        } catch (err) {
            throw new Error('Token de redefinição inválido ou expirado.');
        }

        const senhaCriptografada = bcrypt.hashSync(novaSenha, 8);
        await clienteRepository.updateSenha(decoded.id, senhaCriptografada);
    }
}

module.exports = new AuthService();