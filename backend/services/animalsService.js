const db = require('./dbAdapter');
const animaisModel = require('../models/animaisModel');
const PRODUTOR_ID = 1;

function getPrePartoWindow() {
  return parseInt(process.env.PREPARTO_WINDOW_DAYS || '21', 10);
}

function addDerived(animal) {
  if (!animal) return animal;
  const today = new Date();
  if (animal.parto) {
    const partoDate = new Date(animal.parto);
    const diff = Math.floor((today - partoDate) / (1000 * 60 * 60 * 24));
    animal.del = diff;
    const secagem = new Date(partoDate);
    secagem.setDate(secagem.getDate() + 305);
    animal.previsaoSecagem = secagem.toISOString().slice(0, 10);
  }
  if (animal.ultimaIA && !animal.previsaoParto) {
    const partoPrev = new Date(animal.ultimaIA);
    partoPrev.setDate(partoPrev.getDate() + 280);
    animal.previsaoParto = partoPrev.toISOString().slice(0, 10);
  }
  return animal;
}

function applyDerivedOnArray(array) {
  return (array || []).map(addDerived);
}

function shouldPromoteToPreParto(animal, today = new Date()) {
  if (!animal || animal.estado !== 'gestante' || !animal.previsaoParto) return false;
  const diff = (new Date(animal.previsaoParto) - today) / (1000 * 60 * 60 * 24);
  return diff <= getPrePartoWindow();
}

async function promoteToPrePartoIfDue(id, today = new Date()) {
  const atual = animaisModel.getById(db.getDb(), id, PRODUTOR_ID);
  if (shouldPromoteToPreParto(atual, today) && atual.estado !== 'preparto') {
    animaisModel.update(db.getDb(), id, { ...atual, estado: 'preparto' }, PRODUTOR_ID);
    return { id, promoted: true };
  }
  return { id, promoted: false };
}

async function promoteBatchPreParto(today = new Date()) {
  const todos = animaisModel.getAll(db.getDb(), PRODUTOR_ID) || [];
  const ids = [];
  for (const a of todos) {
    if (a.estado === 'gestante') {
      const res = await promoteToPrePartoIfDue(a.id, today);
      if (res.promoted) ids.push(a.id);
    }
  }
  return { count: ids.length, ids };
}

function tryTransitionPreParto() {
  promoteBatchPreParto();
}

function list(params = {}) {
  tryTransitionPreParto();
  let animais = animaisModel.getAll(db.getDb(), PRODUTOR_ID) || [];
  if (params.estado) {
    animais = animais.filter((a) => a.estado === params.estado);
  }
  return applyDerivedOnArray(animais);
}

function getById(id) {
  const animal = animaisModel.getById(db.getDb(), id, PRODUTOR_ID);
  return addDerived(animal);
}

function create(animal) {
  return animaisModel.create(db.getDb(), animal, PRODUTOR_ID);
}

function update(id, animal) {
  return animaisModel.update(db.getDb(), id, animal, PRODUTOR_ID);
}

function remove(id) {
  return animaisModel.remove(db.getDb(), id, PRODUTOR_ID);
}

function onInseminada(id, { data }) {
  const atual = animaisModel.getById(db.getDb(), id, PRODUTOR_ID) || {};
  const updateData = { ...atual, ultimaIA: data };
  if (data) {
    const prev = new Date(data);
    prev.setDate(prev.getDate() + 280);
    updateData.previsaoParto = prev.toISOString().slice(0, 10);
  }
  return animaisModel.update(db.getDb(), id, updateData, PRODUTOR_ID);
}

function onDiagnostico(id, { resultado, data }) {
  const atual = animaisModel.getById(db.getDb(), id, PRODUTOR_ID) || {};
  const updateData = {
    ...atual,
    diagnosticoGestacao: JSON.stringify({ resultado, data }),
    estado: resultado === 'positivo' ? 'gestante' : 'vazia',
  };
  return animaisModel.update(db.getDb(), id, updateData, PRODUTOR_ID);
}

function onPreParto(id) {
  const atual = animaisModel.getById(db.getDb(), id, PRODUTOR_ID) || {};
  return animaisModel.update(db.getDb(), id, { ...atual, estado: 'preparto' }, PRODUTOR_ID);
}

function onParto(id, data) {
  const atual = animaisModel.getById(db.getDb(), id, PRODUTOR_ID) || {};
  return animaisModel.update(db.getDb(), id, { ...atual, estado: 'lactante', parto: data }, PRODUTOR_ID);
}

function onSecagem(id, data) {
  const atual = animaisModel.getById(db.getDb(), id, PRODUTOR_ID) || {};
  return animaisModel.update(db.getDb(), id, { ...atual, estado: 'seca', secagem: data }, PRODUTOR_ID);
}

function onDescartar(id) {
  const atual = animaisModel.getById(db.getDb(), id, PRODUTOR_ID) || {};
  return animaisModel.update(db.getDb(), id, { ...atual, estado: 'inativa' }, PRODUTOR_ID);
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  applyDerivedOnArray,
  onInseminada,
  onDiagnostico,
  onPreParto,
  onParto,
  onSecagem,
  onDescartar,
  tryTransitionPreParto,
  shouldPromoteToPreParto,
  promoteToPrePartoIfDue,
  promoteBatchPreParto,
};
