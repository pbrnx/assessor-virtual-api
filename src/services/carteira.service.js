// src/services/carteira.service.js
const clienteRepository = require('../repositories/cliente.repository');
const produtoRepository = require('../repositories/produtoInvestimento.repository');
const carteiraRepository = require('../repositories/carteira.repository');

class CarteiraService {

    /**
     * Busca a carteira de ativos de um cliente.
     * @param {number} clienteId
     */
    async getCarteiraByClienteId(clienteId) {
        // Garante que o cliente existe
        const cliente = await clienteRepository.findById(clienteId);
        if (!cliente) {
            throw new Error('Cliente não encontrado.');
        }
        return await carteiraRepository.findByClienteId(clienteId);
    }

    /**
     * Realiza a compra de um ativo para um cliente.
     * @param {number} clienteId
     * @param {number} produtoId
     * @param {number} quantidade
     */
    async comprarAtivo(clienteId, produtoId, quantidade) {
        if (!quantidade || quantidade <= 0) {
            throw new Error('A quantidade deve ser um número positivo.');
        }

        // 1. Validar a existência do cliente e do produto
        const cliente = await clienteRepository.findById(clienteId);
        if (!cliente) {
            throw new Error('Cliente não encontrado.');
        }

        const produto = await produtoRepository.findById(produtoId);
        if (!produto) {
            throw new Error('Produto de investimento não encontrado.');
        }

        // 2. Verificar se o cliente tem saldo suficiente
        const custoTotal = produto.preco * quantidade;
        if (cliente.saldo < custoTotal) {
            throw new Error('Saldo insuficiente para realizar a compra.');
        }

        // 3. Debitar o valor do saldo do cliente
        const novoSaldo = cliente.saldo - custoTotal;
        await clienteRepository.updateSaldo(clienteId, novoSaldo);

        // 4. Adicionar ou atualizar o ativo na carteira
        const itemExistente = await carteiraRepository.findByClienteAndProduto(clienteId, produtoId);

        if (itemExistente) {
            // Se o cliente já tem este ativo, apenas soma a nova quantidade
            const novaQuantidade = itemExistente.quantidade + quantidade;
            await carteiraRepository.updateQuantidade(itemExistente.id, novaQuantidade);
        } else {
            // Se for um novo ativo na carteira, cria um novo registro
            await carteiraRepository.create(clienteId, produtoId, quantidade);
        }

        // 5. Retornar a carteira atualizada
        return await this.getCarteiraByClienteId(clienteId);
    }

    /**
     * Realiza a venda de um ativo de um cliente.
     * @param {number} clienteId
     * @param {number} produtoId
     * @param {number} quantidade
     */
    async venderAtivo(clienteId, produtoId, quantidade) {
        if (!quantidade || quantidade <= 0) {
            throw new Error('A quantidade da venda deve ser um número positivo.');
        }

        // 1. Validar a existência do cliente e do produto
        const cliente = await clienteRepository.findById(clienteId);
        if (!cliente) {
            throw new Error('Cliente não encontrado.');
        }

        const produto = await produtoRepository.findById(produtoId);
        if (!produto) {
            throw new Error('Produto de investimento não encontrado.');
        }

        // 2. Verificar se o cliente possui o ativo e em quantidade suficiente
        const itemExistente = await carteiraRepository.findByClienteAndProduto(clienteId, produtoId);
        if (!itemExistente) {
            throw new Error('Você não possui este ativo em sua carteira.');
        }
        if (itemExistente.quantidade < quantidade) {
            throw new Error(`Quantidade de venda indisponível. Você possui ${itemExistente.quantidade} cotas.`);
        }

        // 3. Creditar o valor da venda ao saldo do cliente
        const valorVenda = produto.preco * quantidade;
        const novoSaldo = cliente.saldo + valorVenda;
        await clienteRepository.updateSaldo(clienteId, novoSaldo);

        // 4. Subtrair a quantidade do ativo na carteira
        const novaQuantidade = itemExistente.quantidade - quantidade;

        // Se a nova quantidade for zero (ou muito próxima de zero), remove o item da carteira
        if (novaQuantidade < 0.0001) {
            await carteiraRepository.deleteById(itemExistente.id);
        } else {
            // Caso contrário, apenas atualiza a quantidade
            await carteiraRepository.updateQuantidade(itemExistente.id, novaQuantidade);
        }

        // 5. Retornar a carteira atualizada
        return await this.getCarteiraByClienteId(clienteId);
    }
}

module.exports = new CarteiraService();