// src/dtos/produtoInvestimento.dto.js

/**
 * DTO para a criação ou atualização de um produto de investimento.
 */
class ProdutoInvestimentoDTO {
    constructor(produto) {
        this.nome = produto.nome;
        this.tipo = produto.tipo;
        this.risco = produto.risco; // Ex: 'Baixo', 'Médio', 'Alto'
    }
}

module.exports = ProdutoInvestimentoDTO;