// backend/routes/animaisRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/autenticarToken');
const animaisController = require('../controllers/animaisController');
const { initDB } = require('../db');
const animaisModel = require('../models/animaisModel');

// ✅ Aplica autenticação em todas as rotas
router.use(authMiddleware);

// 🔎 Listar todos os animais
router.get('/', animaisController.listarAnimais);

// 🔎 Buscar por número (deve vir antes do :id)
router.get('/numero/:numero', (req, res) => {
  const db = initDB(req.user.email);
  try {
    const animal = animaisModel.getByNumero(
      db,
      parseInt(req.params.numero),
      req.user.idProdutor
    );
    if (!animal) return res.status(404).json({ message: 'Animal não encontrado' });
    res.json(animal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar animal por número' });
  }
});

// 🔎 Buscar por ID
router.get('/:id', animaisController.buscarAnimalPorId);

// ➕ Cadastrar novo animal
router.post('/', animaisController.adicionarAnimal);

// ✏️ Editar animal
router.put('/:id', animaisController.editarAnimal);

// ❌ Excluir animal
router.delete('/:id', animaisController.excluirAnimal);

module.exports = router;