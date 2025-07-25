// backend/models/Usuario.js
const fs = require('fs');
const path = require('path');
const { getUserDir } = require('../db');

function dirSemCriar(email) {
  return path.join(__dirname, '..', 'data', email.replace(/[@.]/g, '_'));
}

function getAll(db) {
  return db
    .prepare(`
      SELECT
        id,
        nome,
        nomeFazenda,
        email,
        telefone,
        verificado,
        perfil
      FROM usuarios
    `)
    .all();
}

function create(db, usuario) {
  const stmt = db.prepare(`
    INSERT INTO usuarios (
      nome,
      nomeFazenda,
      email,
      telefone,
      senha,
      verificado,
      codigoVerificacao,
      perfil,
      tipoConta
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    usuario.nome,
    usuario.nomeFazenda,
    usuario.email,
    usuario.telefone,
    usuario.senha,
    usuario.verificado ? 1 : 0,
    usuario.codigoVerificacao,
    usuario.perfil || 'funcionario', // padrão
    usuario.tipoConta || usuario.perfil || 'usuario'
  );

  const novo = getById(db, info.lastInsertRowid);
  try {
    const dir = getUserDir(usuario.email);
    fs.writeFileSync(
      path.join(dir, 'usuario.json'),
      JSON.stringify({ id: novo.id, email: novo.email }, null, 2)
    );
  } catch (err) {
    console.error('Erro ao criar usuario.json:', err.message);
  }

  return novo;
}

function getByEmail(db, email) {
  console.log('🔍 Verificando usuário pelo e-mail:', email);
  const stmt = db.prepare('SELECT * FROM usuarios WHERE email = ?');
  const usuario = stmt.get(email);
  console.log('📦 Retorno do banco:', usuario);
  return usuario;
}

function existeNoBanco(db, email) {
  return db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
}

function getById(db, id) {
  return db
    .prepare('SELECT * FROM usuarios WHERE id = ?')
    .get(id);
}

function marcarVerificado(db, id) {
  db
    .prepare('UPDATE usuarios SET verificado = 1, codigoVerificacao = NULL WHERE id = ?')
    .run(id);
}

// Marca usuário como verificado usando o e-mail
function marcarComoVerificado(db, email) {
  db
    .prepare('UPDATE usuarios SET verificado = 1, codigoVerificacao = NULL WHERE email = ?')
    .run(email);
}

function definirCodigo(db, id, codigo) {
  db
    .prepare('UPDATE usuarios SET codigoVerificacao = ? WHERE id = ?')
    .run(codigo, id);
}

function atualizarSenha(db, id, senha) {
  db
    .prepare('UPDATE usuarios SET senha = ?, codigoVerificacao = NULL WHERE id = ?')
    .run(senha, id);
}

// ==== Funções Admin ====

function liberarAcesso(db, email) {
  const result = db
    .prepare('UPDATE usuarios SET verificado = 1 WHERE email = ?')
    .run(email);

  return result.changes > 0;
}

function bloquearConta(db, email) {
  const result = db
    .prepare('UPDATE usuarios SET verificado = 0 WHERE email = ?')
    .run(email);

  return result.changes > 0;
}

function atualizarPlano(db, email, plano) {
  const result = db
    .prepare('UPDATE usuarios SET perfil = ? WHERE email = ?')
    .run(plano, email);

  return result.changes > 0;
}

function excluir(db, email) {
  const result = db
    .prepare('DELETE FROM usuarios WHERE email = ?')
    .run(email);

  return result.changes > 0;
}

// (Opcional) Corrige perfis antigos com valor 'usuario'
function corrigirPerfisAntigos(db) {
  return db
    .prepare("UPDATE usuarios SET perfil = 'funcionario' WHERE perfil = 'usuario'")
    .run();
}

module.exports = {
  getAll,
  create,
  getByEmail,
  getById,
  marcarVerificado,
  definirCodigo,
  atualizarSenha,
  liberarAcesso,
  bloquearConta,
  atualizarPlano,
  excluir,
  existeNoBanco,
  corrigirPerfisAntigos, // <-- incluído para correção de base antiga
  marcarComoVerificado,
};
