// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const { RegisterRequestDTO, LoginRequestDTO } = require('../dtos/auth.dto');

class AuthController {

    async register(req, res, next) {
        try {
            const registerRequest = new RegisterRequestDTO(req.body);

            // Validação simples
            if (!registerRequest.nome || !registerRequest.email || !registerRequest.senha) {
                return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
            }

            const novoCliente = await authService.register(registerRequest);
            
            // Não retornamos a senha no DTO de resposta
            res.status(201).json({
                id: novoCliente.id,
                nome: novoCliente.nome,
                email: novoCliente.email
            });

        } catch (error) {
            // Se o erro for de e-mail duplicado, enviamos um status 409 (Conflict)
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
            // Para erros de login, sempre retornamos 401 (Unauthorized)
            error.statusCode = 401;
            next(error);
        }
    }
}

module.exports = new AuthController();