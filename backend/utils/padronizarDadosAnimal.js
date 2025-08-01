function padronizarDadosAnimal(animal) {
  return {
    ...animal,
    del: animal.del ?? null,
    ultimoParto: animal.ultimoParto ?? null,
    ultimaIA: animal.ultimaIA ?? null,
    numeroPartos: animal.numeroPartos ?? null,
    categoria: animal.categoria ?? null,
    origem: animal.origem ?? null,
    brinco: animal.brinco ?? null,
    idade: animal.idade ?? null,
    racas: animal.racas ?? null,
    partos: animal.partos ?? [],
    inseminacoes: animal.inseminacoes ?? [],
    lactacoes: animal.lactacoes ?? [],
    peso: animal.peso ?? [],
    tratamentos: animal.tratamentos ?? [],
    ocorrencias: animal.ocorrencias ?? [],
    status: animal.status ?? 'ativo',
  };
}

module.exports = padronizarDadosAnimal;
