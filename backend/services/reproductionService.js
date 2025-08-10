const db = require('./dbAdapter');
const eventosModel = require('../models/eventosModel');

function registrarInseminacao(idAnimal, dados) {
  return eventosModel.create(
    db.getDb(),
    { animal_id: idAnimal, dataEvento: dados.data, tipoEvento: 'INSEMINACAO', descricao: dados.descricao || '' },
    dados.idProdutor || null,
  );
}

function registrarDiagnostico(idAnimal, dados) {
  return eventosModel.create(
    db.getDb(),
    { animal_id: idAnimal, dataEvento: dados.data, tipoEvento: 'DIAGNOSTICO', descricao: dados.descricao || '' },
    dados.idProdutor || null,
  );
}

function registrarParto(idAnimal, dados) {
  return eventosModel.create(
    db.getDb(),
    { animal_id: idAnimal, dataEvento: dados.data, tipoEvento: 'PARTO', descricao: dados.descricao || '' },
    dados.idProdutor || null,
  );
}

function registrarSecagem(idAnimal, dados) {
  return eventosModel.create(
    db.getDb(),
    { animal_id: idAnimal, dataEvento: dados.data, tipoEvento: 'SECAGEM', descricao: dados.descricao || '' },
    dados.idProdutor || null,
  );
}

function listarHistorico(idAnimal) {
  const todos = eventosModel.getByAnimal(db.getDb(), idAnimal, null);
  const tipos = ['INSEMINACAO', 'DIAGNOSTICO', 'PARTO', 'SECAGEM'];
  return todos.filter((e) => tipos.includes(e.tipoEvento));
}

module.exports = {
  registrarInseminacao,
  registrarDiagnostico,
  registrarParto,
  registrarSecagem,
  listarHistorico,
};
