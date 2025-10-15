// src/dtos/auth.dto.js

/**
 * DTO para a requisição de registro de um novo cliente.
 */
class RegisterRequestDTO {
    constructor(body) {
        this.nome = body.nome;
        this.email = body.email;
        this.senha = body.senha;
    }
}

/**
 * DTO para a requisição de login.
 */
class LoginRequestDTO {
    constructor(body) {
        this.email = body.email;
        this.senha = body.senha;
    }
}

module.exports = {
    RegisterRequestDTO,
    LoginRequestDTO
};