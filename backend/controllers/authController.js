const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const VerificacaoPendente = require('../models/VerificacaoPendente');
const emailUtils = require('../utils/email');
const { initDB } = require('../db');

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
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  const agora = new Date().toISOString();

  if (!endereco || typeof endereco !== 'string') {
    return res.status(400).json({ message: 'Email inválido ou não informado.' });
  }

  const db = initDB(endereco);
  VerificacaoPendente.limparExpirados(db);

  try {
    if (Usuario.getByEmail(db, endereco)) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const hash = bcrypt.hashSync(senha, 10);
    const pendente = VerificacaoPendente.getByEmail(db, endereco);

    if (pendente) {
      const criado = new Date(pendente.criado_em);
      if (Date.now() - criado.getTime() < 3 * 60 * 1000) {
        return res.status(400).json({ message: 'Código já enviado. Aguarde o prazo para reenviar.' });
      }

      VerificacaoPendente.updateByEmail(db, endereco, {
        codigo,
        nome,
        nomeFazenda,
        telefone,
        senha: hash,
        planoSolicitado,
        formaPagamento,
        criado_em: agora,
      });
    } else {
      VerificacaoPendente.create(db, {
        email: endereco,
        codigo,
        nome,
        nomeFazenda,
        telefone,
        senha: hash,
        planoSolicitado,
        formaPagamento,
        criado_em: agora,
      });
    }

    await emailUtils.enviarCodigo(endereco, codigo);
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

  const db = initDB(endereco);

  try {
    const pendente = VerificacaoPendente.getByEmail(db, endereco);
    if (!pendente) {
      return res.status(400).json({ erro: 'Código não encontrado. Faça o cadastro novamente.' });
    }

    const expirado = Date.now() - new Date(pendente.criado_em).getTime() > 10 * 60 * 1000;
    if (expirado) {
      VerificacaoPendente.deleteByEmail(db, endereco);
      return res.status(400).json({ erro: 'Código expirado. Faça o cadastro novamente.' });
    }

    if (pendente.codigo !== codigoDigitado) {
      return res.status(400).json({ erro: 'Código incorreto.' });
    }

    if (Usuario.getByEmail(db, endereco)) {
      VerificacaoPendente.deleteByEmail(db, endereco);
      return res.status(400).json({ erro: 'Email já cadastrado.' });
    }

    if (pendente.planoSolicitado) {
      const listaAdmins = require('../config/admins');
      const tipoConta = listaAdmins.includes(pendente.email) ? 'admin' : 'usuario';
      const perfil = tipoConta === 'admin' ? 'admin' : 'funcionario';

      const novo = Usuario.create(db, {
        nome: pendente.nome,
        nomeFazenda: pendente.nomeFazenda,
        email: pendente.email,
        telefone: pendente.telefone,
        senha: pendente.senha,
        verificado: 1,
        codigoVerificacao: null,
        perfil,
        tipoConta,
      });

      const agora = new Date().toISOString();
      db.prepare(
        'UPDATE usuarios SET status = ?, planoSolicitado = ?, formaPagamento = ?, dataCadastro = ? WHERE id = ?'
      ).run(
        'pendente',
        pendente.planoSolicitado,
        pendente.planoSolicitado === 'teste_gratis' ? null : pendente.formaPagamento,
        agora,
        novo.id
      );

      VerificacaoPendente.deleteByEmail(db, endereco);
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
  const db = initDB(email);

  try {
    const pendente = VerificacaoPendente.getByEmail(db, email);
    if (!pendente) {
      return res.status(400).json({ erro: 'Cadastro não encontrado.' });
    }

    const listaAdmins = require('../config/admins');
    const tipoConta = listaAdmins.includes(email) ? 'admin' : 'usuario';
    const perfil = tipoConta === 'admin' ? 'admin' : 'funcionario';

    const novo = Usuario.create(db, {
      nome: pendente.nome,
      nomeFazenda: pendente.nomeFazenda,
      email: pendente.email,
      telefone: pendente.telefone,
      senha: pendente.senha,
      verificado: 1,
      codigoVerificacao: null,
      perfil,
      tipoConta,
    });

    const agora = new Date().toISOString();
    db.prepare(
      'UPDATE usuarios SET status = ?, planoSolicitado = ?, formaPagamento = ?, dataCadastro = ? WHERE id = ?'
    ).run('pendente', plano, plano === 'teste_gratis' ? null : formaPagamento, agora, novo.id);

    VerificacaoPendente.deleteByEmail(db, email);

    res.json({ sucesso: true });
  } catch (err) {
    console.error('Erro ao finalizar cadastro:', err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

// ➤ Login e geração do token JWT
function login(req, res) {
  const { email, senha } = req.body;

  if (!email || typeof email !== 'string' || !senha) {
    return res.status(400).json({ message: 'Email ou senha inválidos.' });
  }

  const db = initDB(email);
  const usuario = Usuario.getByEmail(db, email);

  if (!usuario) return res.status(400).json({ message: 'Usuário não encontrado' });
  if (!usuario.verificado) return res.status(400).json({ message: 'Email não verificado' });
  if (!bcrypt.compareSync(senha, usuario.senha)) {
    return res.status(400).json({ message: 'Senha incorreta' });
  }

  const listaAdmins = require('../config/admins');
  const isAdmin = usuario.tipoConta === 'admin' || listaAdmins.includes(email);

  if (!isAdmin) {
    if (usuario.status !== 'ativo' && usuario.status !== 'teste') {
      return res.status(403).json({ message: 'Aguardando liberação do plano.' });
    }
    if (
      usuario.status === 'teste' &&
      usuario.dataFimTeste &&
      new Date(usuario.dataFimTeste) < new Date()
    ) {
      db.prepare('UPDATE usuarios SET status = ? WHERE id = ?').run(
        'suspenso',
        usuario.id
      );
      usuario.status = 'suspenso';
    }

    if (usuario.status === 'suspenso') {
      return res.status(403).json({
        message: 'Sua conta está suspensa. Selecione um plano para continuar.'
      });
    }
  }

 const payload = {
  idProdutor: usuario.id,
  email: usuario.email,
  perfil: isAdmin ? 'admin' : (usuario.perfil || 'funcionario'),
};

  const token = jwt.sign(payload, SECRET, { expiresIn: '7d' });
  res.json({ token, isAdmin });
}

// ➤ Dados do usuário logado
function dados(req, res) {
  const db = initDB(req.user.email);
  const usuario = Usuario.getById(db, req.user.idProdutor);

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
function listarUsuarios(req, res) {
  const db = initDB(req.user.email);

  try {
    const usuarios = Usuario.getAll(db);
    res.json(usuarios);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

// ➤ Envia código para recuperação de senha
async function solicitarReset(req, res) {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email inválido.' });
  }
  const db = initDB(email);
  const usuario = Usuario.getByEmail(db, email);
  if (!usuario) return res.status(400).json({ message: 'Usuário não encontrado' });

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  Usuario.definirCodigo(db, usuario.id, codigo);
  try {
    await emailUtils.enviarCodigo(email, codigo);
    res.json({ message: 'Código enviado ao e-mail.' });
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err);
    res.status(500).json({ message: 'Erro ao enviar código.' });
  }
}

// ➤ Verifica código e redefine senha
function resetarSenha(req, res) {
  const { email, codigo, senha } = req.body;
  if (!email || !codigo || !senha) {
    return res.status(400).json({ message: 'Dados inválidos.' });
  }
  const db = initDB(email);
  const usuario = Usuario.getByEmail(db, email);
  if (!usuario || usuario.codigoVerificacao !== codigo) {
    return res.status(400).json({ message: 'Código inválido.' });
  }
  const hash = bcrypt.hashSync(senha, 10);
  Usuario.atualizarSenha(db, usuario.id, hash);
  res.json({ message: 'Senha atualizada com sucesso.' });
}

// ➤ Verifica código: usado para cadastro ou reset de senha
async function verificarCodigo(req, res) {
  if (req.body.senha) {
    return resetarSenha(req, res);
  }
  return verificarEmail(req, res);
}

module.exports = {
  cadastro,
  verificarEmail,
  login,
  dados,
  listarUsuarios,
  solicitarReset,
  resetarSenha,
  verificarCodigo,
  finalizarCadastro,
};