const { initDB } = require('../db');
const Animais = require('../models/animaisModel');
const Eventos = require('../models/eventosModel');

// Listar todos os animais do usuário logado
async function listarAnimais(req, res) {
  const db = initDB(req.user.email);

  try {
    const animais = Animais.getAll(db, req.user.idProdutor);
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
    const animal = Animais.getById(db, parseInt(id), req.user.idProdutor);
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
    const animalCriado = Animais.create(db, novoAnimal, req.user.idProdutor);
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
  const dadosAtualizados = {
    ...req.body,
    // Se nenhum status for enviado, mantém o animal ativo (1)
    status: req.body.status ?? 1,
    motivoSaida: req.body.motivoSaida ?? null,
    dataSaida: req.body.dataSaida ?? null,
    valorVenda: req.body.valorVenda ?? null,
    observacoesSaida: req.body.observacoesSaida ?? null,
    // garante que o tipo de saída seja enviado à camada de modelo
    tipoSaida: req.body.tipoSaida ?? null,
  };

  try {
    const animalAtualizado = Animais.update(db, id, dadosAtualizados, req.user.idProdutor);
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
    Animais.remove(db, id, req.user.idProdutor);
    res.json({ message: 'Animal removido com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao excluir animal' });
  }
}

// Aplica secagem ao animal e registra evento
async function aplicarSecagem(req, res) {
  const db = initDB(req.user.email);
  const { id } = req.params;
  const { dataSecagem, plano } = req.body;
  try {
    Eventos.create(
      db,
      {
        idAnimal: id,
        dataEvento: dataSecagem,
        tipoEvento: 'Secagem',
        descricao: plano || '',
      },
      req.user.idProdutor
    );
    Animais.updateStatus(db, id, 2, req.user.idProdutor);
    res.status(200).json({ message: 'Secagem aplicada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao aplicar secagem' });
  }
}

// Registra parto, cria bezerra e atualiza dados
async function registrarParto(req, res) {
  const db = initDB(req.user.email);
  const { id } = req.params;
  const { dataParto, sexoBezerro } = req.body;
  try {
    Animais.incrementarLactacoes(db, id, req.user.idProdutor);
    Animais.updateStatus(db, id, 1, req.user.idProdutor);
    const novaBezerra = Animais.createBezerra(
      db,
      {
        nascimento: dataParto,
        sexo: sexoBezerro,
        mae: id,
      },
      req.user.idProdutor
    );
    Eventos.create(
      db,
      {
        idAnimal: id,
        dataEvento: dataParto,
        tipoEvento: 'Parto',
        descricao: `Bezerra ${novaBezerra.numero}`,
      },
      req.user.idProdutor
    );
    res.status(201).json({ message: 'Parto registrado', bezerra: novaBezerra });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao registrar parto' });
  }
}

module.exports = {
  listarAnimais,
  buscarAnimalPorId,
  cadastrarAnimal,
  adicionarAnimal: cadastrarAnimal,
  editarAnimal,
  excluirAnimal,
  aplicarSecagem,
  registrarParto,
};