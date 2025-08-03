const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token ausente' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    req.user = req.usuario;

    // ✅ Verificação mais clara e com logs
    if (!req.usuario) {
      console.log('❌ Token inválido ou ausente');
      return res.status(403).json({ erro: 'Token inválido' });
    }

    if (!req.usuario.idProdutor) {
      console.log('❌ idProdutor ausente no token:', req.usuario);
      return res
        .status(403)
        .json({ erro: 'Usuário sem permissão: idProdutor ausente' });
    }

    console.log('🔓 Token válido. Usuário autenticado:', req.usuario);
    next();
  } catch (e) {
    console.error('❌ Erro ao verificar token:', e.message);
    return res.status(403).json({ erro: 'Token inválido' });
  }
};

