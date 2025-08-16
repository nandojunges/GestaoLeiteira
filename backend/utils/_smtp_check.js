require('dotenv').config();
const { verifyConnection } = require('./email');

(async () => {
  try {
    await verifyConnection();
  } catch {
    process.exit(1);
  }
})();

