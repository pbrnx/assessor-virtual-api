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
        await this.getClienteById(id);
        
        const emailExistente = await clienteRepository.findByEmail(clienteData.email);
        if (emailExistente && emailExistente.id !== parseInt(id, 10)) {
            throw new Error('O e-mail informado já está em uso por outro cliente.');
        }

        return await clienteRepository.update(id, clienteData);
    }

    async deleteCliente(id) {
        await this.getClienteById(id);
        return await clienteRepository.delete(id);
    }

    /**
     * NOVO: Adiciona um valor ao saldo do cliente.
     * @param {number} id - ID do cliente.
     * @param {number} valor - Valor a ser depositado.
     */
    async depositarSaldo(id, valor) {
        if (!valor || typeof valor !== 'number' || valor <= 0) {
            throw new Error('O valor do depósito deve ser um número positivo.');
        }

        const cliente = await this.getClienteById(id); // Garante que o cliente existe
        const novoSaldo = cliente.saldo + valor;

        await clienteRepository.updateSaldo(id, novoSaldo);

        // Retorna o cliente com o saldo atualizado
        return await this.getClienteById(id);
    }
}

module.exports = new ClienteService();