// src/services/perfil.service.js
const clienteRepository = require('../repositories/cliente.repository');
const clienteService = require('./cliente.service');
const PerfilInvestidor = require('../models/perfilInvestidor.model');
const { execute } = require('../config/database'); // Importar execute para buscar perfis

class PerfilService {

    async _getPerfisDisponiveis() {
        const sql = `SELECT id, nome, descricao FROM investimento_perfil`;
        const result = await execute(sql);
        return result.rows.map(row => new PerfilInvestidor(row.ID, row.NOME, row.DESCRICAO));
    }

    async calcularPerfil(respostas) {
        const perfisDisponiveis = await this._getPerfisDisponiveis();
        const pesos = { 'A': 1, 'B': 2, 'C': 3 };
        
        let pontuacao = 0;
        pontuacao += pesos[respostas.toleranciaRisco] || 0;
        pontuacao += pesos[respostas.objetivo] || 0;
        pontuacao += pesos[respostas.conhecimento] || 0;

        if (pontuacao <= 4) {
            return perfisDisponiveis.find(p => p.nome === PerfilInvestidor.TIPOS.CONSERVADOR);
        } else if (pontuacao <= 7) {
            return perfisDisponiveis.find(p => p.nome === PerfilInvestidor.TIPOS.MODERADO);
        } else {
            return perfisDisponiveis.find(p => p.nome === PerfilInvestidor.TIPOS.ARROJADO);
        }
    }

    async definirPerfilParaCliente(clienteId, respostas) {
        // 1. Garante que o cliente existe (reutiliza o service)
        await clienteService.getClienteById(clienteId);

        // 2. Calcula o novo perfil
        const perfilCalculado = await this.calcularPerfil(respostas);
        if (!perfilCalculado) {
            throw new Error('Não foi possível calcular o perfil com as respostas fornecidas.');
        }

        // 3. Atualiza o cliente com o ID do novo perfil usando o repository
        await clienteRepository.updatePerfil(clienteId, perfilCalculado.id);

        console.log(`Perfil do cliente ${clienteId} atualizado para: ${perfilCalculado.nome}`);

        return perfilCalculado;
    }
}

module.exports = new PerfilService();