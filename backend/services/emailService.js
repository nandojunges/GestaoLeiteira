const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_REMETENTE,
    pass: process.env.EMAIL_SENHA_APP,
  },
});

async function sendCode(to, code) {
  const message = {
    from: process.env.EMAIL_REMETENTE,
    to,
    subject: 'Código de verificação - Gestão Leiteira',
    text: `Seu código de verificação é: ${code}`,
    headers: { 'X-Mailer': 'GestaoLeiteira' },
    replyTo: 'no-reply@gestaoleiteira.com',
  };
  return transporter.sendMail(message);
}

async function sendTemplate(to, subject, html) {
  const message = {
    from: process.env.EMAIL_REMETENTE,
    to,
    subject,
    html,
    headers: { 'X-Mailer': 'GestaoLeiteira' },
    replyTo: 'no-reply@gestaoleiteira.com',
  };
  return transporter.sendMail(message);
}

module.exports = { sendCode, sendTemplate };
