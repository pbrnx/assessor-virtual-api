// src/api/__tests__/clientes.routes.test.js

// 1) MOCKS - DEVEM VIR ANTES DOS IMPORTS DA ROTA
jest.mock('../../middlewares/authJwt', () => ({
  verifyToken: jest.fn((req, res, next) => next()),
}));

// Mock do controller da carteira: liste TODAS as funções usadas em carteira.routes.js
const mockCarteiraController = {
  getCarteira: jest.fn(),
  comprar: jest.fn(),
  vender: jest.fn(),
  // Se sua rota tiver mais handlers, adicione-os aqui:
  // saldo: jest.fn(),
  // extrato: jest.fn(),
};

jest.mock('../../controllers/carteira.controller', () => mockCarteiraController);

// Opcional: mock do jsonwebtoken (caso o verify seja usado pelo middleware)
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn(() => 'MOCKED_TOKEN'),
  decode: jest.fn(),
}));

// 2) IMPORTS (somente após os mocks)
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const carteiraRoutes = require('../carteira.routes');
const errorHandler = require('../../middlewares/errorHandler');
const authJwt = require('../../middlewares/authJwt');

// 3) APP DE TESTE
const app = express();
app.use(bodyParser.json());

// Monte a rota ANTES do errorHandler
const CLIENTE_ID = 123;
app.use('/api/clientes/:id/carteira', carteiraRoutes);

// errorHandler por último
app.use(errorHandler);

// 4) HELPERS
const validToken = 'Bearer MOCKED_VALID_TOKEN';
const invalidToken = 'Bearer INVALID';

// Se seu middleware usa jwt.verify, simule aqui o sucesso/erro
jwt.verify.mockImplementation((token, secret, cb) => {
  if (token === 'MOCKED_VALID_TOKEN') return cb(null, { id: CLIENTE_ID, role: 'cliente' });
  return cb(new Error('Token inválido/expirado'));
});

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

    // Middleware padrão permitindo acesso quando token válido
    authJwt.verifyToken.mockImplementation((req, res, next) => {
      const auth = req.headers['authorization'];
      if (!auth) return res.status(403).json({ message: 'Nenhum token foi fornecido!' });
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
      jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Não autorizado! O token é inválido ou expirou.' });
        req.userId = decoded.id;
        return next();
      });
    });

    // Mocks que encerram a resposta
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