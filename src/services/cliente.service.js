// src/services/cliente.service.js
const clienteRepository = require('../repositories/cliente.repository');

class ClienteService {

    async createCliente(clienteData) {
        const { nome, email } = clienteData;
        const emailExistente = await clienteRepository.findByEmail(email);
        if (emailExistente) {
            throw new Error('Este e-mail já está cadastrado.');
        }
        return await clienteRepository.create({ nome, email });
    }

    async getClienteById(id) {
        const cliente = await clienteRepository.findById(id);
        if (!cliente) {
            throw new Error('Cliente não encontrado.');
        }
        return cliente;
    }

    async getAllClientes() {
        return await clienteRepository.findAll();
    }

    async updateCliente(id, clienteData) {
        // Regra de negócio: garantir que o cliente exista antes de atualizar
        await this.getClienteById(id);
        
        // Regra de negócio: garantir que o novo e-mail não pertença a outro cliente
        const emailExistente = await clienteRepository.findByEmail(clienteData.email);
        if (emailExistente && emailExistente.id !== parseInt(id, 10)) {
            throw new Error('O e-mail informado já está em uso por outro cliente.');
        }

        return await clienteRepository.update(id, clienteData);
    }

    async deleteCliente(id) {
        // Regra de negócio: garantir que o cliente exista antes de deletar
        await this.getClienteById(id);
        return await clienteRepository.delete(id);
    }
}

module.exports = new ClienteService();