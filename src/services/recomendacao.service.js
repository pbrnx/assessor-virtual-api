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

class RecomendacaoService {

    async gerarRecomendacao(clienteId) {
        // 1. Busca o cliente e seu perfil
        const cliente = await clienteService.getClienteById(clienteId);
        if (!cliente.perfilId) {
            throw new Error('O perfil de investidor do cliente ainda não foi definido.');
        }
        const perfilCliente = perfis[cliente.perfilId];

        // 2. Busca os produtos de investimento disponíveis
        const todosProdutos = await produtoInvestimentoRepository.findAll();

        // 3. Aplica a regra de negócio para montar a carteira
        let carteira = [];
        switch (perfilCliente.nome) {
            case PerfilInvestidor.TIPOS.CONSERVADOR:
                carteira = [
                    { produto: todosProdutos.find(p => p.nome === 'Tesouro Selic'), percentual: 70 },
                    { produto: todosProdutos.find(p => p.nome === 'CDB PagSeguro'), percentual: 30 }
                ];
                break;
            case PerfilInvestidor.TIPOS.MODERADO:
                carteira = [
                    { produto: todosProdutos.find(p => p.nome === 'Tesouro Selic'), percentual: 40 },
                    { produto: todosProdutos.find(p => p.nome === 'Fundo Imobiliário HGLG11'), percentual: 40 },
                    { produto: todosProdutos.find(p => p.nome === 'Fundo de Ações Tech'), percentual: 20 }
                ];
                break;
            case PerfilInvestidor.TIPOS.ARROJADO:
                carteira = [
                    { produto: todosProdutos.find(p => p.nome === 'Tesouro Selic'), percentual: 10 },
                    { produto: todosProdutos.find(p => p.nome === 'Fundo de Ações Tech'), percentual: 50 },
                    { produto: todosProdutos.find(p => p.nome === 'Ações da Petrobras'), percentual: 40 }
                ];
                break;
            default:
                throw new Error('Perfil de investidor desconhecido.');
        }
        
        // Remove produtos que não foram encontrados (caso o nome mude)
        carteira = carteira.filter(item => item.produto);

        return { perfilCliente, carteira };
    }

    // Dentro da classe RecomendacaoService, adicione este método:
    /**
     * Investe o saldo do cliente na carteira recomendada.
     * @param {number} clienteId
     */
    async investirRecomendacao(clienteId) {
        // 1. Obter o saldo do cliente e a recomendação
        const cliente = await clienteService.getClienteById(clienteId);
        if (!cliente.saldo || cliente.saldo <= 0) {
            throw new Error('Saldo insuficiente para investir.');
        }

        const { carteira: carteiraRecomendada } = await this.gerarRecomendacao(clienteId);
        if (!carteiraRecomendada || carteiraRecomendada.length === 0) {
            throw new Error('Não foi possível obter a carteira recomendada.');
        }

        const saldoParaInvestir = cliente.saldo;

        // 2. Iterar sobre a recomendação e comprar cada ativo
        // Usamos um loop for...of para garantir que as compras ocorram em sequência
        for (const item of carteiraRecomendada) {
            const produto = item.produto;
            const percentual = item.percentual / 100; // ex: 40% -> 0.40
            
            // Calcula o valor a ser alocado neste produto
            const valorAlocar = saldoParaInvestir * percentual;
            
            // Calcula a quantidade de cotas a comprar
            const quantidadeComprar = valorAlocar / produto.preco;
            
            // Se a quantidade for muito pequena, pulamos para o próximo
            if (quantidadeComprar < 0.0001) {
                continue;
            }

            try {
                // Chama o serviço de carteira para efetuar a compra
                // O service já valida se há saldo (o que sempre haverá na primeira iteração)
                // e debita o valor a cada compra.
                await carteiraService.comprarAtivo(clienteId, produto.id, quantidadeComprar);
            } catch (error) {
                // Se uma compra falhar (ex: saldo acabou por arredondamento), loga o erro e continua
                console.warn(`Não foi possível comprar ${produto.nome}: ${error.message}`);
                continue;
            }
        }

        // 3. Retorna a carteira final do cliente
        return await carteiraService.getCarteiraByClienteId(clienteId);
    }
}

module.exports = new RecomendacaoService();