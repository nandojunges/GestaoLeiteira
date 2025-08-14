const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, getPool, ensureTenantSchema } = require('../db');
const { enviarCodigoVerificacao } = require('../utils/mailer');
const { requireFields, isEmail } = require('../utils/validate');

const SECRET = process.env.JWT_SECRET || 'segredo';

async function register(req, res, next) {
  try {
    const check = requireFields(req.body, ['nome', 'email', 'senha']);
    if (!check.ok) {
      return res.status(400).json({ ok: false, message: 'Campos obrigatórios ausentes', missing: check.missing });
    }
    const { nome, nomeFazenda, email, telefone, senha } = req.body;
    if (!isEmail(email)) {
      return res.status(400).json({ ok: false, message: 'Email inválido' });
    }
    const db = getDb();
    const existente = await db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
    if (existente) {
      return res.status(400).json({ ok: false, message: 'Email já cadastrado.' });
    }
    const hash = await bcrypt.hash(senha, 10);
    await db.prepare(`
      INSERT INTO usuarios (nome, nomeFazenda, email, telefone, senha, verificado)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(nome, nomeFazenda, email, telefone, hash, false);

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    await db.prepare(`
      UPDATE usuarios
         SET codigoverificacao = ?, verificado = ?
       WHERE email = ?
    `).run(codigo, false, email);

    try {
      await enviarCodigoVerificacao(email, codigo);
    } catch (e) {
      console.error('✉️  Falha ao enviar e-mail:', e);
      // não derrube o cadastro em DEV
    }

    return res.status(200).json({ ok: true, message: 'Cadastro recebido. Verifique seu e-mail.' });
  } catch (err) {
    next(err);
  }
}

async function verificarCodigo(req, res, next) {
  try {
    const { email, codigo } = req.body;
    const db = getDb();

    const row = await db
      .prepare('SELECT id, codigoverificacao, verificado FROM usuarios WHERE email = ?')
      .get(email);

    if (!row || row.codigoverificacao !== codigo) {
      return res.status(400).json({ ok: false, error: 'Código inválido.' });
    }

    await db
      .prepare('UPDATE usuarios SET verificado = ?, codigoverificacao = NULL WHERE email = ?')
      .run(true, email);

    // cria "pasta" no banco: schema por usuário
    await ensureTenantSchema(email, row.id);

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const db = getDb();
    const usuario = await db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
    if (!usuario) {
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }
    if (!usuario.verificado) {
      return res.status(403).json({ error: 'Usuário não verificado.' });
    }
    const match = await bcrypt.compare(senha, usuario.senha);
    if (!match) {
      return res.status(400).json({ message: 'Senha incorreta.' });
    }
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
    res.json({ token });
  } catch (err) {
    next(err);
  }
}

async function dados(req, res, next) {
  try {
    const db = getDb();
    const usuario = await db
      .prepare('SELECT id, nome, nomeFazenda, email, telefone, perfil FROM usuarios WHERE id = ?')
      .get(req.user.idProdutor);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
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
  } catch (err) {
    next(err);
  }
}

async function listarUsuarios(req, res, next) {
  try {
    const db = getDb();
    const usuarios = await db
      .prepare('SELECT id, nome, nomeFazenda, email, telefone, verificado, perfil FROM usuarios')
      .all();
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
}

async function inicializarAdmins(db = getDb()) {
  const adminsPadrao = [
    {
      nome: 'Administrador',
      nomeFazenda: 'Sistema',
      email: 'nandokkk@hotmail.com',
      telefone: '',
      senha: 'admin123',
    },
  ];

  for (const admin of adminsPadrao) {
    const existente = await db
      .prepare('SELECT id FROM usuarios WHERE email = ?')
      .get(admin.email);
    if (!existente) {
      const hash = await bcrypt.hash(admin.senha, 10);
      await db
        .prepare(
          `INSERT INTO usuarios (nome, nomeFazenda, email, telefone, senha, verificado, perfil, tipoConta)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          admin.nome,
          admin.nomeFazenda,
          admin.email,
          admin.telefone,
          hash,
          true,
          'admin',
          'admin'
        );
      console.log(`✅ Admin criado: ${admin.email}`);
    }
  }
}

module.exports = {
  register,
  verificarCodigo,
  login,
  dados,
  listarUsuarios,
  inicializarAdmins,
};
