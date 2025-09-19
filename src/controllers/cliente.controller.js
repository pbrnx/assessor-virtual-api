// src/controllers/cliente.controller.js
const clienteService = require('../services/cliente.service');
const { ClienteRequestDTO, ClienteResponseDTO, DepositoRequestDTO } = require('../dtos/cliente.dto');

class ClienteController {

    async create(req, res, next) {
        try {
            const clienteRequest = new ClienteRequestDTO(req.body.nome, req.body.email);
            
            if (!clienteRequest.nome || !clienteRequest.email) {
                return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
            }

            const novoCliente = await clienteService.createCliente(clienteRequest);
            const clienteResponse = new ClienteResponseDTO(novoCliente);

            return res.status(201).json(clienteResponse);
        } catch (error) {
            next(error);
        }
    }

    async findById(req, res, next) {
        try {
            const id = req.params.id;
            const cliente = await clienteService.getClienteById(id);
            const clienteResponse = new ClienteResponseDTO(cliente);
            return res.status(200).json(clienteResponse);
        } catch (error) {
            error.statusCode = 404;
            next(error);
        }
    }

    async findAll(req, res, next) {
        try {
            const clientes = await clienteService.getAllClientes();
            const clientesResponse = clientes.map(cliente => new ClienteResponseDTO(cliente));
            return res.status(200).json(clientesResponse);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const id = req.params.id;
            const clienteRequest = new ClienteRequestDTO(req.body.nome, req.body.email);

            if (!clienteRequest.nome || !clienteRequest.email) {
                return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
            }

            const clienteAtualizado = await clienteService.updateCliente(id, clienteRequest);
            const clienteResponse = new ClienteResponseDTO(clienteAtualizado);
            return res.status(200).json(clienteResponse);
        } catch (error) {
            error.statusCode = error.message.includes('encontrado') ? 404 : 400;
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const id = req.params.id;
            await clienteService.deleteCliente(id);
            return res.status(204).send();
        } catch (error) {
            error.statusCode = 404;
            next(error);
        }
    }

    // NOVO: Controller para depósito
    async depositar(req, res, next) {
        try {
            const id = req.params.id;
            const depositoRequest = new DepositoRequestDTO(req.body);
            
            const clienteAtualizado = await clienteService.depositarSaldo(id, depositoRequest.valor);
            const clienteResponse = new ClienteResponseDTO(clienteAtualizado);

            return res.status(200).json(clienteResponse);
        } catch (error) {
            error.statusCode = error.message.includes('encontrado') ? 404 : 400;
            next(error);
        }
    }
}

module.exports = new ClienteController();