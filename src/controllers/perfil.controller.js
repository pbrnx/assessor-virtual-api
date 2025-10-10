// src/controllers/perfil.controller.js
const PerfilService = require('../services/perfil.service');
const ClienteService = require('../services/cliente.service');
const clienteRepository = require('../repositories/cliente.repository');
const { PerfilRequestDTO, PerfilResponseDTO } = require('../dtos/perfil.dto');

// --- Injeção de Dependência ---
// 1. Cria a instância do repositório (dependência de baixo nível)
const clienteRepo = clienteRepository; 
// 2. Cria a instância do ClienteService, injetando o repositório
const clienteService = new ClienteService(clienteRepo);
// 3. Cria a instância do PerfilService, injetando suas dependências
const perfilService = new PerfilService(clienteService, clienteRepo);
// -----------------------------

class PerfilController {
    async definirPerfil(req, res) {
        try {
            const clienteId = req.params.id;
            const perfilRequest = new PerfilRequestDTO(req.body.respostas);

            if (!perfilRequest.respostas) {
                return res.status(400).json({ message: 'O campo "respostas" é obrigatório.' });
            }

            const perfilDefinido = await perfilService.definirPerfilParaCliente(clienteId, perfilRequest.respostas);
            
            const perfilResponse = new PerfilResponseDTO(perfilDefinido);
            return res.status(200).json(perfilResponse);

        } catch (error) {
            return res.status(404).json({ message: error.message });
        }
    }
}

module.exports = new PerfilController();