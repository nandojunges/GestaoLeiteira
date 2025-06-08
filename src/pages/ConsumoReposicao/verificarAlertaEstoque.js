export function inferirTipoUso(categoria) {
  if (["Ração", "Aditivos", "Suplementos", "Detergentes", "Ácido", "Alcalino", "Sanitizante"].includes(categoria)) {
    return "diario";
  }
  if (["Hormônio", "Antibiótico", "Antiparasitário", "AINE", "AIE"].includes(categoria)) {
    return "protocolo";
  }
  return "eventual";
}

export default function verificarAlertaEstoqueInteligente(produto) {
  if (!produto) return { status: "ok" };
  const tipo = produto.tipoDeUso || inferirTipoUso(produto.categoria);
  const estoqueAtual = parseFloat(produto.quantidade || 0);
  if (tipo === "diario") {
    const dietas = JSON.parse(localStorage.getItem("dietas") || "[]");
    const ciclos = JSON.parse(localStorage.getItem("ciclosLimpeza") || "[]");
    let consumoDiario = 0;
    dietas.forEach((d) => {
      const vacas = parseFloat(d.numVacas || 0);
      (d.ingredientes || []).forEach((ing) => {
        if ((ing.produto || "").toLowerCase() === (produto.nomeComercial || "").toLowerCase()) {
          consumoDiario += parseFloat(ing.quantidade || 0) * vacas;
        }
      });
    });
    ciclos.forEach((c) => {
      const freq = parseInt(c.frequencia || 1);
      const etapas = c.etapas || [{ produto: c.produto, quantidade: c.quantidade }];
      etapas.forEach((e) => {
        if ((e.produto || "").toLowerCase() === (produto.nomeComercial || "").toLowerCase()) {
          consumoDiario += parseFloat(e.quantidade || 0) * freq;
        }
      });
    });
    const margem = 3; // dias de segurança
    if (consumoDiario > 0 && estoqueAtual < consumoDiario * margem) {
      const dias = Math.floor(estoqueAtual / consumoDiario);
      return { status: "baixo", mensagem: `Previsto esgotar em ${dias} dias` };
    }
    return { status: "ok" };
  }
  if (tipo === "protocolo") {
    // verificar estoque mínimo manualmente para protocolos futuros
    const minimo = parseFloat(produto.minimo || 0);
    if (estoqueAtual < minimo) return { status: "insuficiente" };
    return { status: "ok" };
  }
  // eventual
  const ajustes = JSON.parse(localStorage.getItem("ajustesEstoque") || "{}");
  const minimo = parseFloat(ajustes[produto.categoria] || 0);
  if (estoqueAtual < minimo) return { status: "baixo" };
  return { status: "ok" };
}
