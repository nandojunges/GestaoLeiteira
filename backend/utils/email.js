const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zoho.com',
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || 'true') === 'true', // 465 = SSL
  auth: {
    user: process.env.EMAIL_REMETENTE,   // login da conta Zoho (pode ser seu Gmail se a conta Zoho usa esse email)
    pass: process.env.EMAIL_SENHA_APP    // SENHA DE APP da Zoho (OneAuth)
  }
});

async function enviarCodigo(destino, codigo) {
  const base = process.env.APP_BASE_URL || 'http://localhost:5173';
  const link = `${base}/verificar?email=${encodeURIComponent(destino)}&codigo=${encodeURIComponent(codigo)}`;

  const mensagem = {
    from: process.env.MAIL_FROM || process.env.EMAIL_REMETENTE,
    to: destino,
    subject: 'Código de verificação - Gestão Leiteira',
    html: `<p>Seu código: <b>${codigo}</b></p><p>Ou clique: <a href="${link}">${link}</a></p>`,
    headers: { 'X-Mailer': 'GestaoLeiteira' },
    replyTo: process.env.REPLY_TO || 'no-reply@gestaoleiteira.com'
  };

  const info = await transporter.sendMail(mensagem);
  console.log('✔️ E-mail enviado com sucesso:', info.messageId);
  return info;
}

module.exports = { enviarCodigo, transporter };
