const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token ausente' });
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    req.user = req.usuario;

    if (!req.usuario || !req.usuario.idProdutor) {
      return res
        .status(403)
        .json({ erro: 'Usuário sem permissão ou produtor não identificado' });
    }

    console.log('🔑 Token decodificado no backend:', req.usuario);
    next();
  } catch {
    return res.status(403).json({ erro: 'Token inválido' });
  }
};
