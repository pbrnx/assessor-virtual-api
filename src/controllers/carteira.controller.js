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

    // --- SUBSTITUA ESTA FUNÇÃO INTEIRA ---
    async comprar(req, res, next) {
        console.log('CORPO DA REQUISIÇÃO RECEBIDO:', req.body); // O log pode ser mantido ou removido

        try {
            const clienteId = req.params.id;
            // [MUDANÇA] Extraímos os dados diretamente do req.body
            const { produtoId, quantidade } = req.body;

            // [MUDANÇA] A validação agora usa as variáveis locais
            if (!produtoId || !quantidade) {
                // Esta mensagem de erro não deve mais aparecer
                return res.status(400).json({ message: 'produtoId e quantidade são obrigatórios.' });
            }

            const carteiraAtualizada = await carteiraService.comprarAtivo(
                clienteId,
                produtoId,     // Passa a variável diretamente
                quantidade     // Passa a variável diretamente
            );
            
            const carteiraResponse = new CarteiraResponseDTO(carteiraAtualizada);
            res.status(200).json(carteiraResponse);

        } catch (error) {
            // Define o status code com base na mensagem de erro do service
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