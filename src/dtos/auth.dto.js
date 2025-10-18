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

/**
 * DTO para a requisição de refresh token.
 */
class RefreshTokenRequestDTO {
    constructor(body) {
        this.refreshToken = body.refreshToken;
    }
}

/**
 * DTO (opcional) para padronizar a resposta do login/refresh.
 * Filtra os dados sensíveis e estrutura a resposta.
 */
class AuthResponseDTO {
    constructor(authServiceResponse) {
        this.cliente = {
            id: authServiceResponse.cliente.id,
            nome: authServiceResponse.cliente.nome,
            email: authServiceResponse.cliente.email,
        };
        this.accessToken = authServiceResponse.accessToken;
        // Inclui o refreshToken apenas na resposta do login, não do refresh
        if (authServiceResponse.refreshToken) {
            this.refreshToken = authServiceResponse.refreshToken;
        }
        this.role = authServiceResponse.role;
    }
}


module.exports = {
    RegisterRequestDTO,
    LoginRequestDTO,
    RefreshTokenRequestDTO, // Exporta o novo DTO
    AuthResponseDTO       // Exporta o DTO de resposta (opcional)
};