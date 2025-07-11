const { getDb } = require('../db');

function create(produtor) {
  const db = getDb();
  const stmt = db.prepare(`INSERT INTO produtores (nome, email, senha, emailVerificado, codigoVerificacao, status) VALUES (?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(
    produtor.nome,
    produtor.email,
    produtor.senha,
    produtor.emailVerificado ? 1 : 0,
    produtor.codigoVerificacao,
    produtor.status || 'ativo'
  );
  return getById(info.lastInsertRowid);
}

function getByEmail(email) {
  const db = getDb();
  return db.prepare('SELECT * FROM produtores WHERE email = ?').get(email);
}

function getById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM produtores WHERE id = ?').get(id);
}

function marcarVerificado(id) {
  const db = getDb();
  db.prepare('UPDATE produtores SET emailVerificado = 1, codigoVerificacao = NULL WHERE id = ?').run(id);
}

function definirCodigo(id, codigo) {
  const db = getDb();
  db.prepare('UPDATE produtores SET codigoVerificacao = ? WHERE id = ?').run(codigo, id);
}

function atualizarSenha(id, senha) {
  const db = getDb();
  db.prepare('UPDATE produtores SET senha = ?, codigoVerificacao = NULL WHERE id = ?').run(senha, id);
}

function getAll() {
  const db = getDb();
  return db.prepare('SELECT * FROM produtores').all();
}

function getAllComFazendas() {
  const db = getDb();
  return db.prepare(`
    SELECT p.id, p.nome, p.email, p.status,
           f.id AS fazendaId, f.nome AS fazendaNome, f.limiteAnimais,
           (SELECT COUNT(*) FROM animais a WHERE a.idProdutor = p.id) AS totalAnimais
      FROM produtores p
      LEFT JOIN fazendas f ON f.idProdutor = p.id
  `).all();
}

function updateStatus(id, status) {
  const db = getDb();
  db.prepare('UPDATE produtores SET status = ? WHERE id = ?').run(status, id);
  return getById(id);
}

module.exports = {
  create,
  getByEmail,
  getById,
  marcarVerificado,
  getAll,
  getAllComFazendas,
  updateStatus,
  definirCodigo,
  atualizarSenha,
};
