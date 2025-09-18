// src/config/database.js
require('dotenv').config();
const oracledb = require('oracledb');

// Melhora o formato do resultado das queries
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_URL
};

let pool;

async function startup() {
  console.log("Iniciando pool de conexões com o Oracle...");
  try {
    pool = await oracledb.createPool(dbConfig);
    console.log("Pool de conexões iniciado com sucesso.");
  } catch (err) {
    console.error("Erro fatal ao iniciar o pool de conexões:", err);
    process.exit(1);
  }
}

async function shutdown() {
  console.log("Fechando pool de conexões...");
  try {
    if (pool) {
      await pool.close(10);
      console.log("Pool de conexões fechado.");
    }
  } catch (err) {
    console.error("Erro ao fechar o pool de conexões:", err);
  }
}

async function execute(sql, binds = [], options = { autoCommit: false }) {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(sql, binds, options);
    return result;
  } catch (err) {
    console.error("Erro ao executar query:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Erro ao devolver a conexão ao pool:", err);
      }
    }
  }
}

module.exports = {
    startup,
    shutdown,
    execute
};