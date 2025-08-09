import React, { useEffect, useState } from "react";
import ModalPlanoCiclo from "./ModalPlanoCiclo";
import ModalExclusaoPadrao from "../../components/modals/ModalExclusaoPadrao";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";
import {
  buscarTodos,
  adicionarItem,
} from "../../utils/backendApi";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function ListaLimpeza({ onEditar }) {
  const [ciclos, setCiclos] = useState([]);
  const [colunaHover, setColunaHover] = useState(null);
  const [planoAtivo, setPlanoAtivo] = useState(null);
  const [cicloExcluir, setCicloExcluir] = useState(null);

  const carregar = async () => {
    const lista = await buscarTodos("ciclosLimpeza");
    setCiclos(lista);
    processarConsumo(lista);
  };

  useEffect(() => {
    carregar();
    window.addEventListener("ciclosLimpezaAtualizados", carregar);
    return () => window.removeEventListener("ciclosLimpezaAtualizados", carregar);
  }, []);

  const convToMl = (valor, unidade) => {
    let v = parseFloat(valor) || 0;
    if (!unidade) return v;
    const u = unidade.toLowerCase();
    if (u.startsWith("litro") || u === "l") return v * 1000;
    return v;
  };

  const parseCond = (c) => {
    if (!c) return { tipo: "sempre" };
    if (typeof c === "object") return c;
    if (c === "sempre") return { tipo: "sempre" };
    const m = c.match(/a cada\s*(\d+)/i);
    if (m) return { tipo: "cada", intervalo: parseInt(m[1]) };
    if (c.toLowerCase().includes("manhã")) return { tipo: "manha" };
    if (c.toLowerCase().includes("tarde")) return { tipo: "tarde" };
    return { tipo: "sempre" };
  };

  const vezesPorDia = (cond, freq) => {
    switch (cond.tipo) {
      case "cada":
        return freq / (cond.intervalo || 1);
      case "manha":
      case "tarde":
        return 1;
      default:
        return freq;
    }
  };

  const processarConsumo = async (lista) => {
    const ultimaLista = await buscarTodos("ultimaExecucaoLimpeza");
    const ultima = ultimaLista[0];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let dataUlt = ultima ? new Date(ultima) : null;
    if (dataUlt) dataUlt.setHours(0, 0, 0, 0);
    let diasPassados = dataUlt ? Math.floor((hoje - dataUlt) / 86400000) : 1;
    if (diasPassados <= 0) return;

    const produtos = await buscarTodos("produtos");
    const contadoresData = await buscarTodos("contadoresLimpeza");
    const contadores = contadoresData[0] || {};

    for (let d = 1; d <= diasPassados; d++) {
      const data = new Date(dataUlt || hoje);
      data.setDate(data.getDate() + d);
      const diaSemana = data.getDay();
      lista.forEach((c, ci) => {
        if (!c.diasSemana?.includes(diaSemana)) return;
        const freq = parseInt(c.frequencia || 1);
        for (let exec = 0; exec < freq; exec++) {
          const horario = exec === 0 ? "manha" : exec === 1 ? "tarde" : `ord${exec + 1}`;
          const etapas = c.etapas || [
            {
              produto: c.produto,
              quantidade: c.quantidade,
              unidade: c.unidade,
              condicao: { tipo: "sempre" }
            }
          ];
          etapas.forEach((e, ei) => {
            if (!e || !e.produto) return;
            const key = `${ci}-${ei}`;
            contadores[key] = (contadores[key] || 0) + 1;
            const cond = parseCond(e.condicao);
            let aplicar = true;
            if (cond.tipo === "cada") {
              const inter = cond.intervalo || 1;
              aplicar = contadores[key] % inter === 0;
            } else if (cond.tipo === "manha") {
              aplicar = horario === "manha";
            } else if (cond.tipo === "tarde") {
              aplicar = horario === "tarde";
            }
            if (!aplicar) return;
            const idx = produtos.findIndex((p) => p.nomeComercial === e.produto);
            if (idx === -1) return;
            const prod = produtos[idx];
            const volumeUnidade = convToMl(prod.volume || 0, prod.volumeUnidade || prod.unidade);
            let totalMl = volumeUnidade * parseFloat(prod.quantidade || 0);
            const consumoMl = convToMl(e.quantidade, e.unidade);
            totalMl = Math.max(0, totalMl - consumoMl);
            prod.quantidade = volumeUnidade > 0 ? totalMl / volumeUnidade : prod.quantidade;
            produtos[idx] = prod;
          });
        }
      });
    }

    await adicionarItem("produtos", produtos);
    await adicionarItem("contadoresLimpeza", contadores);
    await adicionarItem("ultimaExecucaoLimpeza", [hoje.toISOString()]);
    window.dispatchEvent(new Event("produtosAtualizados"));
    window.dispatchEvent(new Event("estoqueAtualizado"));
  };

  const calcularDuracao = async (c) => {
    const produtos = await buscarTodos("produtos");
    const freq = parseInt(c.frequencia || 1);
    const etapas = c.etapas || [
      { produto: c.produto, quantidade: c.quantidade, unidade: c.unidade, condicao: { tipo: "sempre" } }
    ];
    const consumo = {};
    etapas.forEach((e) => {
      if (!e || !e.produto) return;
      const cond = parseCond(e.condicao);
      const ml = convToMl(e.quantidade, e.unidade) * vezesPorDia(cond, freq);
      consumo[e.produto] = (consumo[e.produto] || 0) + ml;
    });
    let dias = Infinity;
    Object.entries(consumo).forEach(([nome, cons]) => {
      const prod = produtos.find((p) => p.nomeComercial === nome);
      if (!prod) return;
      const estoque = convToMl(prod.volume || 0, prod.volumeUnidade || prod.unidade) * parseFloat(prod.quantidade || 0);
      if (cons > 0) dias = Math.min(dias, estoque / cons);
    });
    if (!isFinite(dias) || dias === Infinity) return "—";
    return `${Math.floor(dias)} dias restantes`;
  };

  const calcularCustoDiario = async (ciclo) => {
    const produtos = await buscarTodos("produtos");
    const etapas =
      ciclo.etapas || [
        { produto: ciclo.produto, quantidade: ciclo.quantidade, unidade: ciclo.unidade },
      ];
    const freq = parseInt(ciclo.frequencia || 1);
    let total = 0;

    etapas.forEach((etapa) => {
      const produto = produtos.find(
        (p) => (p.nomeComercial || "").toLowerCase() === (etapa.produto || "").toLowerCase()
      );
      if (!produto) {
        console.warn("Produto não encontrado:", etapa.produto);
        return;
      }
      if (!produto.volume || !produto.valorTotal) return;

      const volumeStr = String(produto.volume).toLowerCase();
      const volumeNumerico = parseFloat(volumeStr);
      let volumeEmML = volumeStr.includes("l") ? volumeNumerico * 1000 : volumeNumerico;
      if (!volumeEmML || isNaN(volumeEmML)) return;

      const unidades = parseFloat(produto.quantidade) || 1;
      volumeEmML *= unidades;
      const valorTotal = parseFloat(produto.valorTotal) || 0;
      const precoPorML = volumeEmML > 0 ? valorTotal / volumeEmML : 0;
      const quantidadeUsada = parseFloat(etapa.quantidade || 0) * freq;
      const custoEtapa = precoPorML * quantidadeUsada;
      total += custoEtapa;
    });

    return total > 0 ? `R$ ${total.toFixed(2)}` : "—";
  };

  const detalharPlano = (c) => {
    const freq = parseInt(c.frequencia || 1);
    const etapas = c.etapas || [
      { produto: c.produto, quantidade: c.quantidade, unidade: c.unidade, condicao: { tipo: "sempre" } }
    ];
    const cont = etapas.map(() => 0);
    let linhas = [];
    for (let d = 0; d < 7; d++) {
      if (!c.diasSemana?.includes(d)) continue;
      let partes = [];
      for (let exec = 0; exec < freq; exec++) {
        const horario = freq === 1 ? "" : exec === 0 ? "Manhã" : exec === 1 ? "Tarde" : `Ordenha ${exec + 1}`;
        let itens = [];
        let ultimaCondBase = null;
        etapas.forEach((e, i) => {
          cont[i] += 1;
          const cond = parseCond(e.condicao);
          let aplicar = true;
          if (cond.tipo === "cada") aplicar = cont[i] % (cond.intervalo || 1) === 0;
          else if (cond.tipo === "manha") aplicar = horario === "Manhã";
          else if (cond.tipo === "tarde") aplicar = horario === "Tarde";
          if (aplicar) {
            let texto = `${e.quantidade} ${e.unidade} ${e.produto}`;
            if (cond.tipo === "cada") texto += ` (condicional: ${cond.intervalo}ª ordenha)`;
            if (e.complementar && ultimaCondBase &&
                cond.tipo === ultimaCondBase.tipo &&
                (cond.intervalo || 0) === (ultimaCondBase.intervalo || 0)) {
              itens.push(texto);
            } else {
              itens.push(texto);
              if (!e.complementar) ultimaCondBase = cond;
            }
          }
        });
        if (itens.length) partes.push(`- ${horario || `Ordenha ${exec + 1}`}: ${itens.join(" + ")}`);
      }
      if (partes.length) linhas.push(`➡ ${DIAS[d]}:\n${partes.join("\n")}`);
    }
    return linhas.join("\n");
  };

  const removerCiclo = async (index) => {
    const atualizados = ciclos.filter((_, i) => i !== index);
    setCiclos(atualizados);
    await adicionarItem("ciclosLimpeza", atualizados);
    window.dispatchEvent(new Event("ciclosLimpezaAtualizados"));
    setCicloExcluir(null);
  };

  const titulos = [
    "Nome do ciclo",
    "Tipo",
    "Frequência",
    "Dias da semana",
    "Duração estimada",
    "Custo diário",
    "Etapas",
    "Ação",
  ];

  return (
    <>
      <table className="tabela-padrao" style={{ tableLayout: "auto", width: "100%" }}>
        <thead>
          <tr>
            {titulos.map((t, idx) => (
              <th
                key={idx}
                onMouseEnter={() => setColunaHover(idx)}
                onMouseLeave={() => setColunaHover(null)}
                className={colunaHover === idx ? "coluna-hover" : ""}
                style={{
                  whiteSpace: "nowrap",
                  width:
                    t === "Ação"
                      ? "110px"
                      : t === "Tipo"
                      ? "80px"
                      : t === "Frequência"
                      ? "90px"
                      : t === "Dias da semana"
                      ? "120px"
                      : t === "Etapas"
                      ? "200px"
                      : "auto",
                }}
              >
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ciclos.length === 0 ? (
            <tr>
              <td colSpan={titulos.length} style={{ textAlign: "center" }}>
                Nenhum ciclo cadastrado.
              </td>
            </tr>
          ) : (
            ciclos.map((c, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td>{c.nome || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{c.tipo || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{c.frequencia ? `${c.frequencia}x/dia` : "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{c.diasSemana?.map((d) => DIAS[d]).join(", ")}</td>
                  <td>{calcularDuracao(c)}</td>
                  <td>{calcularCustoDiario(c)}</td>
                  <td style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {(c.etapas || [
                      {
                        produto: c.produto,
                        quantidade: c.quantidade,
                        unidade: c.unidade,
                        condicao: c.condicao || { tipo: "sempre" }
                      }
                    ])
                      .map(
                        (e) => `${e.produto} - ${e.quantidade} ${e.unidade} (${typeof e.condicao === "object" ? e.condicao.tipo : e.condicao || "sempre"})`
                      )
                      .join(", ")}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button className="btn-editar" onClick={() => onEditar(c, index)}>Editar</button>
                      <button className="btn-excluir" onClick={() => setCicloExcluir(index)}>Excluir</button>
                      <button className="btn-editar" onClick={() => setPlanoAtivo(index)} style={{ backgroundColor: "#6b7280" }}>Ver plano</button>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>

      {planoAtivo !== null && (
        <ModalPlanoCiclo
          ciclo={ciclos[planoAtivo]}
          onClose={() => setPlanoAtivo(null)}
        />
      )}

      {cicloExcluir !== null && (
        <ModalExclusaoPadrao
          mensagem="Deseja realmente excluir este ciclo?"
          onCancelar={() => setCicloExcluir(null)}
          onConfirmar={() => removerCiclo(cicloExcluir)}
        />
      )}
    </>
  );
}
