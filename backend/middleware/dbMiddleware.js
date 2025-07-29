const { initDB } = require('../db');

/**
 * Middleware que carrega o banco do usuário logado e anexa a instância em req.db.
 * Ao chamar initDB aqui, os backups diários são gerados automaticamente.
 * Deve ser usado logo após o middleware de autenticação.
 */
module.exports = function dbMiddleware(req, res, next) {
  try {
    req.db = initDB(req.user.email);
    next();
  } catch (err) {
    next(err);
  }
};

