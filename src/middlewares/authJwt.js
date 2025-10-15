// src/middlewares/authJwt.js
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');

const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({ message: 'Nenhum token foi fornecido!' });
    }

    token = token.split(' ')[1];

    if (!token) {
        return res.status(403).send({ message: 'Token em formato inválido!' });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Não autorizado! O token é inválido ou expirou.' });
        }
        
        req.clienteId = decoded.id;
        req.clienteRole = decoded.role;
        
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.clienteRole === 'admin') {
        next();
        return;
    }
    res.status(403).send({ message: 'Acesso negado! Requer privilégios de administrador.' });
};

// --- NOVO: Middleware para checar se é o dono da conta ou admin ---
const isOwnerOrAdmin = (req, res, next) => {
    // Se for admin, pode tudo.
    if (req.clienteRole === 'admin') {
        return next();
    }
    
    // Se não for admin, verifica se o ID do token é o mesmo ID da rota.
    // Compara o ID do token (req.clienteId) com o ID na URL (req.params.id).
    // Usamos '==' pois req.clienteId pode ser string ('admin') e req.params.id é string.
    if (req.clienteId == req.params.id) {
        return next();
    }

    // Se não for admin e não for o dono da conta, bloqueia o acesso.
    res.status(403).send({ message: 'Acesso negado! Você não tem permissão para acessar este recurso.' });
};

const authJwt = {
    verifyToken,
    isAdmin,
    isOwnerOrAdmin, // <-- Exporta a nova função
};

module.exports = authJwt;