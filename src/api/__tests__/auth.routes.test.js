// src/api/__tests__/auth.routes.test.js
const request = require('supertest');
const express = require('express');

// 1. Cria Mocks para o Controller
const mockAuthController = {
    register: jest.fn(),
    login: jest.fn(),
    verifyEmail: jest.fn(), 
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    refreshToken: jest.fn(), // Adicionado o método refreshToken que faltava
};

// 2. MOCKA O MÓDULO DO CONTROLLER (Solução para Isolamento/Timeout)
jest.mock('../../controllers/auth.controller', () => mockAuthController);

// 3. Importa os componentes APÓS o mock
const authRoutes = require('../auth.routes'); 
const errorHandler = require('../../middlewares/errorHandler');

// 4. Criação do App Express de Teste
const app = express();
app.use(express.json()); // Express 5 já tem body parser embutido
app.use('/api/auth', authRoutes);
app.use(errorHandler); // O middleware de erro deve ser o último

describe('API Auth Routes - Testes de Integração (FINAL)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- CENA: POST /api/auth/register (Sucesso) ---
    it('POST /api/auth/register - deve retornar 201 em caso de sucesso no registro', async () => {
        const mockRegisterData = { nome: 'User Test', email: 'user@test.com', senha: 'password' };
        
        // CORRIGIDO: Mock implementa a resposta completa
        mockAuthController.register.mockImplementation((req, res) => {
            return res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
        });

        const response = await request(app) 
            .post('/api/auth/register')
            .send(mockRegisterData);

        expect(response.statusCode).toBe(201);
        expect(mockAuthController.register).toHaveBeenCalled();
        expect(response.body.message).toContain('Cadastro realizado com sucesso!');
    });


    // --- CENA: POST /api/auth/register (Email Duplicado - Erro 409) ---
    it('POST /api/auth/register - deve retornar 409 se o e-mail já estiver cadastrado', async () => {
        const mockRegisterData = { nome: 'User Test', email: 'duplicate@test.com', senha: 'password' };

        const mockError = new Error('Este e-mail já está cadastrado.');
        mockError.statusCode = 409;
        
        // CORRIGIDO: Mock chama next(error) para acionar o errorHandler
        mockAuthController.register.mockImplementation((req, res, next) => {
            return next(mockError);
        });

        const response = await request(app)
            .post('/api/auth/register')
            .send(mockRegisterData);

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe('Este e-mail já está cadastrado.');
    });
    
    // --- CENA: POST /api/auth/login (Sucesso) ---
    it('POST /api/auth/login - deve retornar 200 e um token em caso de sucesso', async () => {
        const mockLoginData = { email: 'user@test.com', senha: 'password' };
        const mockLoginResponse = { cliente: { id: 1, nome: 'User' }, token: 'MOCKED_JWT' };

        // CORRIGIDO: Mock implementa a resposta completa
        mockAuthController.login.mockImplementation((req, res) => {
            return res.status(200).json(mockLoginResponse);
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send(mockLoginData);

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBe('MOCKED_JWT');
        expect(response.body.cliente).toEqual({ id: 1, nome: 'User' });
    });

    // --- CENA: POST /api/auth/login (Credenciais Inválidas - Erro 401) ---
    it('POST /api/auth/login - deve retornar 401 para credenciais inválidas', async () => {
        const mockLoginData = { email: 'wrong@test.com', senha: 'wrong' };

        const mockError = new Error('Credenciais inválidas.');
        mockError.statusCode = 401;
        
        // CORRIGIDO: Mock chama next(error) para acionar o errorHandler
        mockAuthController.login.mockImplementation((req, res, next) => {
            return next(mockError);
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send(mockLoginData);

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Credenciais inválidas.');
    });

    // --- CENA: POST /api/auth/verify-email (Sucesso) ---
    it('POST /api/auth/verify-email - deve retornar 200 ao verificar e-mail', async () => {
        mockAuthController.verifyEmail.mockImplementation((req, res) => {
            return res.status(200).json({ message: 'E-mail verificado com sucesso!' });
        });

        const response = await request(app)
            .post('/api/auth/verify-email')
            .send({ token: 'VALID_VERIFICATION_TOKEN' });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('E-mail verificado com sucesso!');
    });

    // --- CENA: POST /api/auth/refresh-token (Sucesso) ---
    it('POST /api/auth/refresh-token - deve retornar 200 e novo token', async () => {
        mockAuthController.refreshToken.mockImplementation((req, res) => {
            return res.status(200).json({ accessToken: 'NEW_ACCESS_TOKEN' });
        });

        const response = await request(app)
            .post('/api/auth/refresh-token')
            .send({ refreshToken: 'VALID_REFRESH_TOKEN' });

        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBe('NEW_ACCESS_TOKEN');
    });

    // --- CENA: POST /api/auth/forgot-password (Sucesso) ---
    it('POST /api/auth/forgot-password - deve retornar 200 com mensagem genérica', async () => {
        mockAuthController.forgotPassword.mockImplementation((req, res) => {
            return res.status(200).json({ 
                message: 'Se o e-mail fornecido estiver em nosso sistema, um link de redefinição de senha será enviado.' 
            });
        });

        const response = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'user@test.com' });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toContain('link de redefinição');
    });

    // --- CENA: POST /api/auth/reset-password (Sucesso) ---
    it('POST /api/auth/reset-password - deve retornar 200 ao redefinir senha', async () => {
        mockAuthController.resetPassword.mockImplementation((req, res) => {
            return res.status(200).json({ message: 'Senha redefinida com sucesso!' });
        });

        const response = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'RESET_TOKEN', novaSenha: 'NovaSenhaForte123!' });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Senha redefinida com sucesso!');
    });
});