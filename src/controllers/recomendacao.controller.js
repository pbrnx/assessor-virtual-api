// src/controllers/recomendacao.controller.js
const recomendacaoService = require('../services/recomendacao.service');
// CORREÇÃO: Importa cada DTO de seu respectivo arquivo, sem duplicatas.
const { RecomendacaoResponseDTO } = require('../dtos/recomendacao.dto');
const { CarteiraResponseDTO } = require('../dtos/carteira.dto');


class RecomendacaoController {

    async getRecomendacao(req, res, next) {
        try {
            const clienteId = req.params.id;
            const { perfilCliente, carteira } = await recomendacaoService.gerarRecomendacao(clienteId);
            
            const recomendacaoResponse = new RecomendacaoResponseDTO(perfilCliente, carteira);
            
            return res.status(200).json(recomendacaoResponse);

        } catch (error) {
            error.statusCode = 404;
            next(error);
        }
    }

    async investir(req, res, next) {
        try {
            const clienteId = req.params.id;
            const carteiraFinal = await recomendacaoService.investirRecomendacao(clienteId);
            
            // Usa o DTO de Carteira para padronizar a resposta
            const carteiraResponse = new CarteiraResponseDTO(carteiraFinal);
            res.status(200).json(carteiraResponse);

        } catch (error) {
            error.statusCode = 400; // Bad Request para erros de lógica de negócio
            next(error);
        }
    }
}

module.exports = new RecomendacaoController();