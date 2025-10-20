// src/jobs/cleanupExpiredTokens.js
const cron = require('node-cron');
const { execute } = require('../config/database');

/**
 * Job de limpeza de tokens expirados.
 * Executa diariamente às 3h da manhã para remover tokens expirados do banco de dados.
 * 
 * Tokens limpos:
 * - Email verification tokens expirados
 * - Reset password tokens expirados
 * - Refresh tokens expirados
 * 
 * SEGURANÇA: Este job é essencial para:
 * 1. Minimizar superfície de ataque (menos dados = menos risco)
 * 2. Compliance LGPD/GDPR (não reter dados desnecessários)
 * 3. Otimizar performance do banco (menos dados para indexar)
 */

/**
 * Limpa tokens de verificação de email expirados.
 * @returns {Promise<number>} Número de registros limpos.
 */
async function cleanupEmailVerificationTokens() {
    const sql = `UPDATE investimento_cliente
                 SET email_verification_token = NULL,
                     email_verification_token_expires = NULL
                 WHERE email_verification_token IS NOT NULL
                 AND email_verification_token_expires < SYSTIMESTAMP`;
    
    const result = await execute(sql, [], { autoCommit: true });
    return result.rowsAffected || 0;
}

/**
 * Limpa tokens de reset de senha expirados.
 * @returns {Promise<number>} Número de registros limpos.
 */
async function cleanupResetPasswordTokens() {
    const sql = `UPDATE investimento_cliente
                 SET reset_password_token = NULL,
                     reset_password_token_expires = NULL
                 WHERE reset_password_token IS NOT NULL
                 AND reset_password_token_expires < SYSTIMESTAMP`;
    
    const result = await execute(sql, [], { autoCommit: true });
    return result.rowsAffected || 0;
}

/**
 * Limpa refresh tokens expirados.
 * @returns {Promise<number>} Número de registros limpos.
 */
async function cleanupRefreshTokens() {
    const sql = `UPDATE investimento_cliente
                 SET refresh_token = NULL,
                     refresh_token_expires = NULL
                 WHERE refresh_token IS NOT NULL
                 AND refresh_token_expires < SYSTIMESTAMP`;
    
    const result = await execute(sql, [], { autoCommit: true });
    return result.rowsAffected || 0;
}

/**
 * Executa todos os jobs de limpeza.
 */
async function runCleanupJob() {
    try {
        const timestamp = new Date().toISOString();
        console.log(`[CLEANUP JOB] Iniciando limpeza de tokens expirados às ${timestamp}...`);

        const [emailCount, resetCount, refreshCount] = await Promise.all([
            cleanupEmailVerificationTokens(),
            cleanupResetPasswordTokens(),
            cleanupRefreshTokens()
        ]);

        console.log(`[CLEANUP JOB] Limpeza concluída com sucesso:`);
        console.log(`  - ${emailCount} tokens de verificação de email removidos`);
        console.log(`  - ${resetCount} tokens de reset de senha removidos`);
        console.log(`  - ${refreshCount} refresh tokens removidos`);
        console.log(`  - Total: ${emailCount + resetCount + refreshCount} tokens limpos`);

    } catch (error) {
        console.error('[CLEANUP JOB] ERRO ao executar limpeza de tokens:', error);
        // Não lança erro para não quebrar o cron job
    }
}

/**
 * Inicia o job de limpeza automática.
 * Executa diariamente às 3h da manhã (horário de baixo tráfego).
 * Sintaxe cron: "minuto hora dia mês dia-da-semana"
 * "0 3 * * *" = Todo dia às 03:00
 */
function startCleanupJob() {
    // Executa imediatamente na inicialização (útil para testes)
    if (process.env.NODE_ENV !== 'production') {
        console.log('[CLEANUP JOB] Executando limpeza inicial (desenvolvimento)...');
        runCleanupJob();
    }

    // Agenda execução diária às 3h da manhã
    cron.schedule('0 3 * * *', runCleanupJob, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
    });

    console.log('[CLEANUP JOB] Job de limpeza de tokens agendado: diariamente às 03:00 BRT');
}

module.exports = { 
    startCleanupJob,
    runCleanupJob // Exporta para testes manuais
};
