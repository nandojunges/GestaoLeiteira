const db = require('./dbAdapter');
const eventosModel = require('../models/eventosModel');

function registrarOcorrencia(idAnimal, dados) {
  return eventosModel.create(
    db.getDb(),
    { animal_id: idAnimal, dataEvento: dados.data, tipoEvento: 'OCORRENCIA', descricao: dados.descricao || '' },
    dados.idProdutor || null,
  );
}

function registrarTratamento(idAnimal, dados) {
  return eventosModel.create(
    db.getDb(),
    { animal_id: idAnimal, dataEvento: dados.data, tipoEvento: 'TRATAMENTO', descricao: dados.descricao || '' },
    dados.idProdutor || null,
  );
}

function listarHistorico(idAnimal) {
  const todos = eventosModel.getByAnimal(db.getDb(), idAnimal, null);
  const tipos = ['OCORRENCIA', 'TRATAMENTO'];
  return todos.filter((e) => tipos.includes(e.tipoEvento));
}

module.exports = {
  registrarOcorrencia,
  registrarTratamento,
  listarHistorico,
};
