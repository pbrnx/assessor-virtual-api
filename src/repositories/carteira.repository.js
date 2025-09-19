// src/repositories/carteira.repository.js
const { execute } = require('../config/database');
const oracledb = require('oracledb');
const CarteiraItem = require('../models/carteira.model');

class CarteiraRepository {

    /**
     * Busca todos os itens da carteira de um cliente, juntando com os dados do produto.
     * @param {number} clienteId - O ID do cliente.
     * @returns {Promise<CarteiraItem[]>}
     */
    async findByClienteId(clienteId) {
        const sql = `
            SELECT
                c.id, c.cliente_id, c.produto_id, c.quantidade,
                p.nome, p.tipo, p.risco, p.preco
            FROM investimento_carteira c
            JOIN investimento_produto p ON c.produto_id = p.id
            WHERE c.cliente_id = :clienteId
        `;
        const result = await execute(sql, [clienteId]);

        return result.rows.map(row => {
            const produtoInfo = {
                id: row.PRODUTO_ID,
                nome: row.NOME,
                tipo: row.TIPO,
                risco: row.RISCO,
                preco: row.PRECO
            };
            return new CarteiraItem(row.ID, row.CLIENTE_ID, row.PRODUTO_ID, row.QUANTIDADE, produtoInfo);
        });
    }
    
    /**
     * Busca um item específico na carteira de um cliente.
     * @param {number} clienteId - O ID do cliente.
     * @param {number} produtoId - O ID do produto.
     * @returns {Promise<CarteiraItem|null>}
     */
    async findByClienteAndProduto(clienteId, produtoId) {
        const sql = `SELECT id, cliente_id, produto_id, quantidade 
                     FROM investimento_carteira 
                     WHERE cliente_id = :clienteId AND produto_id = :produtoId`;
        const result = await execute(sql, [clienteId, produtoId]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return new CarteiraItem(row.ID, row.CLIENTE_ID, row.PRODUTO_ID, row.QUANTIDADE);
    }
    
    /**
     * Adiciona um novo produto à carteira de um cliente.
     * @param {number} clienteId
     * @param {number} produtoId
     * @param {number} quantidade
     * @returns {Promise<CarteiraItem>}
     */
    async create(clienteId, produtoId, quantidade) {
        const sql = `INSERT INTO investimento_carteira (cliente_id, produto_id, quantidade)
                     VALUES (:clienteId, :produtoId, :quantidade)
                     RETURNING id INTO :id`;
        
        const binds = {
            clienteId,
            produtoId,
            quantidade,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await execute(sql, binds, { autoCommit: true });
        const id = result.outBinds.id[0];
        return new CarteiraItem(id, clienteId, produtoId, quantidade);
    }

    /**
     * Atualiza a quantidade de um produto existente na carteira.
     * @param {number} carteiraItemId
     * @param {number} novaQuantidade
     */
    async updateQuantidade(carteiraItemId, novaQuantidade) {
        const sql = `UPDATE investimento_carteira SET quantidade = :novaQuantidade WHERE id = :id`;
        await execute(sql, [novaQuantidade, carteiraItemId], { autoCommit: true });
    }
    
    /**
     * Remove um item da carteira pelo seu ID.
     * @param {number} carteiraItemId
     */
    async deleteById(carteiraItemId) {
        const sql = `DELETE FROM investimento_carteira WHERE id = :id`;
        await execute(sql, [carteiraItemId], { autoCommit: true });
    }

}

module.exports = new CarteiraRepository();