const nodemailer = require('nodemailer');
require('dotenv').config();

const host = process.env.SMTP_HOST || 'smtp.zoho.com';
const port = Number(process.env.SMTP_PORT || 465);
const secure = String(process.env.SMTP_SECURE || 'true') === 'true';
const user = process.env.EMAIL_REMETENTE;
const pass = process.env.EMAIL_SENHA_APP;
const from = process.env.MAIL_FROM || user;

console.log('[MAIL] config efetiva:', { host, port, secure, user, from });

const tx = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

(async () => {
  try {
    await tx.verify();
    console.log('✔️  SMTP verify OK: login e conexão funcionando.');
    if (process.env.MAIL_DEV_ECHO_CODE === 'true') {
      await tx.sendMail({
        from,
        to: user,
        subject: 'Teste SMTP - Gestão Leiteira',
        text: 'Se você recebeu este e-mail, o SMTP está OK.',
      });
      console.log('✔️  E-mail de teste enviado para o remetente.');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ SMTP verify falhou:', err?.message || err);
    if (err?.response) console.error('[MAIL] response:', err.response);
    process.exit(1);
  }
})();

