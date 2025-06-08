export function inferirTipoUso(categoria) {
  if (["Ração", "Aditivos", "Suplementos", "Detergentes", "Ácido", "Alcalino", "Sanitizante"].includes(categoria)) {
    return "diario";
  }
  if (["Hormônio", "Antibiótico", "Antiparasitário", "AINE", "AIE"].includes(categoria)) {
    return "protocolo";
  }
  return "eventual";
}

function converterQuantidade(valor, unidadeOrigem, unidadeBase) {
  let q = parseFloat(valor) || 0;
  if (!unidadeOrigem || !unidadeBase) return q;
  const orig = unidadeOrigem.toLowerCase();
  const base = unidadeBase.toLowerCase();

  if (base.startsWith('l')) {
    if (orig === 'ml') return q / 1000;
    if (orig.startsWith('l')) return q;
  }
  if (base === 'ml') {
    if (orig.startsWith('l')) return q * 1000;
    if (orig === 'ml') return q;
  }
  if (base === 'kg') {
    if (orig === 'g') return q / 1000;
    if (orig === 'kg') return q;
  }
  if (base === 'g') {
    if (orig === 'kg') return q * 1000;
    if (orig === 'g') return q;
  }
  return q;
}

function calcularConsumoDiario(nomeProduto, unidadeBase) {
  const dietas = JSON.parse(localStorage.getItem('dietas') || '[]');
  const ciclos = JSON.parse(localStorage.getItem('ciclosLimpeza') || '[]');
  let total = 0;

  dietas.forEach((d) => {
    const vacas = parseFloat(d.numVacas || 0);
    (d.ingredientes || []).forEach((ing) => {
      if ((ing.produto || '').toLowerCase() === (nomeProduto || '').toLowerCase()) {
        total += converterQuantidade(ing.quantidade, 'kg', unidadeBase) * vacas;
      }
    });
  });

  ciclos.forEach((c) => {
    const freq = parseInt(c.frequencia || 1);
    const etapas = c.etapas || [{ produto: c.produto, quantidade: c.quantidade, unidade: c.unidade }];
    etapas.forEach((e) => {
      if ((e.produto || '').toLowerCase() === (nomeProduto || '').toLowerCase()) {
        total += converterQuantidade(e.quantidade, e.unidade, unidadeBase) * freq;
      }
    });
  });

  return total;
}

function contarAnimaisDaCategoria(categoria) {
  const animais = JSON.parse(localStorage.getItem('animais') || '[]');
  if (!categoria || categoria === 'Todo plantel') return animais.length;
  return animais.filter((a) => a.categoria === categoria).length;
}

function calcularDemandaProtocolos(nomeProduto) {
  const manejos = JSON.parse(localStorage.getItem('manejosSanitarios') || '[]');
  let demanda = 0;
  manejos.forEach((m) => {
    if ((m.produto || '').toLowerCase() === (nomeProduto || '').toLowerCase()) {
      const dose = parseFloat(m.dose || 0);
      const numAnimais = contarAnimaisDaCategoria(m.categoria);
      demanda += dose * numAnimais;
    }
  });
  return demanda;
}

export default function verificarAlertaEstoque(produto) {
  if (!produto) return { status: 'ok' };
  const tipo = produto.tipoDeUso || inferirTipoUso(produto.categoria);
  const quantidade = parseFloat(produto.quantidade || 0);
  const unidade = produto.unidade || '';
  const qtConvertida = unidade === 'mL' ? quantidade / 1000 : quantidade;

  if (tipo === 'diario') {
    const consumoDiario = calcularConsumoDiario(produto.nomeComercial, unidade);
    if (consumoDiario > 0) {
      const diasRestantes = qtConvertida / consumoDiario;
      const margem = parseFloat(produto.margemAlerta) || 3;
      if (diasRestantes <= margem) {
        return { status: 'baixo', mensagem: `Previsto esgotar em ${Math.floor(diasRestantes)} dias` };
      }
    }
    return { status: 'ok' };
  }

  if (tipo === 'protocolo') {
    const demandaPrevista = calcularDemandaProtocolos(produto.nomeComercial);
    if (qtConvertida < demandaPrevista) return { status: 'insuficiente' };
    return { status: 'ok' };
  }

  // eventual
  const ajustes = JSON.parse(localStorage.getItem('ajustesEstoque') || '{}');
  const minimo = parseFloat(produto.minimo || ajustes[produto.categoria] || 0);
  if (qtConvertida < minimo) return { status: 'baixo' };
  return { status: 'ok' };
}

export { calcularConsumoDiario, calcularDemandaProtocolos };
