// src/dtos/perfil.dto.js

/**
 * DTO para receber as respostas do questionário de perfil de investidor.
 * Exemplo: o questionário pode ter 3 perguntas.
 */
class PerfilRequestDTO {
    constructor(respostas) {
        // 'respostas' seria um objeto ou array com as respostas do cliente
        // Ex: { pergunta1: 'A', pergunta2: 'C', pergunta3: 'B' }
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