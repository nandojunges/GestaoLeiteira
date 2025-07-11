function getAll(db, idProdutor) {
  return db
    .prepare('SELECT * FROM tarefas WHERE idProdutor = ?')
    .all(idProdutor);
}

function getById(db, id, idProdutor) {
  return db
    .prepare('SELECT * FROM tarefas WHERE id = ? AND idProdutor = ?')
    .get(id, idProdutor);
}

function create(db, tarefa, idProdutor) {
  const stmt = db.prepare(`
    INSERT INTO tarefas (descricao, data, concluida, idProdutor)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(
    tarefa.descricao,
    tarefa.data,
    tarefa.concluida ? 1 : 0,
    idProdutor
  );

  return getById(db, info.lastInsertRowid, idProdutor);
}

function update(db, id, tarefa, idProdutor) {
  const stmt = db.prepare(`
    UPDATE tarefas
    SET descricao = ?, data = ?, concluida = ?
    WHERE id = ? AND idProdutor = ?
  `);
  stmt.run(
    tarefa.descricao,
    tarefa.data,
    tarefa.concluida ? 1 : 0,
    id,
    idProdutor
  );

  return getById(db, id, idProdutor);
}

function remove(db, id, idProdutor) {
  return db
    .prepare('DELETE FROM tarefas WHERE id = ? AND idProdutor = ?')
    .run(id, idProdutor);
}

module.exports = { getAll, getById, create, update, remove };
