import React, { useEffect, useState } from "react";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function ListaLimpeza({ onEditar }) {
  const [ciclos, setCiclos] = useState([]);
  const [colunaHover, setColunaHover] = useState(null);

  const carregar = () => {
    const lista = JSON.parse(localStorage.getItem("ciclosLimpeza") || "[]");
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

  const processarConsumo = (lista) => {
    const ultima = localStorage.getItem("ultimaExecucaoLimpeza");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let dataUlt = ultima ? new Date(ultima) : null;
    if (dataUlt) dataUlt.setHours(0, 0, 0, 0);
    let diasPassados = dataUlt ? Math.floor((hoje - dataUlt) / 86400000) : 1;
    if (diasPassados <= 0) return;

    const produtos = JSON.parse(localStorage.getItem("produtos") || "[]");
    const contadores = JSON.parse(localStorage.getItem("contadoresLimpeza") || "{}");

    for (let d = 1; d <= diasPassados; d++) {
      const data = new Date(dataUlt || hoje);
      data.setDate(data.getDate() + d);
      const diaSemana = data.getDay();
      lista.forEach((c, ci) => {
        if (!c.diasSemana?.includes(diaSemana)) return;
        const freq = parseInt(c.frequencia || 1);
        for (let exec = 0; exec < freq; exec++) {
          const etapas = c.etapas || [
            {
              produto: c.produto,
              quantidade: c.quantidade,
              unidade: c.unidade,
              condicao: "sempre"
            }
          ];
          etapas.forEach((e, ei) => {
            if (!e || !e.produto) return;
            const key = `${ci}-${ei}`;
            contadores[key] = (contadores[key] || 0) + 1;
            let aplicar = true;
            if (e.condicao && e.condicao !== "sempre") {
              const m = e.condicao.match(/a cada\s*(\d+)/i);
              if (m) {
                const intervalo = parseInt(m[1]);
                aplicar = contadores[key] % intervalo === 0;
              }
            }
            if (!aplicar) return;
            const idx = produtos.findIndex((p) => p.nomeComercial === e.produto);
            if (idx === -1) return;
            const prod = produtos[idx];
            const volumeUnidade = convToMl(prod.volume || 0, prod.unidade);
            let totalMl = volumeUnidade * parseFloat(prod.quantidade || 0);
            const consumoMl = convToMl(e.quantidade, e.unidade);
            totalMl = Math.max(0, totalMl - consumoMl);
            prod.quantidade = volumeUnidade > 0 ? totalMl / volumeUnidade : prod.quantidade;
            produtos[idx] = prod;
          });
        }
      });
    }

    localStorage.setItem("produtos", JSON.stringify(produtos));
    localStorage.setItem("contadoresLimpeza", JSON.stringify(contadores));
    localStorage.setItem("ultimaExecucaoLimpeza", hoje.toISOString());
    window.dispatchEvent(new Event("produtosAtualizados"));
  };

  const excluir = (index) => {
    if (!window.confirm("Deseja excluir este ciclo?")) return;
    const atualizados = ciclos.filter((_, i) => i !== index);
    setCiclos(atualizados);
    localStorage.setItem("ciclosLimpeza", JSON.stringify(atualizados));
    window.dispatchEvent(new Event("ciclosLimpezaAtualizados"));
  };

  const titulos = [
    "Nome do ciclo",
    "Tipo",
    "Frequência",
    "Dias da semana",
    "Etapas",
    "Ação",
  ];

  return (
    <table className="tabela-padrao">
      <thead>
        <tr>
          {titulos.map((t, idx) => (
            <th
              key={idx}
              onMouseEnter={() => setColunaHover(idx)}
              onMouseLeave={() => setColunaHover(null)}
              className={colunaHover === idx ? "coluna-hover" : ""}
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
            <tr key={index}>
              <td>{c.nome || "—"}</td>
              <td>{c.tipo || "—"}</td>
              <td>{c.frequencia ? `${c.frequencia}x/dia` : "—"}</td>
              <td>{c.diasSemana?.map((d) => DIAS[d]).join(", ")}</td>
              <td>
                {(c.etapas || [
                  { produto: c.produto, quantidade: c.quantidade, unidade: c.unidade, condicao: c.condicao || "sempre" }
                ]).map((e, i) => (
                  <div key={i}>
                    {e.produto} - {e.quantidade} {e.unidade} ({e.condicao || "sempre"})
                  </div>
                ))}
              </td>
              <td>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button className="botao-editar" onClick={() => onEditar(c, index)}>
                    Editar
                  </button>
                  <button
                    className="botao-editar"
                    onClick={() => excluir(index)}
                    style={{ borderColor: "#dc3545", color: "#dc3545" }}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
