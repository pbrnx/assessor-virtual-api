// src/dtos/carteira.dto.js

/**
 * DTO para a requisição de compra de um ativo.
 */
class CompraRequestDTO {
    constructor(body) {
        this.produtoId = body.produtoId;
        this.valor = body.valor; // <-- MUDANÇA: de 'quantidade' para 'valor'
    }
}

/**
 * DTO para a requisição de venda de um ativo.
 */
class VendaRequestDTO {
    constructor(body) {
        this.produtoId = body.produtoId;
        this.quantidade = body.quantidade;
    }
}

/**
 * DTO para representar um item individual na resposta da carteira.
 */
class CarteiraItemResponseDTO {
    constructor(carteiraItemModel) {
        this.produtoId = carteiraItemModel.produtoId;
        this.nome = carteiraItemModel.produtoInfo.nome;
        this.tipo = carteiraItemModel.produtoInfo.tipo;
        this.risco = carteiraItemModel.produtoInfo.risco;
        this.precoUnitario = carteiraItemModel.produtoInfo.preco;
        this.quantidade = carteiraItemModel.quantidade;
        this.valorTotal = carteiraItemModel.produtoInfo.preco * carteiraItemModel.quantidade;
    }
}

/**
 * DTO para a resposta completa da carteira de um cliente.
 */
class CarteiraResponseDTO {
    constructor(carteiraItens) {
        // Mapeia cada item do modelo para o seu DTO correspondente
        this.ativos = carteiraItens.map(item => new CarteiraItemResponseDTO(item));
        // Calcula o valor total investido na carteira
        this.valorTotalInvestido = this.ativos.reduce((total, ativo) => total + ativo.valorTotal, 0);
    }
}


module.exports = {
    CompraRequestDTO,
    VendaRequestDTO,
    CarteiraResponseDTO
};