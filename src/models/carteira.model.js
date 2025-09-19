// src/models/carteira.model.js

/**
 * Representa um item na carteira de um cliente.
 */
class CarteiraItem {
    /**
     * @param {number} id - O ID do registro na tabela de carteira.
     * @param {number} clienteId - O ID do cliente dono do ativo.
     * @param {number} produtoId - O ID do produto de investimento.
     * @param {number} quantidade - A quantidade de cotas/unidades do produto.
     * @param {object} [produtoInfo] - Informações detalhadas do produto (opcional).
     */
    constructor(id, clienteId, produtoId, quantidade, produtoInfo = null) {
        this.id = id;
        this.clienteId = clienteId;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.produtoInfo = produtoInfo; // Para carregar nome, preço, etc.
    }
}

module.exports = CarteiraItem;