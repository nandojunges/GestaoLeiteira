const nodemailer = require('nodemailer');

const {
  EMAIL_SERVICE = 'Zoho',
  EMAIL_REMETENTE,
  EMAIL_SENHA_APP
} = process.env;

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!EMAIL_REMETENTE || !EMAIL_SENHA_APP) {
    throw new Error('EMAIL_REMETENTE/EMAIL_SENHA_APP não configurados');
  }

  // Zoho precisa do host explícito (evita cair em Office365)
  if (String(EMAIL_SERVICE).toLowerCase() === 'zoho') {
    transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 587,
      secure: false,
      auth: { user: EMAIL_REMETENTE, pass: EMAIL_SENHA_APP }
    });
  } else {
    // fallback: deixa usar "service" do nodemailer (Gmail etc)
    transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: { user: EMAIL_REMETENTE, pass: EMAIL_SENHA_APP }
    });
  }

  return transporter;
}

async function enviarCodigo(destinatario, codigo, ttlMin = 3) {
  const t = getTransporter();
  const info = await t.sendMail({
    from: EMAIL_REMETENTE,
    to: destinatario,
    subject: 'Código de verificação — Gestão Leiteira',
    text: `Seu código é: ${codigo}. Ele expira em ${ttlMin} minutos.`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px">
        <p>Olá!</p>
        <p>Seu código de verificação é:</p>
        <p style="font-size:28px;letter-spacing:6px"><strong>${codigo}</strong></p>
        <p>Validade: ${ttlMin} minutos.</p>
        <p>Se não foi você, ignore este e-mail.</p>
      </div>
    `
  });
  console.log('✉️  E-mail enviado:', info.messageId, 'para', destinatario);
  return info;
}

module.exports = { enviarCodigo, getTransporter, transporter: getTransporter() };

