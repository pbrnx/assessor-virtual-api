// src/services/cliente.service.js

class ClienteService {
    // O serviço agora recebe sua dependência no construtor
    constructor(clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    async createCliente(clienteData) {
        const { nome, email } = clienteData;
        // Usa a dependência injetada
        const emailExistente = await this.clienteRepository.findByEmail(email);
        if (emailExistente) {
            throw new Error('Este e-mail já está cadastrado.');
        }
        return await this.clienteRepository.create({ nome, email });
    }

    async getClienteById(id) {
        // Usa a dependência injetada
        const cliente = await this.clienteRepository.findById(id);
        if (!cliente) {
            throw new Error('Cliente não encontrado.');
        }
        return cliente;
    }

    async getAllClientes() {
        return await this.clienteRepository.findAll();
    }

    async updateCliente(id, clienteData) {
        await this.getClienteById(id);
        
        const emailExistente = await this.clienteRepository.findByEmail(clienteData.email);
        if (emailExistente && emailExistente.id !== parseInt(id, 10)) {
            throw new Error('O e-mail informado já está em uso por outro cliente.');
        }

        return await this.clienteRepository.update(id, clienteData);
    }

    async deleteCliente(id) {
        await this.getClienteById(id);
        return await this.clienteRepository.delete(id);
    }

    async depositarSaldo(id, valor) {
        if (!valor || typeof valor !== 'number' || valor <= 0) {
            throw new Error('O valor do depósito deve ser um número positivo.');
        }

        const cliente = await this.getClienteById(id);
        const novoSaldo = cliente.saldo + valor;

        await this.clienteRepository.updateSaldo(id, novoSaldo);
        return await this.getClienteById(id);
    }
}

// ATENÇÃO: A classe é exportada, não mais uma instância.
module.exports = ClienteService;