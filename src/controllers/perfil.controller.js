// src/controllers/perfil.controller.js
const perfilService = require('../services/perfil.service');
const { PerfilRequestDTO, PerfilResponseDTO } = require('../dtos/perfil.dto');

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
            // Trata erros como "Cliente não encontrado" ou erros no cálculo
            return res.status(404).json({ message: error.message });
        }
    }
}

// Certifique-se de que a exportação está correta
module.exports = new PerfilController();