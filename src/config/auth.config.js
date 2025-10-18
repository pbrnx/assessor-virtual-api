// src/config/auth.config.js
require('dotenv').config(); // Garanta que dotenv está carregado

module.exports = {
  secret: process.env.SECRET || 'segredo-padrao-jwt', // Mantenha seu segredo principal
  jwtExpiration: process.env.JWT_EXPIRATION || 1800, // 30 minutos em segundos (para access token)
  jwtRefreshSecret: process.env.REFRESH_SECRET || 'segredo-padrao-refresh-jwt', // **NOVO** - Use uma variável de ambiente diferente!
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || 604800, // 7 dias em segundos (para refresh token)
};