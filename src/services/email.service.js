// src/services/email.service.js
const sgMail = require('@sendgrid/mail');

// Configura a chave da API a partir das variáveis de ambiente
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Envia um e-mail de redefinição de senha usando a API da SendGrid.
 * @param {string} to - O e-mail do destinatário.
 * @param {string} token - O token de redefinição de senha.
 */
async function sendPasswordResetEmail(to, token) {
    const resetLink = `https://assessor-virtual-api.onrender.com/?token=${token}&action=resetPassword`;

    const msg = {
        to: to,
        from: {
            email: process.env.EMAIL_FROM_ADDRESS, // O e-mail verificado na SendGrid
            name: process.env.EMAIL_FROM_NAME,     // O nome que aparecerá para o usuário
        },
        subject: 'Redefinição de Senha - Assessor Virtual',
        text: `Olá,\n\nPara redefinir sua senha, por favor, acesse o seguinte link (válido por 1 hora): ${resetLink}\n\nAtenciosamente,\nEquipe Assessor Virtual`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Redefinição de Senha</h2>
                <p>Olá,</p>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta. Se foi você, clique no botão abaixo para escolher uma nova senha. Este link é válido por 1 hora.</p>
                <p style="margin: 20px 0;">
                    <a href="${resetLink}" style="background-color: #4a6cf7; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Redefinir Senha</a>
                </p>
                <p>Se você não solicitou uma redefinição de senha, pode ignorar este e-mail com segurança.</p>
                <p>Atenciosamente,<br>Equipe Assessor Virtual</p>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log('E-mail de redefinição de senha enviado para:', to);
    } catch (error) {
        console.error('Erro detalhado ao enviar e-mail via SendGrid:', error.response?.body || error);
        throw new Error('Não foi possível enviar o e-mail de redefinição de senha.');
    }
}

/**
 * Envia um e-mail de verificação de conta usando a API da SendGrid.
 * @param {string} to - O e-mail do destinatário.
 * @param {string} token - O token de verificação.
 */
async function sendAccountVerificationEmail(to, token) {
    const verificationLink = `https://assessor-virtual-api.onrender.com/?token=${token}&action=verifyEmail`;

    const msg = {
        to: to,
        from: {
            email: process.env.EMAIL_FROM_ADDRESS,
            name: process.env.EMAIL_FROM_NAME,
        },
        subject: 'Verifique sua Conta - Assessor Virtual',
        text: `Bem-vindo ao Assessor Virtual!\n\nPara ativar sua conta, por favor, acesse o seguinte link: ${verificationLink}\n\nAtenciosamente,\nEquipe Assessor Virtual`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Bem-vindo ao Assessor Virtual!</h2>
                <p>Olá,</p>
                <p>Obrigado por se registrar. Por favor, clique no botão abaixo para verificar seu endereço de e-mail e ativar sua conta.</p>
                <p style="margin: 20px 0;">
                    <a href="${verificationLink}" style="background-color: #13c296; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verificar E-mail</a>
                </p>
                <p>Atenciosamente,<br>Equipe Assessor Virtual</p>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log('E-mail de verificação de conta enviado para:', to);
    } catch (error) {
        console.error('Erro detalhado ao enviar e-mail de verificação via SendGrid:', error.response?.body || error);
        throw new Error('Não foi possível enviar o e-mail de verificação.');
    }
}

module.exports = {
    sendPasswordResetEmail,
    sendAccountVerificationEmail,
};