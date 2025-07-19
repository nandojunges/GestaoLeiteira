const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_REMETENTE,
    pass: process.env.EMAIL_SENHA_APP
  }
});

async function enviarCodigo(destino, codigo) {
  const mensagem = {
    from: process.env.EMAIL_REMETENTE,
    to: destino,
    subject: 'Código de verificação - Gestão Leiteira',
    text: `Seu código de verificação é: ${codigo}`,
    headers: {
      'X-Mailer': 'GestaoLeiteira',
    },
    replyTo: 'no-reply@gestaoleiteira.com'
  };

  try {
    const info = await transporter.sendMail(mensagem);
    console.log('✔️ E-mail enviado com sucesso:', info.messageId);
  } catch (err) {
    console.error('❌ Erro ao enviar e-mail:', err.message);
  }
}

module.exports = { enviarCodigo };
