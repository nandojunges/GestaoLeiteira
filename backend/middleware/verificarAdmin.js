const jwt = require('jsonwebtoken');
const { getDb } = require('../db');

const SECRET = process.env.JWT_SECRET || 'segredo';

module.exports = async function verificarAdmin(req, res, next) {
  try {
    let usuarioJwt = req.user;
    if (!usuarioJwt) {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Token não fornecido' });
      usuarioJwt = jwt.verify(token, SECRET);
    }

    const db = getDb();
    const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(usuarioJwt.id);
    if (!usuario || usuario.perfil !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
