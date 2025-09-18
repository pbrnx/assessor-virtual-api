// src/services/recomendacao.service.js
const clienteService = require('./cliente.service');
const produtoInvestimentoRepository = require('../repositories/produtoInvestimento.repository');
const PerfilInvestidor = require('../models/perfilInvestidor.model');
const ProdutoInvestimento = require('../models/produtoInvestimento.model');

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
}

module.exports = new RecomendacaoService();