// src/api/__tests__/investimentos.routes.test.js

// 1) MOCKS - DEVEM VIR ANTES DOS IMPORTS
const mockAuthJwt = {
  verifyToken: jest.fn((req, res, next) => next()),
  isAdmin: jest.fn((req, res, next) => next()),
};
jest.mock('../../middlewares/authJwt', () => mockAuthJwt);

const mockProdutoController = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
jest.mock('../../controllers/produtoInvestimento.controller', () => mockProdutoController);

// 2) IMPORTS
const request = require('supertest');
const express = require('express');
const investimentosRoutes = require('../investimentos.routes');
const errorHandler = require('../../middlewares/errorHandler');

// 3) APP DE TESTE
const app = express();
app.use(express.json());
app.use('/api/investimentos', investimentosRoutes);
app.use(errorHandler);

// 4) HELPERS
const adminToken = 'Bearer ADMIN_TOKEN';
const userToken = 'Bearer USER_TOKEN';

describe('Investimentos Routes', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock verifyToken
    mockAuthJwt.verifyToken.mockImplementation((req, res, next) => {
      const auth = req.headers['authorization'];
      if (!auth) return res.status(403).json({ message: 'Nenhum token foi fornecido!' });
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
      
      if (token === 'ADMIN_TOKEN') {
        req.clienteId = 1;
        req.clienteRole = 'admin';
        return next();
      } else if (token === 'USER_TOKEN') {
        req.clienteId = 2;
        req.clienteRole = 'cliente';
        return next();
      }
      return res.status(401).json({ message: 'Token inválido' });
    });

    // Mock isAdmin
    mockAuthJwt.isAdmin.mockImplementation((req, res, next) => {
      if (req.clienteRole === 'admin') {
        return next();
      }
      return res.status(403).json({ message: 'Acesso negado! Requer privilégios de administrador.' });
    });

    // Mock controller responses
    mockProdutoController.findAll.mockImplementation((req, res) => {
      return res.status(200).json([
        { id: 1, nome: 'Tesouro Selic', tipo: 'Renda Fixa', risco: 'Baixo', preco: 100 }
      ]);
    });

    mockProdutoController.findById.mockImplementation((req, res) => {
      return res.status(200).json({ 
        id: req.params.id, 
        nome: 'Tesouro Selic', 
        tipo: 'Renda Fixa', 
        risco: 'Baixo', 
        preco: 100 
      });
    });

    mockProdutoController.create.mockImplementation((req, res) => {
      return res.status(201).json({ id: 99, ...req.body });
    });

    mockProdutoController.update.mockImplementation((req, res) => {
      return res.status(200).json({ id: req.params.id, ...req.body });
    });

    mockProdutoController.delete.mockImplementation((req, res) => {
      return res.status(204).send();
    });
  });

  // --- TESTES GET /investimentos (PÚBLICO) ---
  it('GET /api/investimentos - deve retornar 200 sem autenticação', async () => {
    const res = await request(app).get('/api/investimentos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockProdutoController.findAll).toHaveBeenCalledTimes(1);
  });

  it('GET /api/investimentos/:id - deve retornar 200 sem autenticação', async () => {
    const res = await request(app).get('/api/investimentos/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe('1');
    expect(mockProdutoController.findById).toHaveBeenCalledTimes(1);
  });

  // --- TESTES POST /investimentos (ADMIN APENAS) ---
  it('POST /api/investimentos - deve retornar 201 com token admin', async () => {
    const novoProduto = {
      nome: 'Tesouro IPCA+',
      tipo: 'Renda Fixa',
      risco: 'Médio',
      preco: 150
    };

    const res = await request(app)
      .post('/api/investimentos')
      .set('Authorization', adminToken)
      .send(novoProduto);

    expect(res.statusCode).toBe(201);
    expect(res.body.nome).toBe(novoProduto.nome);
    expect(mockProdutoController.create).toHaveBeenCalledTimes(1);
  });

  it('POST /api/investimentos - deve retornar 403 sem autenticação', async () => {
    const res = await request(app)
      .post('/api/investimentos')
      .send({ nome: 'Teste' });

    expect(res.statusCode).toBe(403);
    expect(mockProdutoController.create).not.toHaveBeenCalled();
  });

  it('POST /api/investimentos - deve retornar 403 com token de usuário comum', async () => {
    const res = await request(app)
      .post('/api/investimentos')
      .set('Authorization', userToken)
      .send({ nome: 'Teste' });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('Requer privilégios de administrador');
    expect(mockProdutoController.create).not.toHaveBeenCalled();
  });

  // --- TESTES PUT /investimentos/:id (ADMIN APENAS) ---
  it('PUT /api/investimentos/:id - deve retornar 200 com token admin', async () => {
    const res = await request(app)
      .put('/api/investimentos/1')
      .set('Authorization', adminToken)
      .send({ nome: 'Tesouro Selic Atualizado', preco: 110 });

    expect(res.statusCode).toBe(200);
    expect(mockProdutoController.update).toHaveBeenCalledTimes(1);
  });

  it('PUT /api/investimentos/:id - deve retornar 403 com token de usuário comum', async () => {
    const res = await request(app)
      .put('/api/investimentos/1')
      .set('Authorization', userToken)
      .send({ nome: 'Teste' });

    expect(res.statusCode).toBe(403);
    expect(mockProdutoController.update).not.toHaveBeenCalled();
  });

  // --- TESTES DELETE /investimentos/:id (ADMIN APENAS) ---
  it('DELETE /api/investimentos/:id - deve retornar 204 com token admin', async () => {
    const res = await request(app)
      .delete('/api/investimentos/1')
      .set('Authorization', adminToken);

    expect(res.statusCode).toBe(204);
    expect(mockProdutoController.delete).toHaveBeenCalledTimes(1);
  });

  it('DELETE /api/investimentos/:id - deve retornar 403 com token de usuário comum', async () => {
    const res = await request(app)
      .delete('/api/investimentos/1')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(403);
    expect(mockProdutoController.delete).not.toHaveBeenCalled();
  });
});
