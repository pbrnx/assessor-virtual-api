// src/services/produtoInvestimento.service.js
const produtoRepository = require('../repositories/produtoInvestimento.repository');

class ProdutoInvestimentoService {

    async createProduto(produtoData) {
        const { nome, tipo, risco, preco } = produtoData;
        if (!nome || !tipo || !risco || preco === undefined) {
            throw new Error('Nome, tipo, risco e preço são obrigatórios.');
        }
        if (typeof preco !== 'number' || preco < 0) {
            throw new Error('O preço deve ser um número não negativo.');
        }
        return await produtoRepository.create(produtoData);
    }

    async getAllProdutos() {
        return await produtoRepository.findAll();
    }

    async getProdutoById(id) {
        const produto = await produtoRepository.findById(id);
        if (!produto) {
            throw new Error('Produto de investimento não encontrado.');
        }
        return produto;
    }

    async updateProduto(id, produtoData) {
        await this.getProdutoById(id); // Garante que o produto existe
        return await produtoRepository.update(id, produtoData);
    }

    async deleteProduto(id) {
        await this.getProdutoById(id); // Garante que o produto existe
        return await produtoRepository.delete(id);
    }
}

module.exports = new ProdutoInvestimentoService();