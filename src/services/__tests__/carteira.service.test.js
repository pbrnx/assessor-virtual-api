// src/services/__tests__/carteira.service.test.js

// 1. MOCKA O MÓDULO DO REPOSITÓRIO DO CLIENTE
const mockClienteRepository = {
    findById: jest.fn(),
    updateSaldo: jest.fn(),
};
jest.mock('../../repositories/cliente.repository', () => mockClienteRepository);

// 2. MOCKA O MÓDULO DO REPOSITÓRIO DO PRODUTO
const mockProdutoRepository = {
    findById: jest.fn(),
};
jest.mock('../../repositories/produtoInvestimento.repository', () => mockProdutoRepository);

// 3. MOCKA O MÓDULO DO REPOSITÓRIO DA CARTEIRA
const mockCarteiraRepository = {
    findByClienteAndProduto: jest.fn(),
    create: jest.fn(),
    updateQuantidade: jest.fn(),
    findByClienteId: jest.fn(),
    deleteById: jest.fn(),
};
jest.mock('../../repositories/carteira.repository', () => mockCarteiraRepository);

// Importa o serviço a ser testado (ele usará os mocks automaticamente)
const CarteiraService = require('../carteira.service');

// Nota: Não precisamos mais injetar nada manualmente na instância do CarteiraService.

describe('CarteiraService - Comprar Ativo', () => {
    
    const CLIENTE_ID = 1;
    const PRODUTO_ID = 10;
    const VALOR_COMPRA = 500.00;
    const PRODUTO_PRECO = 100.00;
    const QUANTIDADE_ESPERADA = VALOR_COMPRA / PRODUTO_PRECO; // 5.00

    const mockCliente = { id: CLIENTE_ID, saldo: 1000.00 };
    const mockProduto = { id: PRODUTO_ID, preco: PRODUTO_PRECO };

    beforeEach(() => {
        jest.clearAllMocks();

        // Configura mocks para um cenário de sucesso padrão
        mockClienteRepository.findById.mockResolvedValue(mockCliente);
        mockProdutoRepository.findById.mockResolvedValue(mockProduto);
        // Garante que a chamada final para buscar a carteira retorne algo (vazio ou preenchido)
        mockCarteiraRepository.findByClienteId.mockResolvedValue([]); 
    });

    // --- CENA: NOVA COMPRA (Ativo não existe na carteira) ---
    it('deve realizar uma nova compra, calcular cotas e deduzir o saldo', async () => {
        mockCarteiraRepository.findByClienteAndProduto.mockResolvedValue(null);

        await CarteiraService.comprarAtivo(CLIENTE_ID, PRODUTO_ID, VALOR_COMPRA);

        // 1. Deve debitar o valor do saldo do cliente (1000 - 500 = 500)
        expect(mockClienteRepository.updateSaldo).toHaveBeenCalledWith(CLIENTE_ID, 500.00);

        // 2. Deve criar um novo item
        expect(mockCarteiraRepository.create).toHaveBeenCalledWith(CLIENTE_ID, PRODUTO_ID, QUANTIDADE_ESPERADA);

        // 3. Não deve atualizar
        expect(mockCarteiraRepository.updateQuantidade).not.toHaveBeenCalled();
    });
    
    // --- CENA: REFORÇO (Ativo já existe na carteira) ---
    it('deve somar a quantidade se o ativo já estiver na carteira', async () => {
        const itemExistente = { id: 99, quantidade: 2.0 };
        const novaQuantidadeTotal = itemExistente.quantidade + QUANTIDADE_ESPERADA; // 2.0 + 5.0 = 7.0

        mockCarteiraRepository.findByClienteAndProduto.mockResolvedValue(itemExistente);

        await CarteiraService.comprarAtivo(CLIENTE_ID, PRODUTO_ID, VALOR_COMPRA);

        // 1. Deve debitar o valor do saldo do cliente
        expect(mockClienteRepository.updateSaldo).toHaveBeenCalledWith(CLIENTE_ID, 500.00);

        // 2. Deve atualizar a quantidade existente
        expect(mockCarteiraRepository.updateQuantidade).toHaveBeenCalledWith(itemExistente.id, novaQuantidadeTotal);

        // 3. Não deve criar
        expect(mockCarteiraRepository.create).not.toHaveBeenCalled();
    });
    
    // --- CENA: SALDO INSUFICIENTE ---
    it('deve lançar um erro se o saldo for insuficiente', async () => {
        const mockClientePobre = { id: CLIENTE_ID, saldo: 400.00 };
        mockClienteRepository.findById.mockResolvedValue(mockClientePobre);
        
        await expect(
            CarteiraService.comprarAtivo(CLIENTE_ID, PRODUTO_ID, VALOR_COMPRA)
        ).rejects.toThrow('Saldo insuficiente para realizar a compra.');

        expect(mockClienteRepository.updateSaldo).not.toHaveBeenCalled();
    });

    // --- CENA: PRODUTO INEXISTENTE ---
    it('deve lançar um erro se o produto de investimento não for encontrado', async () => {
        mockProdutoRepository.findById.mockResolvedValue(null);
        
        await expect(
            CarteiraService.comprarAtivo(CLIENTE_ID, PRODUTO_ID, VALOR_COMPRA)
        ).rejects.toThrow('Produto de investimento não encontrado.');
        
        expect(mockClienteRepository.updateSaldo).not.toHaveBeenCalled();
    });
});