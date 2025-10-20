// src/controllers/carteira.controller.js
const carteiraService = require('../services/carteira.service');
const { CompraRequestDTO, VendaRequestDTO, CarteiraResponseDTO } = require('../dtos/carteira.dto');

class CarteiraController {

    async getCarteira(req, res, next) {
        try {
            const clienteId = req.params.id;
            const carteiraItens = await carteiraService.getCarteiraByClienteId(clienteId);
            const carteiraResponse = new CarteiraResponseDTO(carteiraItens);
            res.status(200).json(carteiraResponse);
        } catch (error) {
            error.statusCode = 404;
            next(error);
        }
    }


async comprar(req, res, next) {
    console.log('CORPO DA REQUISIÇÃO RECEBIDO:', req.body);

    try {
        const clienteId = req.params.id;
        // [MUDANÇA] Extrai 'valor' em vez de 'quantidade'
        const { produtoId, valor } = req.body;

        // [MUDANÇA] Validação para 'valor'
        if (!produtoId || valor === undefined) { // Verifica se valor existe (pode ser 0, mas não undefined)
            return res.status(400).json({ message: 'produtoId e valor são obrigatórios.' });
        }
         // Adiciona validação para valor positivo, embora o service também valide
         if (typeof valor !== 'number' || valor <= 0) {
             return res.status(400).json({ message: 'O valor da compra deve ser um número positivo.' });
         }


        const carteiraAtualizada = await carteiraService.comprarAtivo(
            clienteId,
            produtoId,
            valor // <<< MUDANÇA AQUI: Passa 'valor' para o service
        );

        const carteiraResponse = new CarteiraResponseDTO(carteiraAtualizada);
        res.status(200).json(carteiraResponse);

    } catch (error) {
        error.statusCode = error.message.includes('Saldo insuficiente') ? 402 : 400;
        next(error);
    }
}

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