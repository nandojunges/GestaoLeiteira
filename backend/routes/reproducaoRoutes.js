const express = require('express');
const router = express.Router();
const Reproducao = require('../models/reproducaoModel');
const { initDB } = require('../db');
const autenticarToken = require('../middleware/autenticarToken');

router.use(autenticarToken);

router.get('/:numero', (req, res) => {
  const db = initDB(req.user.email);
  const dados = Reproducao.getReproducaoAnimal(db, req.params.numero, req.user.idProdutor);
  res.json(dados);
});

router.post('/', (req, res) => {
  const db = initDB(req.user.email);
  const dados = Reproducao.registrarIA(db, req.body, req.user.idProdutor);
  res.status(201).json(dados);
});

router.post('/diagnostico', (req, res) => {
  const db = initDB(req.user.email);
  const dados = Reproducao.registrarDiagnostico(db, req.body, req.user.idProdutor);
  res.status(201).json(dados);
});

module.exports = router;
