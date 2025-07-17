const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const autenticar = require('../middleware/autenticarToken');

// ✅ Cadastro: envia o código de verificação por e-mail
// Rotas de cadastro e verificação de email
router.post('/cadastro', controller.cadastro);
router.post('/register', controller.cadastro); // alias /auth/register

// ✅ Verifica o código enviado por e-mail e cria o usuário
router.post('/verificar-email', controller.verificarEmail);
router.post('/verify-code', controller.verificarCodigo); // alias /auth/verify-code
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