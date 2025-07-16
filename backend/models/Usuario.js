// backend/models/Usuario.js

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

  return getById(db, info.lastInsertRowid);
}

function getByEmail(db, email) {
  return db
    .prepare('SELECT * FROM usuarios WHERE email = ?')
    .get(email);
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
  corrigirPerfisAntigos, // <-- incluído para correção de base antiga
};
