// src/models/cliente.model.js

class Cliente {
    /**
     * @param {number} id - O ID único do cliente.
     * @param {string} nome - O nome completo do cliente.
     * @param {string} email - O email do cliente, usado para comunicação.
     * @param {string} senha - A senha criptografada do cliente.
     * @param {boolean} emailVerificado - Se o e-mail do cliente foi verificado.
     * @param {number} saldo - O saldo monetário disponível na conta do cliente.
     * @param {number | null} perfilId - O ID do perfil de investidor associado. Nulo se ainda não definido.
     * @param {string | null} emailVerificationToken - Hash SHA-256 do token de verificação de email.
     * @param {Date | null} emailVerificationTokenExpires - Data de expiração do token de verificação.
     * @param {string | null} resetPasswordToken - Hash SHA-256 do token de reset de senha.
     * @param {Date | null} resetPasswordTokenExpires - Data de expiração do token de reset.
     * @param {string | null} refreshToken - Hash SHA-256 do refresh token.
     * @param {Date | null} refreshTokenExpires - Data de expiração do refresh token.
     */
    constructor(
        id, 
        nome, 
        email, 
        senha, 
        emailVerificado = false, 
        saldo = 0, 
        perfilId = null,
        emailVerificationToken = null,
        emailVerificationTokenExpires = null,
        resetPasswordToken = null,
        resetPasswordTokenExpires = null,
        refreshToken = null,
        refreshTokenExpires = null
    ) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.emailVerificado = emailVerificado;
        this.saldo = saldo;
        this.perfilId = perfilId;
        this.emailVerificationToken = emailVerificationToken;
        this.emailVerificationTokenExpires = emailVerificationTokenExpires;
        this.resetPasswordToken = resetPasswordToken;
        this.resetPasswordTokenExpires = resetPasswordTokenExpires;
        this.refreshToken = refreshToken;
        this.refreshTokenExpires = refreshTokenExpires;
    }
}

module.exports = Cliente;   