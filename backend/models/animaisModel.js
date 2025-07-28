function getAll(db, idProdutor) {
  return db.prepare('SELECT * FROM animais WHERE idProdutor = ?').all(idProdutor);
}

function getById(db, id, idProdutor) {
  return db.prepare('SELECT * FROM animais WHERE id = ? AND idProdutor = ?').get(id, idProdutor);
}

function getByNumero(db, numero, idProdutor) {
  return db.prepare('SELECT * FROM animais WHERE numero = ? AND idProdutor = ?').get(numero, idProdutor);
}

function create(db, animal, idProdutor) {
  const stmt = db.prepare(`
    INSERT INTO animais (
      numero, brinco, nascimento, sexo, origem,
      categoria, idade, raca,
      checklistVermifugado, checklistGrupoDefinido, fichaComplementarOK,
      pai, mae, ultimaIA, ultimoParto, nLactacoes,
      status, motivoSaida, dataSaida, valorVenda, observacoesSaida, tipoSaida,
      idProdutor
    ) VALUES (
      @numero, @brinco, @nascimento, @sexo, @origem,
      @categoria, @idade, @raca,
      @checklistVermifugado, @checklistGrupoDefinido, @fichaComplementarOK,
      @pai, @mae, @ultimaIA, @ultimoParto, @nLactacoes,
      @status, @motivoSaida, @dataSaida, @valorVenda, @observacoesSaida, @tipoSaida,
      @idProdutor
    )
  `);

  const dados = {
    numero: animal.numero || null,
    brinco: animal.brinco || '',
    nascimento: animal.nascimento || '',
    sexo: animal.sexo || '',
    origem: animal.origem || '',
    categoria: animal.categoria || '',
    idade: animal.idade || '',
    raca: animal.raca || '',
    checklistVermifugado: animal.checklistVermifugado ? 1 : 0,
    checklistGrupoDefinido: animal.checklistGrupoDefinido ? 1 : 0,
    fichaComplementarOK: animal.fichaComplementarOK ? 1 : 0,
    pai: animal.pai || '',
    mae: animal.mae || '',
    ultimaIA: animal.ultimaIA || '',
    ultimoParto: animal.ultimoParto || '',
    nLactacoes: animal.nLactacoes || null,
    status: animal.status || 'ativo',
    motivoSaida: animal.motivoSaida || null,
    dataSaida: animal.dataSaida || null,
    valorVenda: animal.valorVenda || null,
    observacoesSaida: animal.observacoesSaida || '',
    tipoSaida: animal.tipoSaida || null,
    idProdutor,
  };

  const info = stmt.run(dados);
  return getById(db, info.lastInsertRowid, idProdutor);
}

function update(db, id, animal, idProdutor) {
  const stmt = db.prepare(`
    UPDATE animais SET
      numero = ?, brinco = ?, nascimento = ?, sexo = ?, origem = ?,
      categoria = ?, idade = ?, raca = ?,
      checklistVermifugado = ?, checklistGrupoDefinido = ?, fichaComplementarOK = ?,
      pai = ?, mae = ?, ultimaIA = ?, ultimoParto = ?, nLactacoes = ?,
      status = ?, motivoSaida = ?, dataSaida = ?, valorVenda = ?, observacoesSaida = ?, tipoSaida = ?
    WHERE id = ? AND idProdutor = ?
  `);
  stmt.run(
    animal.numero,
    animal.brinco,
    animal.nascimento,
    animal.sexo,
    animal.origem,
    animal.categoria,
    animal.idade,
    animal.raca,
    animal.checklistVermifugado ? 1 : 0,
    animal.checklistGrupoDefinido ? 1 : 0,
    animal.fichaComplementarOK ? 1 : 0,
    animal.pai || '',
    animal.mae || '',
    animal.ultimaIA || '',
    animal.ultimoParto || '',
    animal.nLactacoes || null,
    animal.status || 'ativo',
    animal.motivoSaida || null,
    animal.dataSaida || null,
    animal.valorVenda || null,
    animal.observacoesSaida || null,
    animal.tipoSaida || null,
    id,
    idProdutor
  );
  return getById(db, id, idProdutor);
}

function getIdByNumero(db, numero, idProdutor) {
  const row = db.prepare('SELECT id FROM animais WHERE numero = ? AND idProdutor = ?').get(numero, idProdutor);
  return row ? row.id : null;
}

function updateByNumero(db, numero, animal, idProdutor) {
  const id = getIdByNumero(db, numero, idProdutor);
  if (!id) return null;
  return update(db, id, { ...animal, numero }, idProdutor);
}

function remove(db, id, idProdutor) {
  return db.prepare('DELETE FROM animais WHERE id = ? AND idProdutor = ?').run(id, idProdutor);
}

function countByProdutor(db, idProdutor) {
  const row = db.prepare('SELECT COUNT(*) as total FROM animais WHERE idProdutor = ?').get(idProdutor);
  return row ? row.total : 0;
}

// Atualiza o status de um animal (1=lactante, 2=seca, 0=inativo)
function updateStatus(db, id, status, idProdutor) {
  db.prepare(`UPDATE animais SET status = ? WHERE id = ? AND idProdutor = ?`).run(status, id, idProdutor);
}

// Incrementa o número de lactações de um animal
function incrementarLactacoes(db, id, idProdutor) {
  db.prepare(
    `UPDATE animais SET nLactacoes = COALESCE(nLactacoes, 0) + 1 WHERE id = ? AND idProdutor = ?`
  ).run(id, idProdutor);
}

// Cria uma nova bezerra com o próximo número sequencial
function createBezerra(db, dados, idProdutor) {
  const max = db.prepare('SELECT MAX(numero) as m FROM animais WHERE idProdutor = ?')
    .get(idProdutor)?.m || 0;
  const numeroNovo = max + 1;
  const stmt = db.prepare(`
    INSERT INTO animais (
      numero, brinco, nascimento, sexo, origem,
      categoria, idade, raca,
      checklistVermifugado, checklistGrupoDefinido, fichaComplementarOK,
      pai, mae, ultimaIA, ultimoParto, nLactacoes,
      status, motivoSaida, dataSaida, valorVenda, observacoesSaida, tipoSaida,
      previsaoParto, idProdutor
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?,
      1, null, null, null, null, null,
      null, ?
    )
  `);
  const info = stmt.run(
    numeroNovo,
    dados.brinco || '',
    dados.nascimento || '',
    dados.sexo || 'fêmea',
    dados.origem || 'nascido na propriedade',
    'Bezerra',
    dados.idade || '',
    dados.raca || '',
    0, 0, 0,
    dados.pai || '',
    dados.mae || '',
    null, null, 0,
    idProdutor
  );
  return { id: info.lastInsertRowid, numero: numeroNovo, idProdutor };
}

module.exports = {
  getAll,
  getById,
  getByNumero,
  create,
  update,
  updateByNumero,
  remove,
  countByProdutor,
  updateStatus,
  incrementarLactacoes,
  createBezerra,
};