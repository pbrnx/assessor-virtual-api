// src/models/cliente.model.js

class Cliente {
    /**
     * @param {number} id - O ID único do cliente.
     * @param {string} nome - O nome completo do cliente.
     * @param {string} email - O email do cliente, usado para comunicação.
     * @param {string} senha - A senha criptografada do cliente. // <<<< ADICIONADO
     * @param {number} saldo - O saldo monetário disponível na conta do cliente.
     * @param {number | null} perfilId - O ID do perfil de investidor associado. Nulo se ainda não definido.
     */
    constructor(id, nome, email, senha, saldo = 0, perfilId = null) { // <<<< PARÂMETRO NOVO
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha; 
        this.saldo = saldo;
        this.perfilId = perfilId;
    }
}

module.exports = Cliente;