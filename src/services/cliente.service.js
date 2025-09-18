// src/services/cliente.service.js
const clienteRepository = require('../repositories/cliente.repository');

class ClienteService {

    async createCliente(clienteData) {
        const { nome, email } = clienteData;

        // Validação de negócio: verifica se o email já está em uso
        const emailExistente = await clienteRepository.findByEmail(email);
        if (emailExistente) {
            throw new Error('Este e-mail já está cadastrado.');
        }

        return await clienteRepository.create({ nome, email });
    }

    async getClienteById(id) {
        const cliente = await clienteRepository.findById(id);
        if (!cliente) {
            // Lança um erro se o cliente não for encontrado, que será tratado no controller
            throw new Error('Cliente não encontrado.');
        }
        return cliente;
    }

    async getAllClientes() {
        return await clienteRepository.findAll();
    }
}

module.exports = new ClienteService();