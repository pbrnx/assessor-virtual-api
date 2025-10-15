// src/services/auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const clienteRepository = require('../repositories/cliente.repository');
const authConfig = require('../config/auth.config');

class AuthService {

    async register(clienteData) {
        const { nome, email, senha } = clienteData;

        // 1. Validar se o e-mail já existe
        const emailExistente = await clienteRepository.findByEmail(email);
        if (emailExistente) {
            throw new Error('Este e-mail já está cadastrado.');
        }

        // 2. Criptografar a senha
        // O '8' é o "salt rounds", um fator de custo para o hash. 8-10 é um bom valor.
        const senhaCriptografada = bcrypt.hashSync(senha, 8);

        // 3. Criar o cliente no banco de dados
        const novoCliente = await clienteRepository.create({
            nome,
            email,
            senha: senhaCriptografada
        });

        return novoCliente;
    }

    async login(loginData) {
        const { email, senha } = loginData;

        // 1. Buscar o cliente pelo e-mail
        const cliente = await clienteRepository.findByEmail(email);
        if (!cliente) {
            // Mensagem genérica para não informar se o e-mail existe ou não
            throw new Error('Credenciais inválidas.'); 
        }

        // 2. Comparar a senha fornecida com a senha criptografada no banco
        const senhaValida = bcrypt.compareSync(senha, cliente.senha);
        if (!senhaValida) {
            throw new Error('Credenciais inválidas.');
        }

        // 3. Se a senha for válida, gerar o Token JWT
        // O token conterá o ID do cliente, que usaremos para identificar o usuário nas próximas requisições.
        const token = jwt.sign({ id: cliente.id }, authConfig.secret, {
            expiresIn: 86400 // Token expira em 24 horas (em segundos)
        });

        // 4. Retornar os dados do cliente e o token
        return {
            cliente: {
                id: cliente.id,
                nome: cliente.nome,
                email: cliente.email
            },
            token: token
        };
    }
}

module.exports = new AuthService();