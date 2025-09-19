// src/dtos/perfil.dto.js

/**
 * DTO para receber as respostas do questionário de perfil de investidor.
 */
class PerfilRequestDTO {
    constructor(respostas) {
        // 'respostas' seria um objeto com as respostas do cliente
        // Ex: { toleranciaRisco: 'A', objetivo: 'C', conhecimento: 'B' }
        this.respostas = respostas;
    }
}

/**
 * DTO para a resposta da API após definir o perfil do cliente.
 */
class PerfilResponseDTO {
    constructor(perfilModel) {
        this.id = perfilModel.id;
        this.nome = perfilModel.nome;
        this.descricao = perfilModel.descricao;
    }
}

module.exports = {
    PerfilRequestDTO,
    PerfilResponseDTO
};