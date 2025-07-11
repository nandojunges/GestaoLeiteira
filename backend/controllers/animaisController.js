const { initDB } = require('../db');
const animaisModel = require('../models/animaisModel');

// Listar todos os animais do usuário logado
async function listarAnimais(req, res) {
  const db = initDB(req.user.email);

  try {
    const animais = animaisModel.getAll(db, req.user.idProdutor);
    res.json(animais);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar animais' });
  }
}

// Buscar animal por ID
async function buscarAnimalPorId(req, res) {
  const db = initDB(req.user.email);
  const id = req.params.id;

  try {
    const animal = animaisModel.getById(db, parseInt(id), req.user.idProdutor);
    if (!animal) return res.status(404).json({ message: 'Animal não encontrado' });
    res.json(animal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar animal' });
  }
}

// Cadastrar novo animal
async function cadastrarAnimal(req, res) {
  const db = initDB(req.user.email);
  const novoAnimal = { ...req.body, idProdutor: req.user.idProdutor };

  try {
    const animalCriado = animaisModel.create(db, novoAnimal, req.user.idProdutor);
    res.status(201).json(animalCriado);
  } catch (error) {
    console.error('Erro ao cadastrar animal:', error);
    res.status(500).json({ message: 'Erro ao cadastrar animal', erro: error.message });
  }
}

// Editar animal existente
async function editarAnimal(req, res) {
  const db = initDB(req.user.email);
  const id = req.params.id;
  const dadosAtualizados = req.body;

  try {
    const animalAtualizado = animaisModel.update(db, id, dadosAtualizados, req.user.idProdutor);
    res.json(animalAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao editar animal' });
  }
}

// Remover animal
async function excluirAnimal(req, res) {
  const db = initDB(req.user.email);
  const id = req.params.id;

  try {
    animaisModel.remove(db, id, req.user.idProdutor);
    res.json({ message: 'Animal removido com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao excluir animal' });
  }
}

module.exports = {
  listarAnimais,
  buscarAnimalPorId,
  cadastrarAnimal,
  adicionarAnimal: cadastrarAnimal,
  editarAnimal,
  excluirAnimal,
};