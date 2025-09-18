// src/models/cliente.model.js

class Cliente {
    /**
     * @param {number} id - O ID único do cliente.
     * @param {string} nome - O nome completo do cliente.
     * @param {string} email - O email do cliente, usado para comunicação.
     * @param {number | null} perfilId - O ID do perfil de investidor associado. Nulo se ainda não definido.
     */
    constructor(id, nome, email, perfilId = null) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.perfilId = perfilId;
    }
}

module.exports = Cliente;