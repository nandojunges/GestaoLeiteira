const express = require('express');
const router = express.Router();
const Produtos = require('../models/produtosModel');
const { initDB } = require('../db');
const autenticarToken = require('../middleware/autenticarToken');

router.use(autenticarToken);

router.get('/', (req, res) => {
  const db = initDB(req.user.email);
  res.json(Produtos.getAll(db, req.user.idProdutor));
});

router.get('/:id', (req, res) => {
  const db = initDB(req.user.email);
  const item = Produtos.getById(db, parseInt(req.params.id), req.user.idProdutor);
  if (!item) return res.status(404).json({ message: 'Produto not found' });
  res.json(item);
});

router.post('/', (req, res) => {
  const db = initDB(req.user.email);
  const item = Produtos.create(db, req.body, req.user.idProdutor);
  res.status(201).json(item);
});

router.put('/:id', (req, res) => {
  const db = initDB(req.user.email);
  const item = Produtos.update(db, parseInt(req.params.id), req.body, req.user.idProdutor);
  res.json(item);
});

router.delete('/:id', (req, res) => {
  const db = initDB(req.user.email);
  Produtos.remove(db, parseInt(req.params.id), req.user.idProdutor);
  res.status(204).end();
});

module.exports = router;
