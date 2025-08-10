const db = require('./dbAdapter');
const animaisModel = require('../models/animaisModel');

function addDerived(animal) {
  if (!animal) return animal;
  const today = new Date();
  const ultimaIA = animal.ultimaIA || animal.ultima_inseminacao;
  const ultimoParto = animal.ultimoParto || animal.ultimo_parto;

  if (ultimoParto) {
    const partoDate = new Date(ultimoParto);
    const diff = Math.floor((today - partoDate) / (1000 * 60 * 60 * 24));
    animal.del = diff;
    const secagem = new Date(partoDate);
    secagem.setDate(secagem.getDate() + 305);
    animal.previsaoSecagem = secagem.toISOString().slice(0, 10);
  }

  if (ultimaIA) {
    const partoPrev = new Date(ultimaIA);
    partoPrev.setDate(partoPrev.getDate() + 280);
    animal.previsaoParto = partoPrev.toISOString().slice(0, 10);
  }

  return animal;
}

function list(idProdutor) {
  const animais = animaisModel.getAll(db.getDb(), idProdutor) || [];
  return animais.map(addDerived);
}

function getById(id, idProdutor) {
  const animal = animaisModel.getById(db.getDb(), id, idProdutor);
  return addDerived(animal);
}

function create(animal, idProdutor) {
  return animaisModel.create(db.getDb(), animal, idProdutor);
}

function update(id, animal, idProdutor) {
  return animaisModel.update(db.getDb(), id, animal, idProdutor);
}

function remove(id, idProdutor) {
  return animaisModel.remove(db.getDb(), id, idProdutor);
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
