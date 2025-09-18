// src/controllers/produtoInvestimento.controller.js
const produtoService = require('../services/produtoInvestimento.service');
const ProdutoInvestimentoDTO = require('../dtos/produtoInvestimento.dto');

class ProdutoInvestimentoController {
    async create(req, res, next) {
        try {
            const produtoDTO = new ProdutoInvestimentoDTO(req.body);
            const novoProduto = await produtoService.createProduto(produtoDTO);
            res.status(201).json(novoProduto);
        } catch (error) {
            next(error);
        }
    }

    async findAll(req, res, next) {
        try {
            const produtos = await produtoService.getAllProdutos();
            res.status(200).json(produtos);
        } catch (error) {
            next(error);
        }
    }

    async findById(req, res, next) {
        try {
            const produto = await produtoService.getProdutoById(req.params.id);
            res.status(200).json(produto);
        } catch (error) {
            error.statusCode = 404;
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const produtoDTO = new ProdutoInvestimentoDTO(req.body);
            const produtoAtualizado = await produtoService.updateProduto(req.params.id, produtoDTO);
            res.status(200).json(produtoAtualizado);
        } catch (error) {
            error.statusCode = error.message.includes('encontrado') ? 404 : 400;
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await produtoService.deleteProduto(req.params.id);
            res.status(204).send();
        } catch (error) {
            error.statusCode = 404;
            next(error);
        }
    }
}

module.exports = new ProdutoInvestimentoController();