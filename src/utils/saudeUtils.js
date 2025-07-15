export function parseData(str) {
  if (!str || typeof str !== 'string' || !str.includes('/')) return null;
  const [d, m, y] = str.split('/');
  const dt = new Date(y, m - 1, d);
  return isNaN(dt) ? null : dt;
}

export function formatarData(data) {
  if (!data) return '';
  const d = data instanceof Date ? data : parseData(data);
  if (!d) return '';
  return d.toLocaleDateString('pt-BR');
}

export function calcularStatusSaude(ocorrencias = [], tratamentos = []) {
  const hoje = new Date();
  const datasTrat = tratamentos
    .map(t => parseData(t.data))
    .filter(Boolean)
    .sort((a, b) => b - a);
  if (datasTrat.length) {
    const diff = (hoje - datasTrat[0]) / (1000 * 60 * 60 * 24);
    if (diff <= 15) return 'tratamento';
  }
  const datasOc = ocorrencias
    .map(o => parseData(o.data))
    .filter(Boolean)
    .sort((a, b) => b - a);
  if (datasOc.length) {
    const diff = (hoje - datasOc[0]) / (1000 * 60 * 60 * 24);
    if (diff <= 30) return 'observacao';
  }
  return 'normal';
}

export function agruparEventos(ocorrencias = [], tratamentos = []) {
  const lista = [];
  ocorrencias.forEach(o => {
    const dt = parseData(o.data);
    if (dt) lista.push({ ...o, tipo: 'ocorrencia', dataObj: dt });
  });
  tratamentos.forEach(t => {
    const dt = parseData(t.data);
    if (dt) lista.push({ ...t, tipo: 'tratamento', dataObj: dt });
  });
  return lista.sort((a, b) => a.dataObj - b.dataObj);
}
