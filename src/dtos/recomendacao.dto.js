// src/dtos/recomendacao.dto.js

/**
 * DTO que representa um único produto de investimento dentro da carteira recomendada.
 */
class ProdutoRecomendadoDTO {
    constructor(produtoModel, percentual) {
        this.nome = produtoModel.nome;
        this.tipo = produtoModel.tipo;
        this.risco = produtoModel.risco;
        this.percentualAlocacao = percentual; // Ex: 40%
    }
}

/**
 * DTO para a resposta final da API de recomendação.
 * Agrupa o perfil do cliente e a lista de produtos recomendados.
 */
class RecomendacaoResponseDTO {
    constructor(perfilCliente, carteira) {
        this.perfilInvestidor = perfilCliente.nome;
        this.descricaoPerfil = perfilCliente.descricao;
        this.carteiraRecomendada = carteira.map(item =>
            new ProdutoRecomendadoDTO(item.produto, item.percentual)
        );
    }
}

module.exports = {
    ProdutoRecomendadoDTO,
    RecomendacaoResponseDTO
};