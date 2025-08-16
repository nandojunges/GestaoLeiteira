require("dotenv").config();
const nodemailer = require("nodemailer");

let host = process.env.SMTP_HOST || "smtp.zoho.com";
let port = Number(process.env.SMTP_PORT || 465);
let secure = (String(process.env.SMTP_SECURE || "true").toLowerCase() !== "false");
const user = process.env.EMAIL_REMETENTE;
const pass = process.env.EMAIL_SENHA_APP;

if (/@gmail\.com$/i.test(user) && /zoho/i.test(host)) {
  host = "smtp.gmail.com"; port = 465; secure = true;
}

const t = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

(async () => {
  console.log("[SMTP CHECK] tentando login em", { host, port, secure, user });
  try {
    await t.verify();
    console.log("✅ Login SMTP OK");
    process.exit(0);
  } catch (e) {
    console.error("❌ Falhou:", e?.message || e);
    process.exit(2);
  }
})();
