const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const autenticar = require('../middleware/autenticarToken');
const { initDB } = require('../db');
const Usuario = require('../models/Usuario');
const VerificacaoPendente = require('../models/VerificacaoPendente');

// ✅ Cadastro: envia o código de verificação por e-mail
// Rotas de cadastro e verificação de email
router.post('/cadastro', controller.cadastro);
router.post('/register', controller.cadastro); // alias /auth/register

// ✅ Verifica o código enviado por e-mail e cria o usuário
router.post('/verificar-email', controller.verificarEmail);
router.post('/verify-code', (req, res) => {
  const { email, codigo, senha } = req.body;

  if (senha) {
    return controller.resetarSenha(req, res);
  }

  if (!email || !codigo) {
    return res.status(400).json({ message: 'Email e código são obrigatórios.' });
  }

  const db = initDB(email);
  const dados = VerificacaoPendente.getByEmail(db, email);

  if (!dados) {
    return res.status(400).json({ message: 'Código não encontrado.' });
  }

  const codigoSalvo = String(dados.codigo).trim();
  const codigoEnviado = String(codigo).trim();

  if (codigoSalvo !== codigoEnviado) {
    return res.status(400).json({ message: 'Código incorreto.' });
  }

  Usuario.marcarComoVerificado(db, email);
  VerificacaoPendente.deletar(db, email);

  return res.status(200).json({ message: 'Verificação concluída com sucesso.' });
}); // alias /auth/verify-code
router.post('/forgot-password', controller.solicitarReset); // envia codigo de reset
router.post('/finalizar-cadastro', controller.finalizarCadastro);

// ✅ Login (só funciona após verificação do e-mail)
router.post('/login', controller.login);

// ❌ (A implementar futuramente)
// router.post('/esqueci-senha', controller.solicitarReset);
// router.post('/resetar-senha', controller.resetarSenha);

// ✅ Retorna dados do usuário logado (rota protegida)
router.get('/dados', autenticar, controller.dados);

// ✅ Lista todos os usuários (você pode futuramente proteger com autenticação admin)
router.get('/usuarios', controller.listarUsuarios);

module.exports = router;