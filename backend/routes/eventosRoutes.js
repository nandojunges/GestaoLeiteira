const express = require('express');
const router = express.Router();
const Eventos = require('../models/eventosModel');
const { initDB } = require('../db');
const autenticarToken = require('../middleware/autenticarToken');

router.use(autenticarToken);

router.get('/', (req, res) => {
  const { data } = req.query;
  const db = initDB(req.user.email);
  if (data) return res.json(Eventos.getByDate(db, data, req.user.idProdutor));
  res.json(Eventos.getAll(db, req.user.idProdutor));
});

router.post('/', (req, res) => {
  const db = initDB(req.user.email);
  const evento = Eventos.create(db, req.body, req.user.idProdutor);
  res.status(201).json(evento);
});

router.delete('/:id', (req, res) => {
  const db = initDB(req.user.email);
  Eventos.remove(db, parseInt(req.params.id), req.user.idProdutor);
  res.status(204).end();
});

module.exports = router;
