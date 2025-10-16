// src/services/__tests__/auth.service.test.js

// 1. Mocka as dependências do AuthService
// O Jest substitui o módulo real por um mock que podemos controlar
jest.mock('../../repositories/cliente.repository', () => ({
    // Mockamos apenas os métodos que são usados no AuthService
    findByEmail: jest.fn(),
    create: jest.fn(),
}));
jest.mock('../email.service', () => ({
    // Mockamos a função de envio de e-mail, pois ela é um "side effect"
    sendAccountVerificationEmail: jest.fn(),
}));
jest.mock('bcryptjs'); // Mocka bcryptjs, usado para criptografar a senha
jest.mock('jsonwebtoken', () => ({
    // Mocka jsonwebtoken para retornar sempre o mesmo token de verificação
    sign: jest.fn(() => 'MOCK_VERIFICATION_TOKEN')
}));

// Importa o serviço a ser testado
const AuthService = require('../auth.service');
const clienteRepository = require('../../repositories/cliente.repository'); 
const emailService = require('../email.service'); 
const bcrypt = require('bcryptjs'); 

describe('AuthService - Register', () => {
    
    // Dados de Teste
    const mockClienteData = { nome: 'João', email: 'joao@teste.com', senha: 'senhaforte' };
    const mockClienteCriado = { id: 10, ...mockClienteData, senha: 'hashed_password' };

    beforeEach(() => {
        // Limpa todas as chamadas feitas aos mocks antes de cada teste
        jest.clearAllMocks(); 
        
        // Configura mocks para o cenário de sucesso padrão
        clienteRepository.findByEmail.mockResolvedValue(null); // E-mail não existe
        clienteRepository.create.mockResolvedValue(mockClienteCriado); // Criação retorna sucesso
        bcrypt.hashSync.mockReturnValue('hashed_password'); // Criptografia bem-sucedida
        emailService.sendAccountVerificationEmail.mockResolvedValue(); // Simula o sucesso do envio de e-mail
    });

    // --- TESTE DE SUCESSO ---
    it('deve registrar um novo cliente, criptografar a senha e enviar e-mail de verificação', async () => {
        const novoCliente = await AuthService.register(mockClienteData);

        // 1. A Lógica de Negócio foi seguida?
        expect(clienteRepository.findByEmail).toHaveBeenCalledWith(mockClienteData.email);
        expect(bcrypt.hashSync).toHaveBeenCalledWith(mockClienteData.senha, 8);
        
        // 2. Os "side effects" esperados ocorreram?
        expect(clienteRepository.create).toHaveBeenCalledWith({
            nome: mockClienteData.nome,
            email: mockClienteData.email,
            senha: 'hashed_password' // Deve usar a senha criptografada
        });
        expect(emailService.sendAccountVerificationEmail).toHaveBeenCalledWith(
            mockClienteData.email, 
            'MOCK_VERIFICATION_TOKEN'
        );

        // 3. O resultado está correto?
        expect(novoCliente.id).toBe(mockClienteCriado.id);
    });

    // --- TESTE DE REGRA DE NEGÓCIO (E-MAIL DUPLICADO) ---
    it('deve lançar um erro se o e-mail já estiver cadastrado', async () => {
        // Simula o cenário onde o repositório encontra um cliente existente
        clienteRepository.findByEmail.mockResolvedValue({ id: 99, email: mockClienteData.email });

        await expect(
            AuthService.register(mockClienteData)
        ).rejects.toThrow('Este e-mail já está cadastrado.');

        // Garante que a criação e o envio de e-mail NÃO foram chamados
        expect(clienteRepository.create).not.toHaveBeenCalled();
        expect(emailService.sendAccountVerificationEmail).not.toHaveBeenCalled();
    });

    // --- TESTE DE ROBUSTEZ (Lógica do Fire-and-Forget) ---
    it('não deve falhar se o envio de e-mail falhar, apenas logar o erro', async () => {
        // Simula a falha do serviço de e-mail (que roda em segundo plano)
        emailService.sendAccountVerificationEmail.mockRejectedValue(new Error('Falha no SMTP'));
        
        // Mocka console.error para evitar poluição no console e verificar a chamada
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

        // O registro DEVE ser bem-sucedido, pois o e-mail é "fire-and-forget"
        await expect(AuthService.register(mockClienteData)).resolves.toBeDefined();
        
        // O log de erro DEVE ser chamado
        expect(consoleErrorMock).toHaveBeenCalledTimes(1);
        
        consoleErrorMock.mockRestore(); // Restaura o console original
    });
});