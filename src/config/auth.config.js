// src/config/auth.config.js
require('dotenv').config(); // Garanta que dotenv está carregado

module.exports = {
  secret: process.env.SECRET, // Mantenha seu segredo principal
  jwtExpiration: 1800, // 30 minutos em segundos (para access token)
  jwtRefreshSecret: process.env.REFRESH_SECRET, 
  jwtRefreshExpiration: 604800, // 7 dias em segundos (para refresh token)
};