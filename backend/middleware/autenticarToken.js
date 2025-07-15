const jwt = require('jsonwebtoken');
const { initDB } = require('../db');
const SECRET = process.env.JWT_SECRET || 'segredo';

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });

    const db = initDB(decoded.email);
    const usuario = db
      .prepare(
        'SELECT status, dataLiberado, dataFimLiberacao, dataFimTeste FROM usuarios WHERE id = ?'
      )
      .get(decoded.idProdutor);

    if (!usuario) return res.status(401).json({ message: 'Usuário não encontrado' });

    if (
      usuario.dataFimLiberacao &&
      new Date(usuario.dataFimLiberacao) < new Date()
    ) {
      db.prepare('UPDATE usuarios SET status = ? WHERE id = ?').run(
        'bloqueado',
        decoded.idProdutor
      );
      usuario.status = 'bloqueado';
    }

    if (
      usuario.status === 'teste' &&
      usuario.dataFimTeste &&
      new Date(usuario.dataFimTeste) < new Date()
    ) {
      db.prepare('UPDATE usuarios SET status = ? WHERE id = ?').run(
        'suspenso',
        decoded.idProdutor
      );
      usuario.status = 'suspenso';
    }

    if (usuario.status === 'bloqueado') {
      return res.status(403).json({ message: 'Usuário bloqueado' });
    }

    if (usuario.status === 'suspenso') {
      return res.status(403).json({
        message: 'Sua conta está suspensa. Selecione um plano para continuar.'
      });
    }

    req.user = decoded;

    next();
  });
}

module.exports = autenticarToken;
