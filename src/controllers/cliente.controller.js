// src/controllers/cliente.controller.js
const clienteService = require('../services/cliente.service');
const { ClienteRequestDTO, ClienteResponseDTO } = require('../dtos/cliente.dto');

class ClienteController {

    async create(req, res) {
        try {
            const clienteRequest = new ClienteRequestDTO(req.body.nome, req.body.email);
            
            // Validação de entrada
            if (!clienteRequest.nome || !clienteRequest.email) {
                return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
            }

            const novoCliente = await clienteService.createCliente(clienteRequest);
            const clienteResponse = new ClienteResponseDTO(novoCliente);

            return res.status(201).json(clienteResponse);
        } catch (error) {
            // Retorna erro de e-mail duplicado ou outros erros
            return res.status(400).json({ message: error.message });
        }
    }

    async findById(req, res) {
        try {
            const id = req.params.id;
            const cliente = await clienteService.getClienteById(id);
            const clienteResponse = new ClienteResponseDTO(cliente);
            return res.status(200).json(clienteResponse);
        } catch (error) {
            // Retorna erro de cliente não encontrado
            return res.status(404).json({ message: error.message });
        }
    }

    async findAll(req, res) {
        try {
            const clientes = await clienteService.getAllClientes();
            // Mapeia a lista de modelos para uma lista de DTOs
            const clientesResponse = clientes.map(cliente => new ClienteResponseDTO(cliente));
            return res.status(200).json(clientesResponse);
        } catch (error) {
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }
}

module.exports = new ClienteController();