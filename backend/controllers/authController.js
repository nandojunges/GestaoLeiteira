const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Usuario = require('../models/Usuario');
const emailUtils = require('../utils/email');
const { initDB, getDBPath } = require('../db');
const emailService = require('../services/emailService');
const { setResetToken, getResetToken, deleteResetToken } = require('../services/userService');
const crypto = require('crypto');

const pendentes = new Map();
const lastCodes = new Map();
const { requireFields, isEmail } = require('../utils/validate');

const SECRET = process.env.JWT_SECRET || 'segredo';

// ➤ Cadastro inicial: gera código e envia por e-mail
async function cadastro(req, res) {
  const {
    nome,
    nomeFazenda,
    email: endereco,
    telefone,
    senha,
    plano: planoSolicitado,
    formaPagamento,
  } = req.body;
  const check = requireFields(req.body, ['nome', 'email', 'senha']);
  if (!check.ok) {
    return res.status(400).json({ ok: false, message: 'Campos obrigatórios ausentes', missing: check.missing });
  }
  if (!isEmail(endereco)) {
    return res.status(400).json({ ok: false, message: 'Email inválido' });
  }
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();

  if (!endereco || typeof endereco !== 'string') {
    return res.status(400).json({ message: 'Email inválido ou não informado.' });
  }

  const dbPath = getDBPath(endereco);

  // Limpa verificações expiradas (10 minutos)
  for (const [email, pend] of pendentes) {
    if (Date.now() - pend.criado_em.getTime() > 10 * 60 * 1000) {
      pendentes.delete(email);
    }
  }

  if (pendentes.has(endereco)) {
    return res
      .status(400)
      .json({ message: 'Já existe uma verificação pendente para este e-mail.' });
  }

  if (fs.existsSync(dbPath)) {
    return res.status(400).json({ message: 'Email já cadastrado' });
  }

  try {
    const pendente = pendentes.get(endereco);
    if (pendente && Date.now() - pendente.criado_em.getTime() < 3 * 60 * 1000) {
      return res.status(400).json({ message: 'Código já enviado. Aguarde o prazo para reenviar.' });
    }

    const hash = await bcrypt.hash(senha, 10);

    pendentes.set(endereco, {
      codigo,
      nome,
      nomeFazenda,
      telefone,
      senha: hash,
      planoSolicitado,
      formaPagamento,
      criado_em: new Date(),
    });

    emailUtils
      .enviarCodigo(endereco, codigo)
      .catch((err) => console.error('Erro ao enviar e-mail:', err));
    res.status(201).json({ message: 'Código enviado. Verifique o e-mail.' });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
}

// ➤ Verifica o código enviado por e-mail e cria o usuário
async function verificarEmail(req, res) {
  const { email: endereco, codigoDigitado } = req.body;

  if (!endereco || typeof endereco !== 'string') {
    return res.status(400).json({ erro: 'Email inválido.' });
  }

  let db;
  try {
    const pendente = pendentes.get(endereco);
    if (!pendente) {
      return res.status(400).json({ erro: 'Código não encontrado. Faça o cadastro novamente.' });
    }

    const expirado = Date.now() - new Date(pendente.criado_em).getTime() > 10 * 60 * 1000;
    if (expirado) {
      pendentes.delete(endereco);
      return res.status(400).json({ erro: 'Código expirado. Faça o cadastro novamente.' });
    }

    if (pendente.codigo !== codigoDigitado) {
      return res.status(400).json({ erro: 'Código incorreto.' });
    }

    const dbPath = getDBPath(endereco);
    let existente = null;
    let dbExist = null;
    if (fs.existsSync(dbPath)) {
      dbExist = initDB(endereco);
      existente = await Usuario.existeNoBanco(dbExist, endereco);
    }
    if (existente) {
      if (req.query.reset === 'true' || existente.status === 'pendente' || !existente.verificado) {
        await Usuario.excluir(dbExist, endereco);
      } else {
        pendentes.delete(endereco);
        return res.status(400).json({ erro: 'Email já cadastrado.' });
      }
    }

    if (pendente.planoSolicitado) {
      const listaAdmins = require('../config/admins');
      const tipoConta = listaAdmins.includes(pendente.email) ? 'admin' : 'usuario';
      const perfil = tipoConta === 'admin' ? 'admin' : 'funcionario';

      db = initDB(endereco, true);
      const novo = await Usuario.create(db, {
        nome: pendente.nome,
        nomeFazenda: pendente.nomeFazenda,
        email: pendente.email,
        telefone: pendente.telefone,
        senha: pendente.senha,
        verificado: true,
        codigoVerificacao: null,
        perfil,
        tipoConta,
      });

      const agora = new Date().toISOString();
      await db
        .prepare(
          'UPDATE usuarios SET status = ?, planoSolicitado = ?, formaPagamento = ?, dataCadastro = ? WHERE id = ?'
        )
        .run(
          'pendente',
          pendente.planoSolicitado,
          pendente.planoSolicitado === 'teste_gratis' ? null : pendente.formaPagamento,
          agora,
          novo.id
        );

      pendentes.delete(endereco);
      console.log(`🔐 Código verificado com sucesso para email: ${endereco}`);
      console.log(`📁 Banco de dados inicializado: ${getDBPath(endereco).replace(/\\/g,'/')}`);
      console.log('✅ Usuário cadastrado e pronto para login.');
      return res.json({ sucesso: true });
    }

    const tokenTemp = jwt.sign({ email: pendente.email }, SECRET, { expiresIn: '1h' });
    res.json({ sucesso: true, token: tokenTemp });
  } catch (err) {
    console.error('Erro na verificação:', err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

// ➤ Finaliza cadastro após escolha de plano
async function finalizarCadastro(req, res) {
  const { token, plano, formaPagamento } = req.body;

  if (!token || !plano) {
    return res.status(400).json({ erro: 'Dados inválidos.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, SECRET);
  } catch (err) {
    return res.status(400).json({ erro: 'Token inválido.' });
  }

  const email = payload.email;
  try {
    const pendente = pendentes.get(email);
    if (!pendente) {
      return res.status(400).json({ erro: 'Cadastro não encontrado.' });
    }

    const dbPath = getDBPath(email);
    let existente = null;
    let dbCheck = null;
    if (fs.existsSync(dbPath)) {
      dbCheck = initDB(email);
      existente = await Usuario.existeNoBanco(dbCheck, email);
    }
    if (existente) {
      if (req.query.reset === 'true' || existente.status === 'pendente' || !existente.verificado) {
        await Usuario.excluir(dbCheck, email);
      } else {
        return res.status(400).json({ erro: 'Email já cadastrado.' });
      }
    }

    const listaAdmins = require('../config/admins');
    const tipoConta = listaAdmins.includes(email) ? 'admin' : 'usuario';
    const perfil = tipoConta === 'admin' ? 'admin' : 'funcionario';

    const db = initDB(email, true);
    const novo = await Usuario.create(db, {
      nome: pendente.nome,
      nomeFazenda: pendente.nomeFazenda,
      email: pendente.email,
      telefone: pendente.telefone,
      senha: pendente.senha,
      verificado: true,
      codigoVerificacao: null,
      perfil,
      tipoConta,
    });

    const agora = new Date().toISOString();
    await db
      .prepare(
        'UPDATE usuarios SET status = ?, planoSolicitado = ?, formaPagamento = ?, dataCadastro = ? WHERE id = ?'
      )
      .run('pendente', plano, plano === 'teste_gratis' ? null : formaPagamento, agora, novo.id);

    pendentes.delete(email);
    console.log(`🔐 Código verificado com sucesso para email: ${email}`);
    console.log(`📁 Banco de dados inicializado: ${getDBPath(email).replace(/\\/g,'/')}`);
    console.log('✅ Usuário cadastrado e pronto para login.');

    res.json({ sucesso: true });
  } catch (err) {
    console.error('Erro ao finalizar cadastro:', err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

// ➤ Login e geração do token JWT
async function login(req, res) {
  const { email, senha } = req.body;
  const check = requireFields(req.body, ['email', 'senha']);
  if (!check.ok) {
    return res.status(400).json({ ok: false, message: 'Campos obrigatórios ausentes', missing: check.missing });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, message: 'Email inválido' });
  }

  const db = initDB(email);
  const usuario = await Usuario.getByEmail(db, email);

  if (!usuario) {
    return res.status(400).json({ message: 'Usuário não encontrado.' });
  }

  if (!usuario.verificado) {
    return res
      .status(403)
      .json({ erro: 'Usuário não verificado. Confirme seu e-mail.' });
  }

  const match = await bcrypt.compare(senha, usuario.senha);

  if (!match) {
    return res.status(400).json({ message: 'Senha incorreta.' });
  }

  // Inclui dados adicionais do usuário no token para que o middleware
  // autenticarToken possa identificar o produtor e o perfil corretamente
  const token = jwt.sign(
    {
      email,
      idProdutor: usuario.id,
      perfil: usuario.perfil,
      tipoConta: usuario.tipoConta,
    },
    SECRET,
    { expiresIn: '2h' }
  );

  return res.status(200).json({ token });
}

// ➤ Dados do usuário logado
async function dados(req, res) {
  const db = initDB(req.user.email);
  const usuario = await Usuario.getById(db, req.user.idProdutor);

  if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });

  res.json({
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      nomeFazenda: usuario.nomeFazenda,
      email: usuario.email,
      telefone: usuario.telefone,
      isAdmin: req.user.perfil === 'admin',
    },
  });
}

// ➤ Lista todos os usuários do banco (apenas do banco do produtor)
async function listarUsuarios(req, res) {
  const db = initDB(req.user.email);

  try {
    const usuarios = await Usuario.getAll(db);
    res.json(usuarios);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

// ➤ Reenvio de código de verificação
async function sendCode(req, res) {
  const check = requireFields(req.body, ['email']);
  if (!check.ok) {
    return res.status(400).json({ ok: false, message: 'Campos obrigatórios ausentes', missing: check.missing });
  }
  const { email } = req.body;
  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, message: 'Email inválido' });
  }

  const last = lastCodes.get(email);
  if (last && Date.now() - last < 60 * 1000) {
    return res.status(429).json({ ok: false, message: 'Aguarde para reenviar.' });
  }

  let registro = pendentes.get(email);
  if (!registro) {
    registro = { codigo: Math.floor(100000 + Math.random() * 900000).toString(), criado_em: new Date() };
    pendentes.set(email, registro);
  } else if (!registro.codigo) {
    registro.codigo = Math.floor(100000 + Math.random() * 900000).toString();
    registro.criado_em = new Date();
    pendentes.set(email, registro);
  }

  lastCodes.set(email, Date.now());

  try {
    await emailService.sendCode(email, registro.codigo);
    return res.json({ ok: true, sent: true });
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err.message);
    return res.status(500).json({ ok: false, sent: false });
  }
}

// ➤ Esqueci minha senha: gera token e envia link
async function forgotPassword(req, res) {
  const check = requireFields(req.body, ['email']);
  if (!check.ok) {
    return res.status(400).json({ ok: false, message: 'Campos obrigatórios ausentes', missing: check.missing });
  }
  const { email } = req.body;
  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, message: 'Email inválido' });
  }

  const dbPath = getDBPath(email);
  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ ok: false, message: 'Usuário não encontrado' });
  }
  const db = initDB(email);
  const usuario = await Usuario.getByEmail(db, email);
  if (!usuario) {
    return res.status(404).json({ ok: false, message: 'Usuário não encontrado' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const exp = Date.now() + 30 * 60 * 1000;
  setResetToken(email, usuario.id, token, exp);

  const base = process.env.AUTH_BASE_URL || 'http://localhost:5173';
  const link = `${base}/reset?token=${token}`;

  try {
    await emailService.sendTemplate(email, 'Recuperação de senha', `<p>Para redefinir sua senha clique <a href="${link}">aqui</a>.</p>`);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err.message);
    return res.status(500).json({ ok: false });
  }
}

// ➤ Define nova senha a partir do token
async function resetPassword(req, res) {
  const check = requireFields(req.body, ['token', 'newPassword']);
  if (!check.ok) {
    return res.status(400).json({ ok: false, message: 'Campos obrigatórios ausentes', missing: check.missing });
  }
  const { token, newPassword } = req.body;

  const data = getResetToken(token);
  if (!data) {
    return res.status(400).json({ ok: false, message: 'Token inválido ou expirado' });
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    const db = initDB(data.email);
    await Usuario.atualizarSenha(db, data.userId, hash);
    deleteResetToken(token);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err.message);
    return res.status(500).json({ ok: false });
  }
}

// ➤ Nova verificação de código simples (cadastro)
async function verifyCode(req, res) {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ message: 'Email ou código ausente.' });
  }

  const registro = pendentes.get(email);
  if (!registro) {
    return res
      .status(400)
      .json({ message: 'Nenhuma verificação pendente para este e-mail.' });
  }

  if (registro.codigo !== codigo) {
    return res.status(400).json({ message: 'Código incorreto.' });
  }

  // ✅ Cria banco e registra usuário já como verificado
  const db = initDB(email);
  const senhaHasheada = registro.senha;
  const agora = new Date().toISOString();

  const novo = await Usuario.create(db, {
    nome: registro.nome,
    nomeFazenda: registro.nomeFazenda,
    email,
    telefone: registro.telefone,
    senha: senhaHasheada,
    verificado: true,
    codigoVerificacao: null,
    perfil: 'funcionario',
    tipoConta: 'usuario',
  });

  await db
    .prepare(
      'UPDATE usuarios SET status = ?, plano = ?, dataCadastro = ? WHERE id = ?'
    )
    .run('ativo', 'gratis', agora, novo.id);

  pendentes.delete(email);

  return res
    .status(200)
    .json({ message: 'Usuário verificado e criado com sucesso.' });
}

module.exports = {
  cadastro,
  verificarEmail,
  verifyCode,
  login,
  dados,
  listarUsuarios,
  sendCode,
  forgotPassword,
  resetPassword,
  finalizarCadastro,
  inicializarAdmins,
};

async function inicializarAdmins(db) {
  const adminsPadrao = [
    {
      nome: "Administrador",
      nomeFazenda: "Sistema",
      email: "nandokkk@hotmail.com",
      telefone: "",
      senha: "admin123",
      plano: "admin",
      metodoPagamento: "nenhum",
    },
  ];

  for (const admin of adminsPadrao) {
    const existente = await Usuario.getByEmail(db, admin.email);
    if (!existente) {
      try {
        await Usuario.create(db, { ...admin, verificado: true });
        console.log(`✅ Admin criado: ${admin.email}`);
      } catch (err) {
        console.error(`❌ Erro ao criar admin ${admin.email}:`, err.message);
      }
    } else {
      if (!existente.verificado) {
        await Usuario.liberarAcesso(db, admin.email);
        console.log(`ℹ️ Admin existente atualizado como verificado: ${admin.email}`);
      } else {
        console.log(`ℹ️ Admin já existente: ${admin.email}`);
      }
    }
  }
}

