// src/services/strategies/conservador.strategy.js
const PerfilInvestidor = require('../../models/perfilInvestidor.model');
const ProdutoInvestimento = require('../../models/produtoInvestimento.model');

/**
 * Estratégia de recomendação para o perfil Conservador.
 * Foco em produtos de baixo risco.
 */
module.exports = {
    perfil: PerfilInvestidor.TIPOS.CONSERVADOR,
    montarCarteira: (produtosPorRisco) => {
        // Garante que existem produtos suficientes para a recomendação
        if (produtosPorRisco[ProdutoInvestimento.RISCOS.BAIXO].length < 2 || produtosPorRisco[ProdutoInvestimento.RISCOS.MEDIO].length < 1) {
            throw new Error('Não há produtos suficientes para gerar a carteira conservadora.');
        }

        return [
            { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.BAIXO][0], percentual: 60 },
            { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.BAIXO][1], percentual: 25 },
            { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.MEDIO][0], percentual: 15 }
        ];
    }
};