// src/controllers/recomendacao.controller.js
const recomendacaoService = require('../services/recomendacao.service');
const { RecomendacaoResponseDTO } = require('../dtos/recomendacao.dto');

class RecomendacaoController {

    async getRecomendacao(req, res) {
        try {
            const clienteId = req.params.id;
            const { perfilCliente, carteira } = await recomendacaoService.gerarRecomendacao(clienteId);
            
            // Formata a resposta usando o DTO
            const recomendacaoResponse = new RecomendacaoResponseDTO(perfilCliente, carteira);
            
            return res.status(200).json(recomendacaoResponse);

        } catch (error) {
            // Trata erros como "Cliente não encontrado" ou "Perfil não definido"
            return res.status(404).json({ message: error.message });
        }
    }
}

module.exports = new RecomendacaoController();