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
      perfil
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    usuario.nome,
    usuario.nomeFazenda,
    usuario.email,
    usuario.telefone,
    usuario.senha,
    usuario.verificado ? 1 : 0,
    usuario.codigoVerificacao,
    usuario.perfil || 'usuario'
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

module.exports = {
  getAll,
  create,
  getByEmail,
  getById,
  marcarVerificado,
  definirCodigo,
  atualizarSenha,
};
