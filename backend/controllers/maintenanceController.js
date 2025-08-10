const animalsService = require('../services/animalsService');

async function promotePreParto(req, res, next) {
  try {
    const result = await animalsService.promoteBatchPreParto();
    return res.json({ ok: true, processed: result.count, ids: result.ids });
  } catch (err) {
    next(err);
  }
}

module.exports = { promotePreParto };
