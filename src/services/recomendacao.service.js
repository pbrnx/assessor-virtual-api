// src/services/recomendacao.service.js
const clienteService = require('./cliente.service');
const produtoInvestimentoRepository = require('../repositories/produtoInvestimento.repository');
const PerfilInvestidor = require('../models/perfilInvestidor.model');
const ProdutoInvestimento = require('../models/produtoInvestimento.model');
const carteiraService = require('./carteira.service');

// Importa as estratégias
const conservadorStrategy = require('./strategies/conservador.strategy');
// --- CORREÇÃO AQUI ---
const moderadoStrategy = require('./strategies/moderado.strategy');
const arrojadoStrategy = require('./strategies/arrojado.strategy');
// ---------------------

// Mapeia o nome do perfil para a sua estratégia correspondente
const strategies = {
    [conservadorStrategy.perfil]: conservadorStrategy,
    [moderadoStrategy.perfil]: moderadoStrategy,
    [arrojadoStrategy.perfil]: arrojadoStrategy
};

// Perfis simulados
const perfis = {
    1: new PerfilInvestidor(1, PerfilInvestidor.TIPOS.CONSERVADOR, 'Prefere segurança e baixa volatilidade.'),
    2: new PerfilInvestidor(2, PerfilInvestidor.TIPOS.MODERADO, 'Busca um equilíbrio entre segurança e rentabilidade.'),
    3: new PerfilInvestidor(3, PerfilInvestidor.TIPOS.ARROJADO, 'Tolera altos riscos em busca de maior rentabilidade.')
};

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

class RecomendacaoService {
    constructor(clienteService) {
        this.clienteService = clienteService;
    }

    async gerarRecomendacao(clienteId) {
        const cliente = await this.clienteService.getClienteById(clienteId);
        if (!cliente.perfilId) {
            throw new Error('O perfil de investidor do cliente ainda não foi definido.');
        }
        const perfilCliente = perfis[cliente.perfilId];
        const todosProdutos = await produtoInvestimentoRepository.findAll();
        const produtosPorRisco = {
            [ProdutoInvestimento.RISCOS.BAIXO]: shuffle(todosProdutos.filter(p => p.risco === ProdutoInvestimento.RISCOS.BAIXO) || []),
            [ProdutoInvestimento.RISCOS.MEDIO]: shuffle(todosProdutos.filter(p => p.risco === ProdutoInvestimento.RISCOS.MEDIO) || []),
            [ProdutoInvestimento.RISCOS.ALTO]: shuffle(todosProdutos.filter(p => p.risco === ProdutoInvestimento.RISCOS.ALTO) || [])
        };
        const strategy = strategies[perfilCliente.nome];
        if (!strategy) {
            throw new Error(`Estratégia para o perfil de investidor "${perfilCliente.nome}" não encontrada.`);
        }
        let carteira = strategy.montarCarteira(produtosPorRisco);
        carteira = carteira.filter(item => item.produto);
        return { perfilCliente, carteira };
    }

    async investirRecomendacao(clienteId, carteiraRecomendada) {
        const cliente = await this.clienteService.getClienteById(clienteId);
        if (!cliente.saldo || cliente.saldo <= 0) {
            throw new Error('Saldo insuficiente para investir.');
        }
        if (!carteiraRecomendada || carteiraRecomendada.length === 0) {
            throw new Error('A carteira recomendada para investir está vazia.');
        }

        const saldoTotalEmCentavos = Math.round(cliente.saldo * 100);
        let centavosAlocados = 0;

        const alocacoes = carteiraRecomendada.map(item => {
            const alocacaoExata = saldoTotalEmCentavos * (item.percentualAlocacao / 100);
            const alocacaoEmCentavos = Math.floor(alocacaoExata);
            centavosAlocados += alocacaoEmCentavos;
            return {
                produtoId: item.produtoId,
                valorEmCentavos: alocacaoEmCentavos,
                percentual: item.percentualAlocacao
            };
        });

        let centavosRestantes = saldoTotalEmCentavos - centavosAlocados;
        if (centavosRestantes > 0) {
            alocacoes.sort((a, b) => b.percentual - a.percentual);
            alocacoes[0].valorEmCentavos += centavosRestantes;
        }

        for (const alocacao of alocacoes) {
            const valorFinalParaComprar = alocacao.valorEmCentavos / 100;

            if (valorFinalParaComprar < 0.01) {
                continue;
            }

            try {
                await carteiraService.comprarAtivo(clienteId, alocacao.produtoId, valorFinalParaComprar);
                console.log(`Investido ${valorFinalParaComprar.toFixed(2)} no produto ${alocacao.produtoId} para o cliente ${clienteId}`);
            } catch (error) {
                console.error(`Falha crítica ao investir no produto ${alocacao.produtoId}: ${error.message}`);
            }
        }

        return await carteiraService.getCarteiraByClienteId(clienteId);
    }
}

module.exports = RecomendacaoService;