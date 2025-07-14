const express = require('express');
const router = express.Router();
const { initDB } = require('../db');
const autenticarToken = require('../middleware/autenticarToken');

router.use(autenticarToken);

router.post('/solicitar-plano', (req, res) => {
  const { plano, formaPagamento } = req.body;

  if (!plano || !formaPagamento) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const planosValidos = ['basico', 'intermediario', 'completo'];
  const formasValidas = ['pix', 'cartao', 'dinheiro'];

  if (!planosValidos.includes(plano) || !formasValidas.includes(formaPagamento)) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  const db = initDB(req.user.email);
  const usuario = db.prepare('SELECT id FROM usuarios WHERE id = ?').get(req.user.idProdutor);
  if (!usuario) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  db.prepare('UPDATE usuarios SET planoSolicitado = ?, formaPagamento = ?, status = ? WHERE id = ?')
    .run(plano, formaPagamento, 'pendente', req.user.idProdutor);

  res.json({ message: 'Plano solicitado com sucesso' });
});

module.exports = router;
