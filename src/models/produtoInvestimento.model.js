// src/models/produtoInvestimento.model.js

class ProdutoInvestimento {
    /**
     * @param {number} id - O ID único do produto.
     * @param {string} nome - O nome do produto (ex: 'Tesouro Selic', 'Fundo de Ações XPTO').
     * @param {string} tipo - A categoria do produto (ex: 'Renda Fixa', 'Ações', 'Fundo Imobiliário').
     * @param {string} risco - O nível de risco associado ao produto (ex: 'Baixo', 'Médio', 'Alto').
     */
    constructor(id, nome, tipo, risco) {
        this.id = id;
        this.nome = nome;
        this.tipo = tipo;
        this.risco = risco;
    }
}

// Também podemos criar constantes para os níveis de risco
ProdutoInvestimento.RISCOS = {
    BAIXO: 'Baixo',
    MEDIO: 'Médio',
    ALTO: 'Alto'
};

module.exports = ProdutoInvestimento;