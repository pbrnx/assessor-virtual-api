// src/middlewares/errorHandler.js

/**
 * Middleware para tratamento de erros.
 * Ele captura os erros lançados na aplicação (ex: new Error('...'))
 * e formata uma resposta JSON padronizada.
 */
function errorHandler(err, req, res, next) {
    console.error(err.stack); // Loga o erro completo no console para debug

    const statusCode = err.statusCode || 500; // Se não houver um status, assume 500 (Internal Server Error)
    const message = err.message || 'Ocorreu um erro interno no servidor.';

    res.status(statusCode).json({
        status: 'error',
        statusCode: statusCode,
        message: message
    });
}

module.exports = errorHandler;