// src/middlewares/authJwt.js
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');

const verifyToken = (req, res, next) => {
    // 1. Pega o token do header da requisição
    // O formato esperado é: "Bearer TOKEN"
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({ message: 'Nenhum token foi fornecido!' });
    }

    // Remove o "Bearer " do início da string
    token = token.split(' ')[1];

    if (!token) {
        return res.status(403).send({ message: 'Token em formato inválido!' });
    }

    // 2. Verifica se o token é válido
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            // Se o token for expirado ou inválido, retorna um erro de não autorizado
            return res.status(401).send({ message: 'Não autorizado! O token é inválido ou expirou.' });
        }
        
        // 3. Se o token for válido, salva o ID do cliente na requisição
        // para que as próximas funções (controllers) possam usá-lo.
        req.clienteId = decoded.id;
        
        // 4. Chama o próximo middleware ou o controller final da rota
        next();
    });
};

const authJwt = {
    verifyToken,
};

module.exports = authJwt;