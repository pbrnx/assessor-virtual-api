// src/dtos/cliente.dto.js

/**
 * DTO para a criação de um novo cliente.
 * Define os dados que a API espera receber no corpo da requisição.
 */
class ClienteRequestDTO {
    constructor(nome, email) {
        this.nome = nome;
        this.email = email;
    }
}

/**
 * DTO para a resposta da API ao lidar com clientes.
 * Filtra e formata os dados do modelo antes de enviá-los ao consumidor da API.
 */
class ClienteResponseDTO {
    constructor(clienteModel) {
        this.id = clienteModel.id;
        this.nome = clienteModel.nome;
        this.email = clienteModel.email;
        this.saldo = clienteModel.saldo; // Inclui o saldo na resposta
        this.perfilId = clienteModel.perfilId;
    }
}

/**
 * DTO para a requisição de depósito.
 */
class DepositoRequestDTO {
    constructor(body) {
        this.valor = body.valor;
    }
}


module.exports = {
    ClienteRequestDTO,
    ClienteResponseDTO,
    DepositoRequestDTO
};