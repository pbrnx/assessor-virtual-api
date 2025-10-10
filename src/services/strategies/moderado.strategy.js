// src/services/strategies/moderado.strategy.js
const PerfilInvestidor = require('../../models/perfilInvestidor.model');
const ProdutoInvestimento = require('../../models/produtoInvestimento.model');

/**
 * Estratégia de recomendação para o perfil Moderado.
 * Busca um equilíbrio entre diferentes níveis de risco.
 */
module.exports = {
    perfil: PerfilInvestidor.TIPOS.MODERADO,
    montarCarteira: (produtosPorRisco) => {
         // Garante que existem produtos suficientes para a recomendação
        if (produtosPorRisco[ProdutoInvestimento.RISCOS.BAIXO].length < 1 || produtosPorRisco[ProdutoInvestimento.RISCOS.MEDIO].length < 2 || produtosPorRisco[ProdutoInvestimento.RISCOS.ALTO].length < 1) {
            throw new Error('Não há produtos suficientes para gerar a carteira moderada.');
        }

        return [
            { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.BAIXO][0], percentual: 30 },
            { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.MEDIO][0], percentual: 40 },
            { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.MEDIO][1], percentual: 20 },
            { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.ALTO][0], percentual: 10 }
        ];
    }
};