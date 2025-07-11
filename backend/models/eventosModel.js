function getAll(db, idProdutor) {
  return db.prepare('SELECT * FROM eventos WHERE idProdutor = ?').all(idProdutor);
}

function getByDate(db, data, idProdutor) {
  return db.prepare('SELECT * FROM eventos WHERE date = ? AND idProdutor = ?').all(data, idProdutor);
}

function getById(db, id, idProdutor) {
  return db.prepare('SELECT * FROM eventos WHERE id = ? AND idProdutor = ?').get(id, idProdutor);
}

function create(db, ev, idProdutor) {
  const stmt = db.prepare('INSERT INTO eventos (tipo, title, date, descricao, subtipo, prioridadeVisual, idProdutor) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const info = stmt.run(ev.tipo, ev.title, ev.date, ev.descricao, ev.subtipo, ev.prioridadeVisual ? 1 : 0, idProdutor);
  return getById(db, info.lastInsertRowid, idProdutor);
}

function remove(db, id, idProdutor) {
  return db.prepare('DELETE FROM eventos WHERE id = ? AND idProdutor = ?').run(id, idProdutor);
}

module.exports = { getAll, getByDate, getById, create, remove };
