const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zoho.com',
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || 'true') === 'true', // SSL
  auth: {
    user: process.env.EMAIL_REMETENTE,
    pass: process.env.EMAIL_SENHA_APP
  }
  // logger: true,
  // debug: true,
});

async function enviarCodigo(destino, codigo) {
  const base = process.env.APP_BASE_URL || 'http://localhost:5173';
  const link = `${base}/verificar?email=${encodeURIComponent(destino)}&codigo=${encodeURIComponent(codigo)}`;

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.EMAIL_REMETENTE,
    to: destino,
    subject: 'Código de verificação - Gestão Leiteira',
    html: `<p>Seu código: <b>${codigo}</b></p><p>Ou clique: <a href="${link}">${link}</a></p>`
  });

  console.log('✉️  E-mail de código enviado para', destino, 'id:', info.messageId);
}

module.exports = { enviarCodigo, transporter };
