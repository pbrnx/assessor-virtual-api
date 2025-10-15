// src/repositories/cliente.repository.js
const oracledb = require('oracledb');
const { execute } = require('../config/database');
const Cliente = require('../models/cliente.model');

class ClienteRepository {

    async create(clienteData) {
        // Agora inclui a senha no INSERT
        const sql = `INSERT INTO investimento_cliente (nome, email, senha) 
                     VALUES (:nome, :email, :senha) 
                     RETURNING id, saldo INTO :id, :saldo`;
        
        const binds = {
            nome: clienteData.nome,
            email: clienteData.email,
            senha: clienteData.senha, // <<<< DADO NOVO
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            saldo: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await execute(sql, binds, { autoCommit: true });
        const id = result.outBinds.id[0];
        const saldo = result.outBinds.saldo[0];
        
        // Retorna um novo cliente, mas sem a senha por segurança
        return new Cliente(id, clienteData.nome, clienteData.email, null, saldo);
    }

    async findById(id) {
        // Não vamos retornar a senha aqui por segurança, apenas nos métodos de busca específicos para auth
        const sql = `SELECT id, nome, email, saldo, perfil_id FROM investimento_cliente WHERE id = :id`;
        const result = await execute(sql, [parseInt(id, 10)]);
        
        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return new Cliente(row.ID, row.NOME, row.EMAIL, null, row.SALDO, row.PERFIL_ID);
    }

    async findAll() {
        // Nunca retornar a senha em listagens
        const sql = `SELECT id, nome, email, saldo, perfil_id FROM investimento_cliente`;
        const result = await execute(sql);
        return result.rows.map(row => new Cliente(row.ID, row.NOME, row.EMAIL, null, row.SALDO, row.PERFIL_ID));
    }

    async findByEmail(email) {
        // Este método precisa retornar a senha para o processo de login
        const sql = `SELECT id, nome, email, senha, saldo, perfil_id FROM investimento_cliente WHERE email = :email`;
        const result = await execute(sql, [email]);
        
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
        // Retorna o objeto Cliente completo, incluindo a senha
        return new Cliente(row.ID, row.NOME, row.EMAIL, row.SENHA, row.SALDO, row.PERFIL_ID);
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
}

module.exports = new ClienteRepository();