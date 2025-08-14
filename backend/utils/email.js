const nodemailer = require('nodemailer');

const {
  // compatível com o projeto antigo
  EMAIL_SERVICE = 'Zoho',
  EMAIL_REMETENTE,
  EMAIL_SENHA_APP,
  // overrides opcionais
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_SECURE, // "true" | "false" (opcional)
  EMAIL_FROM, // ex.: "Gestão Leiteira <gestaoleiteirasmartcow@gmail.com>"
  REPLY_TO = 'no-reply@gestaoleiteira.com'
} = process.env;

let transporter;
let printedConfig = false;

function bool(v, fallback) {
  if (v === undefined) return fallback;
  if (typeof v === 'string') return v.toLowerCase() === 'true';
  return !!v;
}

function buildTransportConfig() {
  // 1) Se o usuário definiu host/porta explicitamente, obedece (modo avançado)
  if (SMTP_HOST) {
    const port = Number(SMTP_PORT || 587);
    const secure = SMTP_SECURE !== undefined ? bool(SMTP_SECURE) : port === 465;
    return {
      host: SMTP_HOST,
      port,
      secure,
      auth: { user: SMTP_USER || EMAIL_REMETENTE, pass: EMAIL_SENHA_APP },
      requireTLS: !secure
    };
  }

  // 2) Modo Zoho — copiar exatamente o projeto antigo: 465 + secure: true + host fixo
  if (String(EMAIL_SERVICE).toLowerCase() === 'zoho') {
    return {
      host: 'smtp.zoho.com',
      port: 465,
      secure: true, // SSL (igual ao antigo)
      auth: { user: EMAIL_REMETENTE, pass: EMAIL_SENHA_APP }
    };
  }

  // 3) Gmail (caso o usuário mude o SERVICE)
  if (String(EMAIL_SERVICE).toLowerCase() === 'gmail') {
    return {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: SMTP_USER || EMAIL_REMETENTE, pass: EMAIL_SENHA_APP }
    };
  }

  // 4) Fallback (usa a opção "service" do nodemailer)
  return {
    service: EMAIL_SERVICE,
    auth: { user: SMTP_USER || EMAIL_REMETENTE, pass: EMAIL_SENHA_APP }
  };
}

function getTransporter() {
  if (transporter) return transporter;
  if (!EMAIL_REMETENTE || !EMAIL_SENHA_APP) {
    throw new Error('EMAIL_REMETENTE/EMAIL_SENHA_APP não configurados no .env');
  }
  const cfg = buildTransportConfig();
  transporter = nodemailer.createTransport(cfg);
  transporter._from = EMAIL_FROM || EMAIL_REMETENTE;

  // Loga uma vez a configuração efetiva (sem senha)
  if (!printedConfig) {
    printedConfig = true;
    const eff = cfg.service
      ? {
          service: cfg.service,
          user: (cfg.auth && cfg.auth.user) || '(sem auth.user)',
          from: transporter._from
        }
      : {
          host: cfg.host,
          port: cfg.port,
          secure: cfg.secure,
          user: (cfg.auth && cfg.auth.user) || '(sem auth.user)',
          from: transporter._from
        };
    console.log('[MAIL] config efetiva:', eff);
  }

  return transporter;
}

async function enviarCodigo(destinatario, codigo, ttlMin = 3) {
  const t = getTransporter();
  console.log(`✉️  [MAIL] tentando enviar para ${destinatario} (TTL ${ttlMin} min)`);

  // (Opcional) valida conexão e credenciais — se falhar, veremos o motivo exato
  try {
    await t.verify();
    console.log('📡 [MAIL] conexão SMTP OK');
  } catch (e) {
    console.error('❌ [MAIL] verify falhou:', e.message);
    throw e;
  }

  const mensagem = {
    from: t._from, // compat: FROM pode ser igual ao EMAIL_REMETENTE (legado) ou EMAIL_FROM
    to: destinatario,
    subject: 'Código de verificação - Gestão Leiteira',
    text: `Seu código de verificação é: ${codigo}. Ele expira em ${ttlMin} minutos.`,
    html: `
      <div style="font-family:Arial,sans-serif;font-size:16px">
        <p>Olá!</p>
        <p>Seu código de verificação é:</p>
        <p style="font-size:28px;letter-spacing:6px"><strong>${codigo}</strong></p>
        <p>Validade: ${ttlMin} minutos.</p>
        <p>Se não foi você, ignore este e-mail.</p>
      </div>`,
    headers: { 'X-Mailer': 'GestaoLeiteira' },
    replyTo: REPLY_TO // compatível com o projeto antigo
  };

  try {
    const info = await t.sendMail(mensagem);
    console.log('✅ [MAIL] enviado com sucesso:', info.messageId, '->', destinatario);
    return info;
  } catch (err) {
    console.error(`❌ [MAIL] falha ao enviar para ${destinatario}:`, err.message);
    if (err.response) console.error('[MAIL] response:', err.response);
    if (err.code) console.error('[MAIL] code:', err.code);
    throw err;
  }
}

module.exports = { enviarCodigo };

