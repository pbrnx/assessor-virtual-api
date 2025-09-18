// src/repositories/produtoInvestimento.repository.js
const { execute } = require('../config/database');
const ProdutoInvestimento = require('../models/produtoInvestimento.model');

class ProdutoInvestimentoRepository {

    async findAll() {
        const sql = `SELECT id, nome, tipo, risco FROM investimento_produto`;
        const result = await execute(sql);
        return result.rows.map(row => new ProdutoInvestimento(row.ID, row.NOME, row.TIPO, row.RISCO));
    }
}

module.exports = new ProdutoInvestimentoRepository();