// src/controllers/auth.controller.js
const authService = require('../services/auth.service'); //
const { RegisterRequestDTO, LoginRequestDTO, RefreshTokenRequestDTO } = require('../dtos/auth.dto'); //

class AuthController {

    /**
     * Lida com a requisição de registro de novo cliente.
     */
    async register(req, res, next) {
        try {
            // Usa DTO para extrair dados do corpo da requisição
            const registerRequest = new RegisterRequestDTO(req.body); //

            // Validação básica de presença dos campos
            if (!registerRequest.nome || !registerRequest.email || !registerRequest.senha) {
                // Retorna erro 400 Bad Request se algum campo estiver faltando
                return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
            }

            // Chama o serviço para registrar o cliente
            await authService.register(registerRequest); //

            // Retorna status 201 Created com mensagem de sucesso
            res.status(201).json({
                message: "Cadastro realizado com sucesso! Um e-mail de verificação foi enviado para sua caixa de entrada (verifique também o Spam)."
            });
        } catch (error) {
            // Define o statusCode com base no tipo de erro vindo do serviço
            error.statusCode = error.message.includes('e-mail já está cadastrado') ? 409 // Conflict
                               : error.message.includes('senha deve ter no mínimo') ? 400 // Bad Request (senha fraca)
                               : 400; // Outros erros de validação
            // Passa o erro para o middleware de erro global
            next(error);
        }
    }

    /**
     * Lida com a requisição de login.
     */
    async login(req, res, next) {
        try {
            // Usa DTO para extrair dados do corpo da requisição
            const loginRequest = new LoginRequestDTO(req.body); //

            // Validação básica de presença dos campos
            if (!loginRequest.email || !loginRequest.senha) {
                return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
            }

            // Chama o serviço para realizar o login
            // O serviço agora retorna { cliente, accessToken, refreshToken, role }
            const loginData = await authService.login(loginRequest); //

            // Retorna status 200 OK com os dados do cliente e os tokens
            res.status(200).json(loginData);

        } catch (error) {
            // Define o statusCode com base no tipo de erro vindo do serviço
            if (error.message.includes('ainda não foi ativada')) {
                error.statusCode = 403; // Forbidden (conta existe mas não pode logar)
            } else { // 'Credenciais inválidas' ou outros erros
                error.statusCode = 401; // Unauthorized
            }
            // Passa o erro para o middleware de erro global
            next(error);
        }
    }

    /**
     * Lida com a requisição para obter um novo Access Token usando um Refresh Token.
     */
    async refreshToken(req, res, next) {
        try {
            // Usa DTO para extrair o refresh token do corpo da requisição
            const refreshRequest = new RefreshTokenRequestDTO(req.body); //

            // Valida se o refresh token foi fornecido
            if (!refreshRequest.refreshToken) {
                return res.status(400).json({ message: 'Refresh token é obrigatório.' });
            }

            // Chama o serviço para gerar um novo access token
            // O serviço retorna { accessToken }
            const tokens = await authService.refreshToken(refreshRequest.refreshToken); //

            // Retorna status 200 OK com o novo access token
            res.status(200).json(tokens);

        } catch (error) {
            // Erros do serviço refreshToken (token inválido/expirado) devem retornar 401
            error.statusCode = 401; // Unauthorized
            // Passa o erro para o middleware de erro global
            next(error);
        }
    }

    /**
     * Lida com a requisição de verificação de e-mail.
     */
    async verifyEmail(req, res, next) {
        try {
            // Extrai o token diretamente do corpo da requisição
            const { token } = req.body;

            // Valida se o token foi fornecido
            if (!token) {
                return res.status(400).json({ message: 'O token de verificação é obrigatório.' });
            }

            // Chama o serviço para verificar o e-mail
            const result = await authService.verifyEmail(token); //

            // Retorna status 200 OK com a mensagem do serviço
            res.status(200).json(result);

        } catch (error) {
            // Erros de verificação (token inválido/expirado, usuário não encontrado) devem retornar 401
            error.statusCode = 401; // Unauthorized (ou 404 se preferir para usuário não encontrado)
            // Passa o erro para o middleware de erro global
            next(error);
        }
    }

    /**
     * Lida com a requisição de "esqueci minha senha".
     */
    async forgotPassword(req, res, next) {
        try {
            // Extrai o e-mail diretamente do corpo da requisição
            const { email } = req.body;

            // Valida se o e-mail foi fornecido
            if (!email) {
                return res.status(400).json({ message: 'O e-mail é obrigatório.' });
            }

            // Chama o serviço para iniciar o processo (não retorna erro se e-mail não existe)
            await authService.forgotPassword(email); //

            // Retorna sempre 200 OK com uma mensagem genérica por segurança
            res.status(200).json({ message: 'Se o e-mail fornecido estiver em nosso sistema, um link de redefinição de senha será enviado.' });
        } catch (error) {
            // Erros inesperados do serviço (ex: falha no envio de e-mail configurado incorretamente)
            // serão capturados pelo middleware de erro global
            next(error);
        }
    }

    /**
     * Lida com a requisição de redefinição de senha usando o token.
     */
    async resetPassword(req, res, next) {
        try {
            // Extrai o token e a nova senha do corpo da requisição
            const { token, novaSenha } = req.body;

            // Valida se ambos foram fornecidos
            if (!token || !novaSenha) {
                return res.status(400).json({ message: 'O token e a nova senha são obrigatórios.' });
            }

            // Chama o serviço para redefinir a senha
            await authService.resetPassword(token, novaSenha); //

            // Retorna status 200 OK com mensagem de sucesso
            res.status(200).json({ message: 'Senha redefinida com sucesso!' });
        } catch (error) {
            // Define o statusCode com base no erro vindo do serviço
            error.statusCode = error.message.includes('inválido ou expirado') ? 401 // Unauthorized
                               : error.message.includes('senha deve ter no mínimo') ? 400 // Bad Request (senha fraca)
                               : 400; // Outros possíveis erros
            // Passa o erro para o middleware de erro global
            next(error);
        }
    }
}

module.exports = new AuthController();