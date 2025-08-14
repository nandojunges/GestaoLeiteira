const nodemailer = require('nodemailer');

const {
  EMAIL_SERVICE = 'Zoho',
  EMAIL_REMETENTE,
  EMAIL_SENHA_APP,
} = process.env;

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!EMAIL_REMETENTE || !EMAIL_SENHA_APP) {
    throw new Error('EMAIL_REMETENTE/EMAIL_SENHA_APP não configurados');
  }
  // Zoho explícito evita cair em outros provedores (ex.: Office365)
  if (String(EMAIL_SERVICE).toLowerCase() === 'zoho') {
    transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 587,
      secure: false,
      auth: { user: EMAIL_REMETENTE, pass: EMAIL_SENHA_APP },
    });
  } else {
    transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: { user: EMAIL_REMETENTE, pass: EMAIL_SENHA_APP },
    });
  }
  return transporter;
}

async function enviarCodigo(destinatario, codigo, ttlMin = 3) {
  const t = getTransporter();
  console.log(`✉️  [MAIL] tentando enviar para ${destinatario} (TTL ${ttlMin} min)`);
  try {
    const info = await t.sendMail({
      from: EMAIL_REMETENTE,
      to: destinatario,
      subject: 'Código de verificação — Gestão Leiteira',
      text: `Seu código é: ${codigo}. Ele expira em ${ttlMin} minutos.`,
      html: `
        <div style="font-family:Arial,sans-serif;font-size:16px">
          <p>Olá!</p>
          <p>Seu código de verificação é:</p>
          <p style="font-size:28px;letter-spacing:6px"><strong>${codigo}</strong></p>
          <p>Validade: ${ttlMin} minutos.</p>
          <p>Se não foi você, ignore este e-mail.</p>
        </div>`
    });
    console.log(`✅ [MAIL] enviado com sucesso (id=${info.messageId}) para ${destinatario}`);
    return info;
  } catch (err) {
    console.error(`❌ [MAIL] falha ao enviar para ${destinatario}:`, err.message);
    if (err.response) console.error('[MAIL] response:', err.response);
    if (err.code)     console.error('[MAIL] code:', err.code);
    throw err;
  }
}

module.exports = { enviarCodigo };

