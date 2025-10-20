// src/repositories/cliente.repository.js
const oracledb = require('oracledb');
const { execute } = require('../config/database');
const Cliente = require('../models/cliente.model');

class ClienteRepository {

    async create(clienteData) {
        const sql = `INSERT INTO investimento_cliente (nome, email, senha) 
                     VALUES (:nome, :email, :senha) 
                     RETURNING id, saldo, email_verificado INTO :id, :saldo, :emailVerificado`;
        
        const binds = {
            nome: clienteData.nome,
            email: clienteData.email,
            senha: clienteData.senha,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            saldo: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            emailVerificado: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await execute(sql, binds, { autoCommit: true });
        const id = result.outBinds.id[0];
        const saldo = result.outBinds.saldo[0];
        const emailVerificado = result.outBinds.emailVerificado[0] === 1;
        
        return new Cliente(id, clienteData.nome, clienteData.email, null, emailVerificado, saldo);
    }

    async findById(id) {
        const sql = `SELECT id, nome, email, saldo, perfil_id, email_verificado FROM investimento_cliente WHERE id = :id`;
        const result = await execute(sql, [parseInt(id, 10)]);
        
        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return new Cliente(row.ID, row.NOME, row.EMAIL, null, row.EMAIL_VERIFICADO === 1, row.SALDO, row.PERFIL_ID);
    }

    async findAll() {
        const sql = `SELECT id, nome, email, saldo, perfil_id, email_verificado FROM investimento_cliente`;
        const result = await execute(sql);
        return result.rows.map(row => new Cliente(row.ID, row.NOME, row.EMAIL, null, row.EMAIL_VERIFICADO === 1, row.SALDO, row.PERFIL_ID));
    }

    async findByEmail(email) {
        const sql = `SELECT id, nome, email, senha, saldo, perfil_id, email_verificado, 
                     email_verification_token, email_verification_token_expires,
                     reset_password_token, reset_password_token_expires, 
                     refresh_token, refresh_token_expires
                     FROM investimento_cliente WHERE email = :email`;
        const result = await execute(sql, [email]);
        
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
        return new Cliente(
            row.ID, 
            row.NOME, 
            row.EMAIL, 
            row.SENHA, 
            row.EMAIL_VERIFICADO === 1, 
            row.SALDO, 
            row.PERFIL_ID,
            row.EMAIL_VERIFICATION_TOKEN,
            row.EMAIL_VERIFICATION_TOKEN_EXPIRES,
            row.RESET_PASSWORD_TOKEN,
            row.RESET_PASSWORD_TOKEN_EXPIRES,
            row.REFRESH_TOKEN,
            row.REFRESH_TOKEN_EXPIRES
        );
    }

    async update(id, clienteData) {
        const sql = `UPDATE investimento_cliente
                     SET nome = :nome, email = :email
                     WHERE id = :id`;
        
        const binds = {
            nome: clienteData.nome,
            email: clienteData.email,
            id: parseInt(id, 10)
        };

        await execute(sql, binds, { autoCommit: true });
        return await this.findById(id);
    }

    async delete(id) {
        const sql = `DELETE FROM investimento_cliente WHERE id = :id`;
        const result = await execute(sql, [parseInt(id, 10)], { autoCommit: true });
        return result.rowsAffected;
    }

    async updatePerfil(clienteId, perfilId) {
        const sql = `UPDATE investimento_cliente SET perfil_id = :perfilId WHERE id = :clienteId`;
        await execute(sql, [perfilId, clienteId], { autoCommit: true });
    }

    async updateSaldo(clienteId, novoSaldo) {
        const sql = `UPDATE investimento_cliente SET saldo = :novoSaldo WHERE id = :clienteId`;
        await execute(sql, [novoSaldo, clienteId], { autoCommit: true });
    }

    async updateSenha(clienteId, novaSenha) {
        const sql = `UPDATE investimento_cliente SET senha = :novaSenha WHERE id = :clienteId`;
        await execute(sql, [novaSenha, clienteId], { autoCommit: true });
    }

    /**
     * Marca o e-mail de um cliente como verificado.
     * @param {number} clienteId - O ID do cliente.
     */
    async updateEmailVerificado(clienteId) {
        const sql = `UPDATE investimento_cliente 
                     SET email_verificado = 1, 
                         email_verification_token = NULL, 
                         email_verification_token_expires = NULL 
                     WHERE id = :clienteId`;
        await execute(sql, [clienteId], { autoCommit: true });
    }

    /**
     * Define o token de verificação de email (hash) para um cliente.
     * @param {number} clienteId - O ID do cliente.
     * @param {string} tokenHash - Hash SHA-256 do token de verificação.
     * @param {Date} expiresAt - Data de expiração do token.
     */
    async setEmailVerificationToken(clienteId, tokenHash, expiresAt) {
        const sql = `UPDATE investimento_cliente 
                     SET email_verification_token = :tokenHash, 
                         email_verification_token_expires = :expiresAt 
                     WHERE id = :clienteId`;
        await execute(sql, [tokenHash, expiresAt, clienteId], { autoCommit: true });
    }

    /**
     * Busca um cliente pelo token de verificação de email (hash).
     * @param {string} tokenHash - Hash SHA-256 do token.
     * @returns {Cliente|null} Cliente encontrado ou null.
     */
    async findByEmailVerificationToken(tokenHash) {
        const sql = `SELECT id, nome, email, senha, saldo, perfil_id, email_verificado,
                     email_verification_token, email_verification_token_expires,
                     reset_password_token, reset_password_token_expires, 
                     refresh_token, refresh_token_expires
                     FROM investimento_cliente 
                     WHERE email_verification_token = :tokenHash
                     AND email_verification_token_expires > SYSTIMESTAMP`;
        const result = await execute(sql, [tokenHash]);
        
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
        return new Cliente(
            row.ID, row.NOME, row.EMAIL, row.SENHA, 
            row.EMAIL_VERIFICADO === 1, row.SALDO, row.PERFIL_ID,
            row.EMAIL_VERIFICATION_TOKEN, row.EMAIL_VERIFICATION_TOKEN_EXPIRES,
            row.RESET_PASSWORD_TOKEN, row.RESET_PASSWORD_TOKEN_EXPIRES,
            row.REFRESH_TOKEN, row.REFRESH_TOKEN_EXPIRES
        );
    }

    /**
     * Define o token de reset de senha (hash) para um cliente.
     * @param {number} clienteId - O ID do cliente.
     * @param {string} tokenHash - Hash SHA-256 do token de reset.
     * @param {Date} expiresAt - Data de expiração do token.
     */
    async setResetPasswordToken(clienteId, tokenHash, expiresAt) {
        const sql = `UPDATE investimento_cliente 
                     SET reset_password_token = :tokenHash, 
                         reset_password_token_expires = :expiresAt 
                     WHERE id = :clienteId`;
        await execute(sql, [tokenHash, expiresAt, clienteId], { autoCommit: true });
    }

    /**
     * Busca um cliente pelo token de reset de senha (hash).
     * @param {string} tokenHash - Hash SHA-256 do token.
     * @returns {Cliente|null} Cliente encontrado ou null.
     */
    async findByResetPasswordToken(tokenHash) {
        const sql = `SELECT id, nome, email, senha, saldo, perfil_id, email_verificado,
                     email_verification_token, email_verification_token_expires,
                     reset_password_token, reset_password_token_expires, 
                     refresh_token, refresh_token_expires
                     FROM investimento_cliente 
                     WHERE reset_password_token = :tokenHash
                     AND reset_password_token_expires > SYSTIMESTAMP`;
        const result = await execute(sql, [tokenHash]);
        
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
        return new Cliente(
            row.ID, row.NOME, row.EMAIL, row.SENHA, 
            row.EMAIL_VERIFICADO === 1, row.SALDO, row.PERFIL_ID,
            row.EMAIL_VERIFICATION_TOKEN, row.EMAIL_VERIFICATION_TOKEN_EXPIRES,
            row.RESET_PASSWORD_TOKEN, row.RESET_PASSWORD_TOKEN_EXPIRES,
            row.REFRESH_TOKEN, row.REFRESH_TOKEN_EXPIRES
        );
    }

    /**
     * Limpa o token de reset de senha de um cliente.
     * @param {number} clienteId - O ID do cliente.
     */
    async clearResetPasswordToken(clienteId) {
        const sql = `UPDATE investimento_cliente 
                     SET reset_password_token = NULL, 
                         reset_password_token_expires = NULL 
                     WHERE id = :clienteId`;
        await execute(sql, [clienteId], { autoCommit: true });
    }

    /**
     * Define o refresh token (hash) para um cliente.
     * @param {number} clienteId - O ID do cliente.
     * @param {string} tokenHash - Hash SHA-256 do refresh token.
     * @param {Date} expiresAt - Data de expiração do refresh token.
     */
    async setRefreshToken(clienteId, tokenHash, expiresAt) {
        const sql = `UPDATE investimento_cliente 
                     SET refresh_token = :tokenHash,
                         refresh_token_expires = :expiresAt 
                     WHERE id = :clienteId`;
        await execute(sql, [tokenHash, expiresAt, clienteId], { autoCommit: true });
    }

    /**
     * Busca um cliente pelo refresh token (hash).
     * @param {string} tokenHash - Hash SHA-256 do refresh token.
     * @returns {Cliente|null} Cliente encontrado ou null.
     */
    async findByRefreshToken(tokenHash) {
        const sql = `SELECT id, nome, email, senha, saldo, perfil_id, email_verificado,
                     email_verification_token, email_verification_token_expires,
                     reset_password_token, reset_password_token_expires, 
                     refresh_token, refresh_token_expires
                     FROM investimento_cliente 
                     WHERE refresh_token = :tokenHash
                     AND refresh_token_expires > SYSTIMESTAMP`;
        const result = await execute(sql, [tokenHash]);
        
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
        return new Cliente(
            row.ID, row.NOME, row.EMAIL, row.SENHA, 
            row.EMAIL_VERIFICADO === 1, row.SALDO, row.PERFIL_ID,
            row.EMAIL_VERIFICATION_TOKEN, row.EMAIL_VERIFICATION_TOKEN_EXPIRES,
            row.RESET_PASSWORD_TOKEN, row.RESET_PASSWORD_TOKEN_EXPIRES,
            row.REFRESH_TOKEN, row.REFRESH_TOKEN_EXPIRES
        );
    }

    /**
     * Revoga o refresh token de um cliente.
     * @param {number} clienteId - O ID do cliente.
     */
    async revokeRefreshToken(clienteId) {
        const sql = `UPDATE investimento_cliente 
                     SET refresh_token = NULL,
                         refresh_token_expires = NULL 
                     WHERE id = :clienteId`;
        await execute(sql, [clienteId], { autoCommit: true });
    }
}

module.exports = new ClienteRepository();