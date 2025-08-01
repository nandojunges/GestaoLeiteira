function padronizarDadosAnimal(animal = {}) {
  if (!animal || typeof animal !== 'object') return {};

  if (animal.ultimo_parto !== undefined && animal.ultimoParto === undefined) {
    animal.ultimoParto = animal.ultimo_parto;
  }
  if (animal.ultima_inseminacao !== undefined && animal.ultimaIA === undefined) {
    animal.ultimaIA = animal.ultima_inseminacao;
  }
  if (animal.numero_partos !== undefined && animal.numeroPartos === undefined) {
    animal.numeroPartos = animal.numero_partos;
  }

  const campos = [
    'ultimoParto',
    'ultimaIA',
    'numeroPartos',
    'del',
    'nLactacoes',
  ];

  for (const campo of campos) {
    if (!(campo in animal)) {
      animal[campo] = null;
    }
  }

  return animal;
}

function padronizarListaAnimais(lista = []) {
  return (lista || []).map(padronizarDadosAnimal);
}

module.exports = { padronizarDadosAnimal, padronizarListaAnimais };
