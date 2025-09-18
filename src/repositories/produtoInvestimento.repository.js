// src/repositories/produtoInvestimento.repository.js
const oracledb = require('oracledb');
const { execute } = require('../config/database');
const ProdutoInvestimento = require('../models/produtoInvestimento.model');

class ProdutoInvestimentoRepository {

    async create(produtoData) {
        const sql = `INSERT INTO investimento_produto (nome, tipo, risco)
                     VALUES (:nome, :tipo, :risco)
                     RETURNING id INTO :id`;
        
        const binds = {
            nome: produtoData.nome,
            tipo: produtoData.tipo,
            risco: produtoData.risco,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await execute(sql, binds, { autoCommit: true });
        const id = result.outBinds.id[0];
        
        return new ProdutoInvestimento(id, produtoData.nome, produtoData.tipo, produtoData.risco);
    }

    async findAll() {
        const sql = `SELECT id, nome, tipo, risco FROM investimento_produto`;
        const result = await execute(sql);
        return result.rows.map(row => new ProdutoInvestimento(row.ID, row.NOME, row.TIPO, row.RISCO));
    }
    
    async findById(id) {
        const sql = `SELECT id, nome, tipo, risco FROM investimento_produto WHERE id = :id`;
        const result = await execute(sql, [id]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return new ProdutoInvestimento(row.ID, row.NOME, row.TIPO, row.RISCO);
    }

    async update(id, produtoData) {
        const sql = `UPDATE investimento_produto
                     SET nome = :nome, tipo = :tipo, risco = :risco
                     WHERE id = :id`;
        
        const binds = { ...produtoData, id };
        await execute(sql, binds, { autoCommit: true });
        return new ProdutoInvestimento(id, produtoData.nome, produtoData.tipo, produtoData.risco);
    }

    async delete(id) {
        const sql = `DELETE FROM investimento_produto WHERE id = :id`;
        const result = await execute(sql, [id], { autoCommit: true });
        return result.rowsAffected;
    }
}

module.exports = new ProdutoInvestimentoRepository();