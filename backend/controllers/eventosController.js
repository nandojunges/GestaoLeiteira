const { initDB } = require('../db');
const Eventos = require('../models/eventosModel');
function listarPorAnimal(req, res) {
  const db = initDB(req.user.email);
  const { idAnimal } = req.params;
  try {
    const eventos = Eventos.getByAnimal(db, idAnimal, req.user.idProdutor);
    res.json(eventos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar eventos' });
  }
}
module.exports = { listarPorAnimal };
