const db = require('./dbAdapter');
const animaisModel = require('../models/animaisModel');

function list(idProdutor) {
  return animaisModel.getAll(db.getDb(), idProdutor);
}

function getById(id, idProdutor) {
  return animaisModel.getById(db.getDb(), id, idProdutor);
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
