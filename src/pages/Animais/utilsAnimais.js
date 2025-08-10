// 🧮 CALCULAR CATEGORIA POR IDADE
export function calcularCategoria(dataNascimento) {
  if (!dataNascimento || typeof dataNascimento !== "string") return "";

  const [dia, mes, ano] = dataNascimento.split("/");
  const nascimento = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  const diffEmMeses =
    (hoje.getFullYear() - nascimento.getFullYear()) * 12 +
    (hoje.getMonth() - nascimento.getMonth());

  if (diffEmMeses < 3) return "Bezerra";
  if (diffEmMeses < 12) return "Novilhinha";
  if (diffEmMeses < 24) return "Novilha";
  return "Vaca";
}

// 📦 LOCAL STORAGE: Carregar e salvar lista completa de animais
// Funções de acesso ao banco foram movidas para s../api.js

// ✅ CALCULAR DEL ATUAL COM BASE NA DATA DO ÚLTIMO PARTO
export function calcularDELAtual(ultimoParto, dataReferencia = new Date()) {
  if (!ultimoParto || typeof ultimoParto !== "string" || ultimoParto.length !== 10) return null;
  const [dia, mes, ano] = ultimoParto.split("/");
  const dataParto = new Date(ano, mes - 1, dia);
  const diff = Math.floor((dataReferencia - dataParto) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : 0;
}

// ✅ Alias para facilitar uso em outros lugares
export const calcularDEL = calcularDELAtual;

// ✅ CALCULAR DEL POR CICLO (corrigido com proteções extras)
export function calcularDELPorCiclo(ciclos, secagens = [], hoje = new Date()) {
  return (ciclos || []).map((c, index) => {
    const dataParto = c.parto?.data;
    if (!dataParto || typeof dataParto !== "string") {
      return { ciclo: index + 1, dias: null };
    }

    const [diaP, mesP, anoP] = dataParto.split("/");
    const parto = new Date(anoP, mesP - 1, diaP);

    let secagem = null;
    const proximoPartoData = ciclos[index + 1]?.parto?.data;
    const proximoParto = proximoPartoData
      ? new Date(...proximoPartoData.split("/").reverse().map(Number))
      : null;

    for (let s of secagens) {
      if (typeof s !== "string" || !s.includes("/")) continue;
      const [ds, ms, ys] = s.split("/");
      const d = new Date(ys, ms - 1, ds);
      if (d > parto && (!proximoParto || d < proximoParto)) {
        secagem = d;
        break;
      }
    }

    // Se não encontrar secagem e houver próximo parto, estima 60 dias antes do parto
    if (!secagem && proximoParto) {
      secagem = new Date(proximoParto);
      secagem.setDate(secagem.getDate() - 60);
    }

    // Se ainda não encontrar secagem, considera data de hoje
    if (!secagem) secagem = hoje;

    const dias = Math.floor((secagem - parto) / (1000 * 60 * 60 * 24));
    return {
      ciclo: index + 1,
      dias: dias >= 0 ? dias : null,
    };
  });
}

// 📊 CALCULAR DEL MÉDIO
export function calcularDELMedio(ciclos, secagens = [], hoje = new Date()) {
  const delPorCiclo = calcularDELPorCiclo(ciclos, secagens, hoje);
  const valores = delPorCiclo.map(c => c.dias).filter(d => typeof d === "number");
  return valores.length ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length) : null;
}

// 📆 FORMATADOR DE DATA PARA ESTILO BRASILEIRO
export function formatarDataBR(data) {
  if (!data || !(data instanceof Date)) return "";
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// 📝 FORMATAR E VALIDAR DATAS DIGITADAS EM FORMATO dd/mm/aaaa
export function formatarDataDigitada(valor) {
  const limpo = valor.replace(/\D/g, "").slice(0, 8);
  const dia = limpo.slice(0, 2);
  const mes = limpo.slice(2, 4);
  const ano = limpo.slice(4, 8);
  const dataFormatada = [dia, mes, ano].filter(Boolean).join("/");

  if (dataFormatada.length === 10) {
    const [d, m, a] = dataFormatada.split("/").map(Number);
    const data = new Date(a, m - 1, d);
    if (data.getDate() !== d || data.getMonth() !== m - 1 || data.getFullYear() !== a) {
      return ""; // data inválida
    }
  }

  return dataFormatada;
}

// ✅ Atualiza estrutura dos animais garantindo novos campos
export function migrarAnimal(a = {}) {
  const padrao = {
    nLactacoes: null,
    ultimaIA: '',
    ultimoParto: '',
    statusReprodutivo: 'pos-parto',
    checklistVermifugado: false,
    checklistGrupoDefinido: false,
    fichaComplementarOK: false,
    motivoSaida: null,
    dataSaida: null,
    valorVenda: null,
    observacoesSaida: null,
    tipoSaida: null,
  };

  const historicoPadrao = {
    inseminacoes: [],
    partos: [],
    secagens: [],
    diagnosticosGestacao: [],
    tratamentos: [],
    ocorrencias: [],
    lactacoes: [],
    pesagens: [],
    ccs: [],
    saidaAnimal: null,
  };

  const hist = { ...historicoPadrao, ...(a.historico || {}) };

  if (Array.isArray(a.inseminacoes)) hist.inseminacoes.push(...a.inseminacoes);
  if (Array.isArray(a.partos)) hist.partos.push(...a.partos);
  if (Array.isArray(a.secagens)) hist.secagens.push(...a.secagens);
  if (Array.isArray(a.diagnosticos))
    hist.diagnosticosGestacao.push(...a.diagnosticos);
  if (Array.isArray(a.tratamentos)) hist.tratamentos.push(...a.tratamentos);
  if (Array.isArray(a.ocorrencias)) hist.ocorrencias.push(...a.ocorrencias);
  if (Array.isArray(a.pesagens)) hist.pesagens.push(...a.pesagens);
  if (Array.isArray(a.lactacoes)) hist.lactacoes.push(...a.lactacoes);
  if (Array.isArray(a.ccs)) hist.ccs.push(...a.ccs);
  if (a.saidaAnimal) hist.saidaAnimal = a.saidaAnimal;

  const convertido = {
    ...padrao,
    ...a,
    historico: hist,
  };

  convertido.inseminacoes = hist.inseminacoes;
  convertido.partos = hist.partos;
  convertido.secagens = hist.secagens;
  convertido.diagnosticos = hist.diagnosticosGestacao;
  convertido.tratamentos = hist.tratamentos;
  convertido.ocorrencias = hist.ocorrencias;
  convertido.pesagens = hist.pesagens;
  convertido.lactacoes = hist.lactacoes;
  convertido.ccs = hist.ccs;
  convertido.saidaAnimal = hist.saidaAnimal;

  return convertido;
}

export function atualizarEstruturaAnimais(lista = []) {
  return (lista || []).map((a) => migrarAnimal(a));
}
