// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const { RegisterRequestDTO, LoginRequestDTO } = require('../dtos/auth.dto');

class AuthController {

    // ... (métodos register, login, forgotPassword, resetPassword existentes) ...
    async register(req, res, next) {
        try {
            const registerRequest = new RegisterRequestDTO(req.body);
            if (!registerRequest.nome || !registerRequest.email || !registerRequest.senha) {
                return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
            }
            const novoCliente = await authService.register(registerRequest);
            res.status(201).json({
                message: "Cadastro realizado com sucesso! Um e-mail de verificação foi enviado para sua caixa de entrada."
            });
        } catch (error) {
            error.statusCode = error.message.includes('e-mail já está cadastrado') ? 409 : 400;
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const loginRequest = new LoginRequestDTO(req.body);

            if (!loginRequest.email || !loginRequest.senha) {
                return res.status(400).json({ message: 'Email and senha são obrigatórios.' });
            }
            const loginData = await authService.login(loginRequest);
            res.status(200).json(loginData);
        } catch (error) {
            // Diferencia o erro de "não verificado" dos outros erros de login
            if (error.message.includes('ainda não foi ativada')) {
                error.statusCode = 403; // Forbidden
            } else {
                error.statusCode = 401; // Unauthorized
            }
            next(error);
        }
    }

    /**
     * <<<< NOVO MÉTODO >>>>
     * Recebe um token de verificação e ativa a conta do usuário.
     */
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ message: 'O token de verificação é obrigatório.' });
            }

            const result = await authService.verifyEmail(token);
            res.status(200).json(result);

        } catch (error) {
            error.statusCode = 401; // Token inválido/expirado
            next(error);
        }
    }
    
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'O e-mail é obrigatório.' });
            }
            await authService.forgotPassword(email);
            res.status(200).json({ message: 'Se o e-mail fornecido estiver em nosso sistema, um link de redefinição de senha será enviado.' });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, novaSenha } = req.body;
            if (!token || !novaSenha) {
                return res.status(400).json({ message: 'O token e a nova senha são obrigatórios.' });
            }
            await authService.resetPassword(token, novaSenha);
            res.status(200).json({ message: 'Senha redefinida com sucesso!' });
        } catch (error) {
            error.statusCode = 401;
            next(error);
        }
    }
}

module.exports = new AuthController();