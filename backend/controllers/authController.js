const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, one } = require('../db');
const { enviarCodigo } = require('../utils/email');
const { ensureUserDir } = require('../utils/userStorage');

const SECRET = process.env.JWT_SECRET || 'segredo';
const TTL_MIN = Number(process.env.VERIFICATION_TTL_MINUTES || 3);
const norm = (e) => String(e || '').trim().toLowerCase();

// ----------------------------- CADASTRO -----------------------------
async function cadastro(req, res) {
  const {
    nome,
    nomeFazenda,
    email,
    telefone,
    senha,
    plano: planoSolicitado,
    formaPagamento,
  } = req.body;

  const endereco = String(email || '').trim().toLowerCase();

  console.log('👤 [CADASTRO] payload recebido:', {
    nome, nomeFazenda, email: endereco, telefone,
    senhaLen: (senha || '').length, planoSolicitado, formaPagamento
  });

  if (!endereco || !endereco.includes('@')) {
    console.log('⛔ [CADASTRO] email inválido');
    return res.status(400).json({ message: 'Email inválido ou não informado.' });
  }
  if (!senha || senha.length < 4) {
    console.log('⛔ [CADASTRO] senha inválida');
    return res.status(400).json({ message: 'Senha inválida.' });
  }

  try {
    // remove pendências expiradas
    await run(
      'DELETE FROM verificacoes_pendentes WHERE criado_em < NOW() - ($1 * INTERVAL "1 minute")',
      [TTL_MIN]
    );

    // Já existe usuário?
    const u = await one('SELECT 1 FROM usuarios WHERE LOWER(email)=LOWER($1) LIMIT 1', [endereco]);
    console.log('🔎 [CADASTRO] existe em usuarios?', !!u);
    if (u) {
      return res.status(409).json({ message: 'Email já cadastrado.' });
    }

    // throttle de reenvio
    const pend = await one('SELECT criado_em FROM verificacoes_pendentes WHERE email=$1', [endereco]);
    if (pend) {
      const elapsed = Date.now() - new Date(pend.criado_em).getTime();
      console.log('⏱️ [CADASTRO] pendente há(ms):', elapsed);
      if (elapsed < TTL_MIN * 60 * 1000) {
        const retry = Math.ceil((TTL_MIN * 60 * 1000 - elapsed) / 1000);
        return res.status(409).json({
          message: 'Cadastro pendente de verificação.',
          retry_after_seconds: retry,
        });
      }
      await run('DELETE FROM verificacoes_pendentes WHERE email=$1', [endereco]);
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const senhaHash = await bcrypt.hash(senha, 10);

    await run(
      `CREATE TABLE IF NOT EXISTS verificacoes_pendentes (
        email TEXT PRIMARY KEY,
        codigo TEXT NOT NULL,
        nome TEXT,
        nome_fazenda TEXT,
        telefone TEXT,
        senha_hash TEXT,
        plano_solicitado TEXT,
        forma_pagamento TEXT,
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    );

    await run(
      `INSERT INTO verificacoes_pendentes (email, codigo, nome, nome_fazenda, telefone, senha_hash, plano_solicitado, forma_pagamento, criado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT (email) DO UPDATE SET
         codigo=EXCLUDED.codigo,
         nome=EXCLUDED.nome,
         nome_fazenda=EXCLUDED.nome_fazenda,
         telefone=EXCLUDED.telefone,
         senha_hash=EXCLUDED.senha_hash,
         plano_solicitado=EXCLUDED.plano_solicitado,
         forma_pagamento=EXCLUDED.forma_pagamento,
         criado_em=NOW()`,
      [endereco, codigo, nome || null, nomeFazenda || null, telefone || null, senhaHash, planoSolicitado || null, formaPagamento || null]
    );

    try {
      await enviarCodigo(endereco, codigo, TTL_MIN);
      console.log('✉️  [CADASTRO] e-mail enviado para', endereco);
    } catch (e) {
      await run('DELETE FROM verificacoes_pendentes WHERE email=$1', [endereco]);
      console.error('✉️  [CADASTRO] falha ao enviar e-mail:', e.message || e);
      return res.status(502).json({ message: 'Falha ao enviar e-mail de verificação.' });
    }

    return res.status(201).json({ message: 'Código enviado. Verifique o e-mail.' });
  } catch (error) {
    console.error('💥 [CADASTRO] erro inesperado:', error);
    return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
}

// ----------------------------- VERIFICAR CÓDIGO -----------------------------
async function verificarEmail(req, res) {
  const endereco = norm(req.body.email);
  const codigoDigitado = String(req.body.codigoDigitado || req.body.codigo || '').trim();

  if (!endereco || !codigoDigitado) return res.status(400).json({ erro: 'Email ou código inválido.' });

  try {
    const pend = await one('SELECT * FROM verificacoes_pendentes WHERE email=$1', [endereco]);
    if (!pend) return res.status(400).json({ erro: 'Código não encontrado. Faça o cadastro novamente.' });

    const expirado = Date.now() - new Date(pend.criado_em).getTime() > TTL_MIN * 60 * 1000;
    if (expirado) {
      await run('DELETE FROM verificacoes_pendentes WHERE email=$1', [endereco]);
      return res.status(400).json({ erro: 'Código expirado. Faça o cadastro novamente.' });
    }

    if (pend.codigo !== codigoDigitado) return res.status(400).json({ erro: 'Código incorreto.' });

    const listaAdmins = require('../config/admins');
    const tipoConta = (listaAdmins || []).includes(endereco) ? 'admin' : 'usuario';
    const perfil = tipoConta === 'admin' ? 'admin' : 'funcionario';
    const nowIso = new Date().toISOString();

    const novo = await one(
      `INSERT INTO usuarios (nome, nomefazenda, email, telefone, senha, verificado, codigoverificacao,
                             perfil, tipoconta, plano, planosolicitado, formapagamento, datacadastro, status)
       VALUES ($1,$2,$3,$4,$5,true,null,$6,$7,'gratis',$8,$9,$10,'ativo')
       RETURNING id`,
      [
        pend.nome || '',
        pend.nome_fazenda || '',
        endereco,
        pend.telefone || '',
        pend.senha_hash,
        perfil,
        tipoConta,
        pend.plano_solicitado || null,
        pend.forma_pagamento || null,
        nowIso
      ]
    );

    await run('DELETE FROM verificacoes_pendentes WHERE email=$1', [endereco]);

    const dir = ensureUserDir(endereco);
    console.log('📁 Pasta do usuário pronta:', dir);

    return res.json({ sucesso: true, id: novo.id });
  } catch (err) {
    console.error('Erro na verificação:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

// ----------------------------- FINALIZAR CADASTRO (opcional) -----------------------------
async function finalizarCadastro(req, res) {
  const { token, plano, formaPagamento } = req.body;
  if (!token || !plano) return res.status(400).json({ erro: 'Dados inválidos.' });

  let payload;
  try {
    payload = jwt.verify(token, SECRET);
  } catch {
    return res.status(400).json({ erro: 'Token inválido.' });
  }

  const email = norm(payload.email);
  try {
    const u = await one('SELECT id FROM usuarios WHERE LOWER(email)=LOWER($1)', [email]);
    if (!u) return res.status(400).json({ erro: 'Usuário não encontrado.' });

    await run(
      `UPDATE usuarios
         SET plano=$1,
             formapagamento=CASE WHEN $1='teste_gratis' THEN NULL ELSE $2 END
       WHERE id=$3`,
      [plano, formaPagamento || null, u.id]
    );

    return res.json({ sucesso: true });
  } catch (err) {
    console.error('Erro ao finalizar cadastro:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

// ----------------------------- LOGIN -----------------------------
async function login(req, res) {
  const email = norm(req.body.email);
  const senha = String(req.body.senha || '');

  try {
    const usuario = await one('SELECT * FROM usuarios WHERE LOWER(email)=LOWER($1)', [email]);
    if (!usuario) return res.status(400).json({ message: 'Usuário não encontrado.' });
    if (!usuario.verificado) return res.status(403).json({ erro: 'Usuário não verificado. Confirme seu e-mail.' });

    const ok = await bcrypt.compare(senha, usuario.senha);
    if (!ok) return res.status(400).json({ message: 'Senha incorreta.' });

    const token = jwt.sign(
      { email, idProdutor: usuario.id, perfil: usuario.perfil, tipoConta: usuario.tipoconta },
      SECRET,
      { expiresIn: '2h' }
    );

    return res.status(200).json({ token });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ message: 'Erro no login.' });
  }
}

// ----------------------------- DADOS/LISTAGEM -----------------------------
async function dados(req, res) {
  try {
    const usuario = await one('SELECT id, nome, nomefazenda, email, telefone, perfil FROM usuarios WHERE id=$1', [req.user.idProdutor]);
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        nomeFazenda: usuario.nomefazenda,
        email: usuario.email,
        telefone: usuario.telefone,
        isAdmin: (req.user.perfil === 'admin'),
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erro ao carregar dados.' });
  }
}

async function listarUsuarios(req, res) {
  try {
    const rows = await run('SELECT id, nome, nomefazenda, email, telefone, perfil FROM usuarios ORDER BY id DESC', []);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

// ----------------------------- RESET DE SENHA -----------------------------
async function solicitarReset(req, res) {
  const email = norm(req.body.email);
  if (!email) return res.status(400).json({ message: 'Email inválido.' });

  const usuario = await one('SELECT id FROM usuarios WHERE LOWER(email)=LOWER($1)', [email]);
  if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();

  await run(
    `INSERT INTO verificacoes_pendentes (email, codigo, criado_em)
     VALUES ($1,$2,NOW())
     ON CONFLICT (email) DO UPDATE SET codigo=EXCLUDED.codigo, criado_em=NOW()`,
    [email, codigo]
  );

  try {
    await enviarCodigo(email, codigo);
    res.json({ message: 'Código enviado ao e-mail.' });
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err);
    res.status(500).json({ message: 'Erro ao enviar código.' });
  }
}

async function resetarSenha(req, res) {
  const email = norm(req.body.email);
  const codigo = String(req.body.codigo || '').trim();
  const senha = String(req.body.senha || '');

  if (!email || !codigo || !senha) return res.status(400).json({ message: 'Dados inválidos.' });

  const pend = await one('SELECT codigo FROM verificacoes_pendentes WHERE email=$1', [email]);
  if (!pend || pend.codigo !== codigo) return res.status(400).json({ message: 'Código inválido.' });

  const hash = await bcrypt.hash(senha, 10);
  await run('UPDATE usuarios SET senha=$1 WHERE LOWER(email)=LOWER($2)', [hash, email]);
  await run('DELETE FROM verificacoes_pendentes WHERE email=$1', [email]);

  res.json({ message: 'Senha atualizada com sucesso.' });
}

module.exports = {
  cadastro,
  verificarEmail,
  finalizarCadastro,
  login,
  dados,
  listarUsuarios,
  solicitarReset,
  resetarSenha,
};
