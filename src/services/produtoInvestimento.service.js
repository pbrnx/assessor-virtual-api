// src/services/produtoInvestimento.service.js
const produtoRepository = require('../repositories/produtoInvestimento.repository');

class ProdutoInvestimentoService {

    async createProduto(produtoData) {
        const { nome, tipo, risco } = produtoData;
        if (!nome || !tipo || !risco) {
            throw new Error('Nome, tipo e risco são obrigatórios.');
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