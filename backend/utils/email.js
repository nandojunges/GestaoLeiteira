require("dotenv").config();
const nodemailer = require("nodemailer");

let host = process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.zoho.com";
let port = Number(process.env.SMTP_PORT || 465);
let secure = (String(process.env.SMTP_SECURE || "true").toLowerCase() !== "false");
const user = process.env.EMAIL_REMETENTE;
const pass = process.env.EMAIL_SENHA_APP;
const from = process.env.MAIL_FROM || user;

// auto-correct: Gmail user com host Zoho -> usa Gmail SMTP
if (/@gmail\.com$/i.test(user) && /zoho/i.test(host)) {
  host = "smtp.gmail.com";
  port = 465;
  secure = true;
}

const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

function logCfg() {
  console.log("[MAIL] config efetiva:", { host, port, secure, user, from });
}

async function enviarCodigo(to, codigo, ttlMin = Number(process.env.VERIFICATION_TTL_MINUTES || 3)) {
  logCfg();
  try {
    await transporter.verify();
  } catch (err) {
    console.error("❌ [MAIL] verify falhou:", err.message);
    throw err;
  }

  const message = {
    from,
    to,
    subject: "Código de verificação - Gestão Leiteira",
    text: `Seu código de verificação é: ${codigo}\n\nValidade: ${ttlMin} minuto(s).`,
    headers: { "X-Mailer": "GestaoLeiteira" },
    replyTo: "no-reply@gestaoleiteira.com",
  };

  console.log(`✉️  [MAIL] tentando enviar para ${to} (TTL ${ttlMin} min)`);
  const info = await transporter.sendMail(message);
  console.log("✔️ [MAIL] enviado:", info.messageId);
  return info;
}

module.exports = { enviarCodigo };
