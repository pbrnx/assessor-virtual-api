// src/services/email.service.js
const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');

// Configura o cliente OAuth2 com as credenciais do Google Cloud
const oAuth2Client = new google.auth.OAuth2(
    process.env.G_CLIENT_ID,
    process.env.G_CLIENT_SECRET,
    process.env.G_REDIRECT_URI
);

// Define o Refresh Token para que o cliente possa se autenticar
oAuth2Client.setCredentials({ refresh_token: process.env.G_REFRESH_TOKEN });

/**
 * Codifica a mensagem de e-mail para o formato Base64URL, exigido pela API do Gmail.
 * @param {object} options - As opções do e-mail (to, subject, html, etc.).
 * @returns {Promise<string>} A mensagem codificada.
 */
const encodeMessage = async (options) => {
    const mail = new MailComposer(options);
    const message = await mail.compile().build();
    return Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

/**
 * Envia um e-mail usando a API do Gmail.
 * @param {object} options - As opções do e-mail.
 */
const sendMail = async (options) => {
    try {
        // Gera um novo Access Token usando o Refresh Token
        await oAuth2Client.getAccessToken();
        
        // Instancia o cliente da API do Gmail
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

        const rawMessage = await encodeMessage(options);

        // Envia a mensagem
        await gmail.users.messages.send({
            userId: 'me',
            resource: {
                raw: rawMessage,
            },
        });

        console.log('E-mail enviado com sucesso via API do Gmail para:', options.to);
    } catch (error) {
        console.error('Erro detalhado ao enviar e-mail via API do Gmail:', error);
        throw new Error('Não foi possível enviar o e-mail.');
    }
};

/**
 * Envia um e-mail de redefinição de senha com um template HTML aprimorado.
 * @param {string} to - O e-mail do destinatário.
 * @param {string} token - O token de redefinição de senha.
 */
async function sendPasswordResetEmail(to, token) {
    const resetLink = `https://assessor-virtual-api.onrender.com/?token=${token}&action=resetPassword`;
    
    const mailOptions = {
        to: to,
        from: `Assessor Virtual <${process.env.EMAIL_USER}>`,
        subject: 'Redefinição de Senha - Assessor Virtual',
        text: `Olá,\n\nPara redefinir sua senha, por favor, acesse o seguinte link (válido por 1 hora): ${resetLink}\n\nSe você não solicitou isso, pode ignorar este e-mail.\n\nAtenciosamente,\nEquipe Assessor Virtual`,
        html: `
<div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; box-sizing: border-box; background-color: #f4f7fa; color: #637381; line-height: 1.6; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); overflow: hidden;">
    <div style="background-color: #4a6cf7; color: white; padding: 25px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Assessor Virtual</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="font-size: 20px; color: #1a202c; margin-top: 0;">Redefinição de Senha</h2>
      <p>Olá,</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta. Se foi você, clique no botão abaixo para escolher uma nova senha. Este link é válido por 1 hora.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #4a6cf7; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Redefinir Senha</a>
      </div>
      <p>Se você não solicitou uma redefinição de senha, pode ignorar este e-mail com segurança. Nenhuma alteração será feita na sua conta.</p>
      <p>Atenciosamente,<br>Equipe Assessor Virtual</p>
    </div>
  </div>
</div>
        `,
    };
    await sendMail(mailOptions);
}

/**
 * Envia um e-mail de verificação de conta com um template HTML aprimorado.
 * @param {string} to - O e-mail do destinatário.
 * @param {string} token - O token de verificação.
 */
async function sendAccountVerificationEmail(to, token) {
    const verificationLink = `https://assessor-virtual-api.onrender.com/?token=${token}&action=verifyEmail`;
    
    const mailOptions = {
        to: to,
        from: `Assessor Virtual <${process.env.EMAIL_USER}>`,
        subject: 'Verifique sua Conta - Assessor Virtual',
        text: `Bem-vindo ao Assessor Virtual!\n\nPara ativar sua conta, por favor, acesse o seguinte link: ${verificationLink}\n\nAtenciosamente,\nEquipe Assessor Virtual`,
        html: `
<div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; box-sizing: border-box; background-color: #f4f7fa; color: #637381; line-height: 1.6; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); overflow: hidden;">
    <div style="background-color: #13c296; color: white; padding: 25px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Bem-vindo ao Assessor Virtual!</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="font-size: 20px; color: #1a202c; margin-top: 0;">Confirme seu E-mail</h2>
      <p>Olá,</p>
      <p>Obrigado por se registrar. Falta apenas um passo! Por favor, clique no botão abaixo para verificar seu endereço de e-mail e ativar sua conta.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #13c296; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Verificar E-mail</a>
      </div>
      <p>Atenciosamente,<br>Equipe Assessor Virtual</p>
    </div>
  </div>
</div>
        `,
    };
    await sendMail(mailOptions);
}

module.exports = {
    sendPasswordResetEmail,
    sendAccountVerificationEmail,
};