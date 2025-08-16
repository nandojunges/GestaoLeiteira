const nodemailer = require('nodemailer');
require('dotenv').config();

// --- Config padrão para Zoho ---
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.zoho.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'true') === 'true';
const SMTP_USER = process.env.EMAIL_REMETENTE; // ex.: gestaoleiteirasmartcow@zohomail.com
const SMTP_PASS = process.env.EMAIL_SENHA_APP; // App Password gerada no Zoho
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
const TTL_MIN = Number(process.env.VERIFICATION_TTL_MINUTES || 3);

if (!SMTP_USER || !SMTP_PASS) {
  console.warn('⚠️  [MAIL] EMAIL_REMETENTE/EMAIL_SENHA_APP ausentes no .env');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE, // Zoho usa SSL na 465
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

async function enviarCodigo(destino, codigo) {
  const mensagem = {
    from: MAIL_FROM,
    to: destino,
    subject: 'Código de verificação - Gestão Leiteira',
    text: `Seu código de verificação é: ${codigo}\nValidade: ${TTL_MIN} minuto(s).`,
    headers: { 'X-Mailer': 'GestaoLeiteira' },
    replyTo: MAIL_FROM,
  };

  console.log(`✉️  [MAIL] tentando enviar para ${destino} (TTL ${TTL_MIN} min)`);
  try {
    await transporter.verify(); // garante login/porta/ssl
    const info = await transporter.sendMail(mensagem);
    console.log(`✔️  [MAIL] enviado: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`❌ [MAIL] falha ao enviar para ${destino}: ${err?.message || err}`);
    if (err?.response) console.error('[MAIL] response:', err.response);
    if (process.env.MAIL_DEV_ECHO_CODE === 'true') {
      console.log(`🔎 [DEV] Código para ${destino}: ${codigo}`);
    }
    throw err;
  }
}

module.exports = { enviarCodigo, transporter };

