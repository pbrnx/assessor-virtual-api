// src/controllers/recomendacao.controller.js
const RecomendacaoService = require('../services/recomendacao.service');
const ClienteService = require('../services/cliente.service');
const clienteRepository = require('../repositories/cliente.repository');
const { RecomendacaoResponseDTO } = require('../dtos/recomendacao.dto');
const { CarteiraResponseDTO } = require('../dtos/carteira.dto');

// --- Injeção de Dependência ---
const clienteService = new ClienteService(clienteRepository);
const recomendacaoService = new RecomendacaoService(clienteService);
// -----------------------------

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
            const { carteiraRecomendada } = req.body;
            const carteiraFinal = await recomendacaoService.investirRecomendacao(clienteId, carteiraRecomendada);
            const carteiraResponse = new CarteiraResponseDTO(carteiraFinal);
            res.status(200).json(carteiraResponse);
        } catch (error) {
            error.statusCode = 400;
            next(error);
        }
    }
}

module.exports = new RecomendacaoController();