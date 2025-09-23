// src/services/recomendacao.service.js
const clienteService = require('./cliente.service');
const produtoInvestimentoRepository = require('../repositories/produtoInvestimento.repository');
const PerfilInvestidor = require('../models/perfilInvestidor.model');
const ProdutoInvestimento = require('../models/produtoInvestimento.model');
const carteiraService = require('./carteira.service');

// Simulação dos perfis que estariam no banco
const perfis = {
    1: new PerfilInvestidor(1, PerfilInvestidor.TIPOS.CONSERVADOR, 'Prefere segurança e baixa volatilidade.'),
    2: new PerfilInvestidor(2, PerfilInvestidor.TIPOS.MODERADO, 'Busca um equilíbrio entre segurança e rentabilidade.'),
    3: new PerfilInvestidor(3, PerfilInvestidor.TIPOS.ARROJADO, 'Tolera altos riscos em busca de maior rentabilidade.')
};

// RESTAURADA: Função para embaralhar um array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

class RecomendacaoService {

    async gerarRecomendacao(clienteId) {
        // 1. Busca o cliente e seu perfil
        const cliente = await clienteService.getClienteById(clienteId);
        if (!cliente.perfilId) {
            throw new Error('O perfil de investidor do cliente ainda não foi definido.');
        }
        const perfilCliente = perfis[cliente.perfilId];

        // 2. Busca e categoriza os produtos de investimento disponíveis por risco (com shuffle)
        const todosProdutos = await produtoInvestimentoRepository.findAll();
        const produtosPorRisco = {
            [ProdutoInvestimento.RISCOS.BAIXO]: shuffle(todosProdutos.filter(p => p.risco === ProdutoInvestimento.RISCOS.BAIXO)),
            [ProdutoInvestimento.RISCOS.MEDIO]: shuffle(todosProdutos.filter(p => p.risco === ProdutoInvestimento.RISCOS.MEDIO)),
            [ProdutoInvestimento.RISCOS.ALTO]: shuffle(todosProdutos.filter(p => p.risco === ProdutoInvestimento.RISCOS.ALTO))
        };

        // 3. Aplica a regra de negócio para montar a carteira de forma dinâmica
        let carteira = [];
        switch (perfilCliente.nome) {
            case PerfilInvestidor.TIPOS.CONSERVADOR:
                carteira = [
                    { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.BAIXO][0], percentual: 60 },
                    { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.BAIXO][1], percentual: 25 },
                    { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.MEDIO][0], percentual: 15 }
                ];
                break;
            case PerfilInvestidor.TIPOS.MODERADO:
                carteira = [
                    { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.BAIXO][0], percentual: 30 },
                    { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.MEDIO][0], percentual: 40 },
                    { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.MEDIO][1], percentual: 20 },
                    { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.ALTO][0], percentual: 10 }
                ];
                break;
            case PerfilInvestidor.TIPOS.ARROJADO:
                carteira = [
                    { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.BAIXO][0], percentual: 10 },
                    { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.MEDIO][0], percentual: 30 },
                    { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.ALTO][0], percentual: 40 },
                    { produto: produtosPorRisco[ProdutoInvestimento.RISCOS.ALTO][1], percentual: 20 }
                ];
                break;
            default:
                throw new Error('Perfil de investidor desconhecido.');
        }
        
        carteira = carteira.filter(item => item.produto);

        return { perfilCliente, carteira };
    }

    /**
     * MODIFICADO: Agora recebe a carteira recomendada como parâmetro.
     * @param {number} clienteId
     * @param {Array} carteiraRecomendada - A carteira enviada pelo frontend.
     */
    async investirRecomendacao(clienteId, carteiraRecomendada) {
        // 1. Obter o saldo do cliente
        const cliente = await clienteService.getClienteById(clienteId);
        if (!cliente.saldo || cliente.saldo <= 0) {
            throw new Error('Saldo insuficiente para investir.');
        }
        if (!carteiraRecomendada || carteiraRecomendada.length === 0) {
            throw new Error('A carteira recomendada para investir está vazia.');
        }

        const saldoParaInvestir = cliente.saldo;

        // 2. Itera sobre a recomendação RECEBIDA e compra cada ativo
        for (const item of carteiraRecomendada) {
            // Precisamos do preço atual do produto, então buscamos ele no banco
            const produto = await produtoInvestimentoRepository.findById(item.produtoId);
            if (!produto) {
                 console.warn(`Produto com ID ${item.produtoId} não encontrado. Pulando.`);
                 continue;
            }

            const percentual = item.percentualAlocacao / 100;
            const valorAlocar = saldoParaInvestir * percentual;
            const quantidadeComprar = valorAlocar / produto.preco;
            
            if (quantidadeComprar < 0.0001) {
                continue;
            }

            try {
                await carteiraService.comprarAtivo(clienteId, produto.id, quantidadeComprar);
            } catch (error) {
                console.warn(`Não foi possível comprar ${produto.nome}: ${error.message}`);
                continue;
            }
        }

        // 3. Retorna a carteira final do cliente
        return await carteiraService.getCarteiraByClienteId(clienteId);
    }
}

module.exports = new RecomendacaoService();