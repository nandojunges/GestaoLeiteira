// Modelo para eventos (linha do tempo dos animais)
function create(db, dados, idProdutor) {
  const stmt = db.prepare(`
    INSERT INTO eventos (animal_id, dataEvento, tipoEvento, descricao, idProdutor)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    dados.animal_id,
    dados.dataEvento,
    dados.tipoEvento,
    dados.descricao || '',
    idProdutor
  );
  return { id: info.lastInsertRowid, ...dados, idProdutor };
}
function getByAnimal(db, animal_id, idProdutor) {
  return db.prepare(`
    SELECT * FROM eventos WHERE animal_id = ? AND idProdutor = ?
    ORDER BY dataEvento DESC
  `).all(animal_id, idProdutor);
}
module.exports = { create, getByAnimal };
