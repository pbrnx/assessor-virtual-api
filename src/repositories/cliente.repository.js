// src/repositories/cliente.repository.js
const oracledb = require('oracledb');
const { execute } = require('../config/database');
const Cliente = require('../models/cliente.model');

class ClienteRepository {

    async create(clienteData) {
        const sql = `INSERT INTO investimento_cliente (nome, email) 
                     VALUES (:nome, :email) 
                     RETURNING id INTO :id`;
        
        const binds = {
            nome: clienteData.nome,
            email: clienteData.email,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await execute(sql, binds, { autoCommit: true });
        const id = result.outBinds.id[0];
        
        return new Cliente(id, clienteData.nome, clienteData.email);
    }

    async findById(id) {
        const sql = `SELECT id, nome, email, perfil_id FROM investimento_cliente WHERE id = :id`;
        const result = await execute(sql, [parseInt(id, 10)]);
        
        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return new Cliente(row.ID, row.NOME, row.EMAIL, row.PERFIL_ID);
    }

    async findAll() {
        const sql = `SELECT id, nome, email, perfil_id FROM investimento_cliente`;
        const result = await execute(sql);
        return result.rows.map(row => new Cliente(row.ID, row.NOME, row.EMAIL, row.PERFIL_ID));
    }

    async findByEmail(email) {
        const sql = `SELECT id, nome, email, perfil_id FROM investimento_cliente WHERE email = :email`;
        const result = await execute(sql, [email]);
        
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
        return new Cliente(row.ID, row.NOME, row.EMAIL, row.PERFIL_ID);
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
        
        return new Cliente(parseInt(id, 10), clienteData.nome, clienteData.email);
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
}

module.exports = new ClienteRepository();