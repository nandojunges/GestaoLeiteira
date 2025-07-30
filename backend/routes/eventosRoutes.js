const express = require('express');
const router = express.Router();
const autenticarToken = require('../middleware/autenticarToken');
const controller = require('../controllers/eventosController');
// Lista eventos do animal (linha do tempo)
router.get('/:animal_id', autenticarToken, controller.listarPorAnimal);
module.exports = router;
