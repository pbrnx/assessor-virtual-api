// src/models/perfilInvestidor.model.js

class PerfilInvestidor {
    /**
     * @param {number} id - O ID único do perfil.
     * @param {string} nome - O nome do perfil (ex: 'Conservador', 'Moderado', 'Arrojado').
     * @param {string} descricao - Uma breve descrição das características do perfil.
     */
    constructor(id, nome, descricao) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
    }
}


PerfilInvestidor.TIPOS = {
    CONSERVADOR: 'Conservador',
    MODERADO: 'Moderado',
    ARROJADO: 'Arrojado'
};

module.exports = PerfilInvestidor;