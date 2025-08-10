const db = require('./dbAdapter');
const animaisModel = require('../models/animaisModel');
const PRODUTOR_ID = 1;

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

function shouldPromoteToPreParto(animal, today = new Date(), windowDays = +process.env.PREPARTO_WINDOW_DAYS || 21) {
  if (!animal?.previsaoParto) return false;
  const dpp = new Date(animal.previsaoParto);
  const limite = new Date(dpp); limite.setDate(limite.getDate() - windowDays);
  return animal.estado === 'gestante' && today >= limite;
}

async function promoteToPrePartoIfDue(id) {
  const a = await this.getById(id); // garantir que addDerived esteja ativo
  if (!a) return {updated:false};
  if (!shouldPromoteToPreParto(a)) return {updated:false};
  await animaisModel.updateEstado(db.getDb(), id, 'preparto');
  return {updated:true, id};
}

async function promoteBatchPreParto(today = new Date()) {
  const gestantes = await animaisModel.getByEstado(db.getDb(), 'gestante');
  const ids = [];
  for (const g of gestantes) {
    if (shouldPromoteToPreParto(g, today)) {
      await animaisModel.updateEstado(db.getDb(), g.id, 'preparto');
      ids.push(g.id);
    }
  }
  return {count: ids.length, ids};
}

function list(params = {}) {
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
  shouldPromoteToPreParto,
  promoteToPrePartoIfDue,
  promoteBatchPreParto,
};
