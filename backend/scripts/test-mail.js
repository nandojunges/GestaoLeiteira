const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { enviarCodigo, transporter } = require('../utils/email');

(async () => {
  try {
    await transporter.verify();
    console.log('SMTP OK');
    await enviarCodigo(process.env.EMAIL_REMETENTE, String(Math.floor(100000 + Math.random()*900000)));
    console.log('✅ Teste OK');
    process.exit(0);
  } catch (e) {
    console.error('❌ Falha no teste:', e);
    process.exit(1);
  }
})();
