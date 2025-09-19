// src/controllers/carteira.controller.js
const carteiraService = require('../services/carteira.service');
const { CompraRequestDTO, VendaRequestDTO, CarteiraResponseDTO } = require('../dtos/carteira.dto');

class CarteiraController {

    async getCarteira(req, res, next) {
        try {
            const clienteId = req.params.id; // O ID vem da rota /clientes/:id/carteira
            const carteiraItens = await carteiraService.getCarteiraByClienteId(clienteId);
            const carteiraResponse = new CarteiraResponseDTO(carteiraItens);
            res.status(200).json(carteiraResponse);
        } catch (error) {
            error.statusCode = 404;
            next(error);
        }
    }

    async comprar(req, res, next) {
        try {
            const clienteId = req.params.id;
            const compraRequest = new CompraRequestDTO(req.body);

            if (!compraRequest.produtoId || !compraRequest.quantidade) {
                return res.status(400).json({ message: 'produtoId e quantidade são obrigatórios.' });
            }

            const carteiraAtualizada = await carteiraService.comprarAtivo(
                clienteId,
                compraRequest.produtoId,
                compraRequest.quantidade
            );
            
            const carteiraResponse = new CarteiraResponseDTO(carteiraAtualizada);
            res.status(200).json(carteiraResponse);

        } catch (error) {
            // Define o status code com base na mensagem de erro do service
            error.statusCode = error.message.includes('Saldo insuficiente') ? 402 : 400;
            next(error);
        }
    }

    // Dentro da classe CarteiraController, adicione este método
    async vender(req, res, next) {
        try {
            const clienteId = req.params.id;
            const vendaRequest = new VendaRequestDTO(req.body);

            if (!vendaRequest.produtoId || !vendaRequest.quantidade) {
                return res.status(400).json({ message: 'produtoId e quantidade são obrigatórios.' });
            }

            const carteiraAtualizada = await carteiraService.venderAtivo(
                clienteId,
                vendaRequest.produtoId,
                vendaRequest.quantidade
            );
            
            const carteiraResponse = new CarteiraResponseDTO(carteiraAtualizada);
            res.status(200).json(carteiraResponse);

        } catch (error) {
            error.statusCode = error.message.includes('indisponível') ? 400 : 404;
            next(error);
        }
    }
}

module.exports = new CarteiraController();