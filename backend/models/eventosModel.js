// Modelo para eventos (linha do tempo dos animais)
function create(db, dados, idProdutor) {
  const stmt = db.prepare(`
    INSERT INTO eventos (idAnimal, dataEvento, tipoEvento, descricao, idProdutor)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    dados.idAnimal,
    dados.dataEvento,
    dados.tipoEvento,
    dados.descricao || '',
    idProdutor
  );
  return { id: info.lastInsertRowid, ...dados, idProdutor };
}
function getByAnimal(db, idAnimal, idProdutor) {
  return db.prepare(`
    SELECT * FROM eventos WHERE idAnimal = ? AND idProdutor = ?
    ORDER BY dataEvento DESC
  `).all(idAnimal, idProdutor);
}
module.exports = { create, getByAnimal };
