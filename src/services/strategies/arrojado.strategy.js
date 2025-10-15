// src/services/strategies/arrojado.strategy.js
const PerfilInvestidor = require('../../models/perfilInvestidor.model');
const ProdutoInvestimento = require('../../models/produtoInvestimento.model');

/**
 * Estratégia de recomendação para o perfil Arrojado.
 * Foco em produtos de maior risco para potencializar a rentabilidade.
 */
module.exports = {
    perfil: PerfilInvestidor.TIPOS.ARROJADO,
    montarCarteira: (produtosPorRisco) => {
        // Garante que existem produtos suficientes para a recomendação
        if (produtosPorRisco[ProdutoInvestimento.RISCOS.BAIXO].length < 1 || produtosPorRisco[ProdutoInvestimento.RISCOS.MEDIO].length < 1 || produtosPorRisco[ProdutoInvestimento.RISCOS.ALTO].length < 2) {
            throw new Error('Não há produtos suficientes para gerar a carteira arrojada.');
        }

        return [
            { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.BAIXO][0], percentual: 10 },
            { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.MEDIO][0], percentual: 30 },
            { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.ALTO][0], percentual: 40 },
            { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.ALTO][1], percentual: 20 }
        ];
    }
};