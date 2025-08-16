const nodemailer = require('nodemailer');

// ==== Leitura de ENV ====
const TTL_MIN = Number(process.env.VERIFICATION_TTL_MINUTES || 3);
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'true') === 'true';

// Login do SMTP (pode ser diferente do e-mail do From em cenários Zoho)
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_REMETENTE;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_SENHA_APP;

// From que aparecerá para o destinatário (pode ser Gmail mesmo autenticando no Zoho)
const MAIL_FROM = process.env.MAIL_FROM || process.env.EMAIL_REMETENTE || SMTP_USER;

// ==== Transporter SEM 'service' (não força Gmail) ====
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,                      // true: 465 (SSL); false: 587 (STARTTLS)
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  requireTLS: !SMTP_SECURE,                 // porta 587 normalmente
  tls: { minVersion: 'TLSv1.2', servername: SMTP_HOST },
});

function logConfig() {
  console.log('[MAIL] config efetiva:', {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    user: SMTP_USER,
    from: MAIL_FROM,
  });
}

async function verifyConnection() {
  logConfig();
  try {
    await transporter.verify();
    console.log('✅ [MAIL] Login SMTP OK');
    return true;
  } catch (e) {
    console.log(`❌ [MAIL] verify falhou: ${e.response || e.message}`);
    throw e;
  }
}

async function enviarCodigo(destino, codigo) {
  await verifyConnection();
  const msg = {
    from: MAIL_FROM,
    to: destino,
    subject: 'Código de verificação - Gestão Leiteira',
    text: `Seu código de verificação é: ${codigo}\n\nEste código expira em ${TTL_MIN} minuto(s).`,
    headers: { 'X-Mailer': 'GestaoLeiteira' },
    replyTo: MAIL_FROM,
  };
  const info = await transporter.sendMail(msg);
  console.log('✔️ [MAIL] enviado:', info.messageId);
}

module.exports = { enviarCodigo, verifyConnection };

