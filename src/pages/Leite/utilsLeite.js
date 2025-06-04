// src/pages/Leite/utilsLeite.js

export function calcularTotalOrdenha(manha, tarde, terceira) {
  const m = parseFloat(manha || 0);
  const t = parseFloat(tarde || 0);
  const tr = parseFloat(terceira || 0);
  return (m + t + tr).toFixed(1);
}

export function calcularMediaMensal(medicoes = []) {
  if (medicoes.length === 0) return 0;

  const total = medicoes.reduce((acc, m) => {
    const soma = parseFloat(m.manha || 0) + parseFloat(m.tarde || 0) + parseFloat(m.terceira || 0);
    return acc + soma;
  }, 0);

  return (total / medicoes.length).toFixed(1);
}
