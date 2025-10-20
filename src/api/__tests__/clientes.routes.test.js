// src/api/__tests__/clientes.routes.test.js

// 1) MOCKS - DEVEM VIR ANTES DOS IMPORTS DA ROTA
// Mock do middleware authJwt (aplicado em clientes.routes.js)
const mockAuthJwt = {
  verifyToken: jest.fn((req, res, next) => next()),
  isOwnerOrAdmin: jest.fn((req, res, next) => next()),
  isAdmin: jest.fn((req, res, next) => next()),
};
jest.mock('../../middlewares/authJwt', () => mockAuthJwt);

// Mock do controller de cliente
const mockClienteController = {
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  depositar: jest.fn(),
};
jest.mock('../../controllers/cliente.controller', () => mockClienteController);

// Mock do controller de perfil
const mockPerfilController = {
  definirPerfil: jest.fn(),
};
jest.mock('../../controllers/perfil.controller', () => mockPerfilController);

// Mock do controller de recomendacao
const mockRecomendacaoController = {
  getRecomendacao: jest.fn(),
  investir: jest.fn(),
};
jest.mock('../../controllers/recomendacao.controller', () => mockRecomendacaoController);

// Mock do controller da carteira
const mockCarteiraController = {
  getCarteira: jest.fn(),
  comprar: jest.fn(),
  vender: jest.fn(),
};
jest.mock('../../controllers/carteira.controller', () => mockCarteiraController);

// 2) IMPORTS (somente após os mocks)
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const clientesRoutes = require('../clientes.routes');
const errorHandler = require('../../middlewares/errorHandler');

// 3) APP DE TESTE
const app = express();
app.use(express.json()); // Express 5 já tem body parser embutido

// Monte a rota ANTES do errorHandler
app.use('/api/clientes', clientesRoutes);

// errorHandler por último
app.use(errorHandler);

// 4) HELPERS
const CLIENTE_ID = 123;
const validToken = 'Bearer MOCKED_VALID_TOKEN';
const invalidToken = 'Bearer INVALID';

describe('Clientes Carteira Routes (protegidas por JWT)', () => {
  beforeAll(() => {
    // Silencia console.error do errorHandler
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Middleware verifyToken - simula autenticação bem-sucedida
    mockAuthJwt.verifyToken.mockImplementation((req, res, next) => {
      const auth = req.headers['authorization'];
      if (!auth) return res.status(403).json({ message: 'Nenhum token foi fornecido!' });
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
      
      if (token === 'MOCKED_VALID_TOKEN') {
        req.clienteId = CLIENTE_ID;
        req.clienteRole = 'cliente';
        return next();
      }
      return res.status(401).json({ message: 'Não autorizado! O token é inválido ou expirou.' });
    });

    // Middleware isOwnerOrAdmin - permite acesso quando é o dono ou admin
    mockAuthJwt.isOwnerOrAdmin.mockImplementation((req, res, next) => {
      if (req.clienteRole === 'admin' || req.clienteId == req.params.id) {
        return next();
      }
      return res.status(403).json({ message: 'Acesso negado! Você não tem permissão para acessar este recurso.' });
    });

    // Middleware isAdmin - permite acesso apenas para admin
    mockAuthJwt.isAdmin.mockImplementation((req, res, next) => {
      if (req.clienteRole === 'admin') {
        return next();
      }
      return res.status(403).json({ message: 'Acesso negado! Requer privilégios de administrador.' });
    });

    // Mocks dos controllers de cliente
    mockClienteController.findAll.mockImplementation((req, res) => {
      return res.status(200).json([{ id: 1, nome: 'Cliente 1' }]);
    });

    mockClienteController.findById.mockImplementation((req, res) => {
      return res.status(200).json({ id: req.params.id, nome: 'Cliente' });
    });

    mockClienteController.depositar.mockImplementation((req, res) => {
      return res.status(200).json({ id: req.params.id, saldo: 1000 });
    });

    // Mocks dos controllers de perfil e recomendacao
    mockPerfilController.definirPerfil.mockImplementation((req, res) => {
      return res.status(200).json({ perfil: 'Moderado' });
    });

    mockRecomendacaoController.getRecomendacao.mockImplementation((req, res) => {
      return res.status(200).json({ recomendacoes: [] });
    });

    mockRecomendacaoController.investir.mockImplementation((req, res) => {
      return res.status(200).json({ message: 'Investimento realizado' });
    });

    // Mocks dos controllers de carteira
    mockCarteiraController.getCarteira.mockImplementation((req, res) => {
      return res.status(200).json({ saldo: 1000, ativos: [] });
    });

    mockCarteiraController.comprar.mockImplementation((req, res) => {
      return res.status(200).json({ message: 'Compra simulada' });
    });

    mockCarteiraController.vender.mockImplementation((req, res) => {
      return res.status(200).json({ message: 'Venda simulada' });
    });
  });

  it('GET /api/clientes/:id/carteira - 403 sem token', async () => {
    const res = await request(app).get(`/api/clientes/${CLIENTE_ID}/carteira`);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Nenhum token foi fornecido!');
    expect(mockCarteiraController.getCarteira).not.toHaveBeenCalled();
  });

  it('GET /api/clientes/:id/carteira - 401 token inválido', async () => {
    const res = await request(app)
      .get(`/api/clientes/${CLIENTE_ID}/carteira`)
      .set('Authorization', invalidToken);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Não autorizado! O token é inválido ou expirou.');
    expect(mockCarteiraController.getCarteira).not.toHaveBeenCalled();
  });

  it('GET /api/clientes/:id/carteira - 200 token válido', async () => {
    const res = await request(app)
      .get(`/api/clientes/${CLIENTE_ID}/carteira`)
      .set('Authorization', validToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ saldo: 1000, ativos: [] });
    expect(mockCarteiraController.getCarteira).toHaveBeenCalledTimes(1);
  });

  it('POST /comprar - 200 token válido', async () => {
    const res = await request(app)
      .post(`/api/clientes/${CLIENTE_ID}/carteira/comprar`)
      .set('Authorization', validToken)
      .send({ produtoId: 1, valor: 100 });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Compra simulada');
    expect(mockCarteiraController.comprar).toHaveBeenCalledTimes(1);
  });

  it('POST /vender - 200 token válido', async () => {
    const res = await request(app)
      .post(`/api/clientes/${CLIENTE_ID}/carteira/vender`)
      .set('Authorization', validToken)
      .send({ produtoId: 1, valor: 50 });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Venda simulada');
    expect(mockCarteiraController.vender).toHaveBeenCalledTimes(1);
  });
});