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
        const sql = `SELECT id, nome, email, senha, saldo, perfil_id, email_verificado FROM investimento_cliente WHERE email = :email`;
        const result = await execute(sql, [email]);
        
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
        return new Cliente(row.ID, row.NOME, row.EMAIL, row.SENHA, row.EMAIL_VERIFICADO === 1, row.SALDO, row.PERFIL_ID);
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
        const sql = `UPDATE investimento_cliente SET email_verificado = 1 WHERE id = :clienteId`;
        await execute(sql, [clienteId], { autoCommit: true });
    }
}

module.exports = new ClienteRepository();