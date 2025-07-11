const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'segredo';

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });

    // Adiciona no req.user o payload completo do token
    req.user = decoded;

    next();
  });
}

module.exports = autenticarToken;
