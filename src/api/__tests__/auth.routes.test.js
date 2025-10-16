// src/api/__tests__/auth.routes.test.js
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// 1. Cria Mocks para o Controller
const mockAuthController = {
    register: jest.fn(),
    login: jest.fn(),
    verifyEmail: jest.fn(), 
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
};

// 2. MOCKA O MÓDULO DO CONTROLLER (Solução para Isolamento/Timeout)
jest.mock('../../controllers/auth.controller', () => mockAuthController);

// 3. Importa os componentes APÓS o mock
const authRoutes = require('../auth.routes'); 
const errorHandler = require('../../middlewares/errorHandler');

// 4. Criação do App Express de Teste
const app = express();
app.use(bodyParser.json()); 
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
});