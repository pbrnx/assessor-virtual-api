// src/services/perfil.service.js
const PerfilInvestidor = require('../models/perfilInvestidor.model');
const { execute } = require('../config/database');

class PerfilService {
    // Recebe as dependências no construtor
    constructor(clienteService, clienteRepository) {
        this.clienteService = clienteService;
        this.clienteRepository = clienteRepository;
    }

    async _getPerfisDisponiveis() {
        // Cache simples para evitar múltiplas buscas no BD (opcional, mas bom)
        if (!this.perfisCache) {
            const sql = `SELECT id, nome, descricao FROM investimento_perfil ORDER BY id`; // Ordenar pode ajudar
            const result = await execute(sql);
            this.perfisCache = result.rows.map(row => new PerfilInvestidor(row.ID, row.NOME, row.DESCRICAO));
        }
        return this.perfisCache;
    }

/**
     * Calcula o perfil do investidor com base nas respostas a um questionário mais detalhado.
     * @param {object} respostas - Um objeto contendo as respostas para:
     * idade, situacaoFinanceira, objetivoPrincipal, liquidez, reacaoPerda, conhecimentoMercado
     * @returns {Promise<PerfilInvestidor|null>} O perfil calculado ou null se não encontrado.
     */
    async calcularPerfil(respostas) {
        const perfisDisponiveis = await this._getPerfisDisponiveis(); //
        let pontuacao = 0;

        // 1. Pontuação por Idade (Menos pontos para mais velhos/próximos da aposentadoria)
        const pontuacaoIdade = { 'A': 5, 'B': 5, 'C': 4, 'D': 3, 'E': 2, 'F': 1 };
        pontuacao += pontuacaoIdade[respostas.idade] || 0;

        // 2. Pontuação por Situação Financeira (Mais pontos para quem tem mais folga/patrimônio)
        const pontuacaoSituacao = { 'A': 1, 'B': 3, 'C': 5, 'D': 2 }; // D tem menos pontos pois depende dos rendimentos
        pontuacao += pontuacaoSituacao[respostas.situacaoFinanceira] || 0;

        // 3. Pontuação por Objetivo Principal (Mais pontos para longo prazo e busca por rentabilidade)
        const pontuacaoObjetivo = { 'A': 1, 'B': 2, 'C': 4, 'D': 4, 'E': 5 };
        pontuacao += pontuacaoObjetivo[respostas.objetivoPrincipal] || 0;

        // 4. Pontuação por Necessidade de Liquidez (Menos pontos se precisar do dinheiro logo)
        const pontuacaoLiquidez = { 'A': 1, 'B': 2, 'C': 3 };
        pontuacao += pontuacaoLiquidez[respostas.liquidez] || 0;

        // 5. Pontuação por Reação a Perdas (Mais pontos para quem tolera mais risco)
        const pontuacaoReacao = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
        pontuacao += pontuacaoReacao[respostas.reacaoPerda] || 0;

        // 6. Pontuação por Conhecimento do Mercado (Mais pontos para quem conhece mais)
        const pontuacaoConhecimento = { 'A': 1, 'B': 2, 'C': 4, 'D': 5 };
        pontuacao += pontuacaoConhecimento[respostas.conhecimentoMercado] || 0;

        // Definição das faixas de pontuação (AJUSTE ESTAS FAIXAS CONFORME NECESSÁRIO)
        const PONTO_CORTE_CONSERVADOR = 12; // Ex: Até 12 pontos = Conservador
        const PONTO_CORTE_MODERADO = 20;    // Ex: De 13 a 20 pontos = Moderado
                                            // Ex: Acima de 20 = Arrojado

        console.log(`Pontuação final do perfil: ${pontuacao}`); // Log para debug

        // --- CORREÇÃO NA COMPARAÇÃO ---
        // Usar trim() e toLowerCase() para tornar a comparação robusta
        const NOME_CONSERVADOR = PerfilInvestidor.TIPOS.CONSERVADOR.toLowerCase(); //
        const NOME_MODERADO = PerfilInvestidor.TIPOS.MODERADO.toLowerCase(); //
        const NOME_ARROJADO = PerfilInvestidor.TIPOS.ARROJADO.toLowerCase(); //

        let perfilEncontrado = null;

        if (!perfisDisponiveis || perfisDisponiveis.length === 0) {
             console.error('ERRO: Nenhum perfil disponível foi carregado do banco de dados ou cache.');
             return null; // Retorna null se não houver perfis para comparar
        }


        if (pontuacao <= PONTO_CORTE_CONSERVADOR) {
            perfilEncontrado = perfisDisponiveis.find(p => p.nome && p.nome.trim().toLowerCase() === NOME_CONSERVADOR);
        } else if (pontuacao <= PONTO_CORTE_MODERADO) {
            perfilEncontrado = perfisDisponiveis.find(p => p.nome && p.nome.trim().toLowerCase() === NOME_MODERADO);
        } else {
            perfilEncontrado = perfisDisponiveis.find(p => p.nome && p.nome.trim().toLowerCase() === NOME_ARROJADO);
        }

        // Log adicional para debug se não encontrar
        if (!perfilEncontrado) {
             console.error('ERRO: Nenhum perfil correspondente encontrado para a pontuação. Verifique se os nomes no BD ("investimento_perfil") correspondem exatamente a "Conservador", "Moderado", "Arrojado" (ignorando maiúsculas/minúsculas e espaços).', {
                 pontuacao,
                 perfisNoBanco: perfisDisponiveis.map(p => p.nome) // Mostra os nomes como vieram do BD/cache
             });
        }

        return perfilEncontrado; // Retorna o perfil encontrado ou null
        // -----------------------------
    }

    async definirPerfilParaCliente(clienteId, respostas) {
        // 1. Garante que o cliente existe (usa a dependência injetada)
        await this.clienteService.getClienteById(clienteId);

        // 2. Valida se todas as respostas necessárias foram enviadas
        const camposObrigatorios = ['idade', 'situacaoFinanceira', 'objetivoPrincipal', 'liquidez', 'reacaoPerda', 'conhecimentoMercado'];
        for (const campo of camposObrigatorios) {
            if (!respostas[campo]) {
                throw new Error(`A resposta para "${campo}" é obrigatória.`);
            }
        }

        // 3. Calcula o novo perfil usando a lógica atualizada
        const perfilCalculado = await this.calcularPerfil(respostas);
        if (!perfilCalculado) {
            // Este erro não deveria acontecer se as faixas cobrirem todos os pontos, mas é bom ter
            throw new Error('Não foi possível calcular o perfil com as respostas fornecidas.');
        }

        // 4. Atualiza o cliente com o ID do novo perfil
        await this.clienteRepository.updatePerfil(clienteId, perfilCalculado.id); //

        console.log(`Perfil do cliente ${clienteId} atualizado para: ${perfilCalculado.nome}`);
        return perfilCalculado;
    }
}

// Exporta a CLASSE
module.exports = PerfilService;