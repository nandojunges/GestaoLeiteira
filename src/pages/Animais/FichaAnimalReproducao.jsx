// src/pages/Animais/FichaAnimalReproducao.jsx
import React, { useMemo, useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import GraficoDELporLactacao from "./GraficoDELporLactacao";
import GraficoTempoEntrePartos from "./GraficoTempoEntrePartos";
import GraficoCurvaPrenhez from "./GraficoCurvaPrenhez";
import GraficoIAPorCiclo from "./GraficoIAPorCiclo";
import LinhaDoTempoReprodutiva from "./LinhaDoTempoReprodutiva";
import { calcularDELPorCiclo } from "./utilsAnimais";
import FichaAnimalResumoReprodutivo from "./FichaAnimalResumoReprodutivo";
import {
  buscarCiclosEditadosSQLite,
  salvarCiclosEditadosSQLite,
  buscarEventosCalendarioSQLite,
  salvarEventosCalendarioSQLite,
} from "../../utils/apiFuncoes.js";
import ModalConfirmarExclusao from "../../components/ModalConfirmarExclusao";
import {
  carregarRegistroReprodutivo,
  excluirOcorrenciaFirestore,
  cancelarProtocoloAtivo,
} from "../../utils/registroReproducao";
export default function FichaAnimalReproducao({ animal }) {
  const hoje = new Date();
  const [modoEdicao, setModoEdicao] = useState({});
  const [ciclosEditados, setCiclosEditados] = useState({});
  const [atualizar, setAtualizar] = useState(0);
  const [eventoExcluir, setEventoExcluir] = useState(null);
  const [registroRepro, setRegistroRepro] = useState({ ocorrencias: [] });

  useEffect(() => {
    const carregar = async () => {
      const doc = await buscarCiclosEditadosSQLite(animal.numero || 'vaca');
      setCiclosEditados(doc || {});
    };
    carregar();
  }, [animal]);

  const salvarAlteracoes = async (i) => {
    const atualizado = { ...ciclosEditados };
    await salvarCiclosEditadosSQLite(animal.numero || 'vaca', atualizado);
    setModoEdicao((prev) => ({ ...prev, [i]: false }));
  };

  async function carregarDadosReproducao() {
    const reg = await carregarRegistroReprodutivo(animal.numero);
    setRegistroRepro(reg);
  }

  useEffect(() => {
    carregarDadosReproducao();
  }, [animal.numero]);

  useEffect(() => {
    const atualizar = () => carregarRegistroReprodutivo(animal.numero).then(setRegistroRepro);
    window.addEventListener('registroReprodutivoAtualizado', atualizar);
    return () =>
      window.removeEventListener('registroReprodutivoAtualizado', atualizar);
  }, [animal.numero]);

  const editarCampo = (i, idx, campo, valor) => {
    setCiclosEditados((prev) => {
      const novo = { ...prev };
      if (!novo[i]) novo[i] = { ia: [...(ciclos[i]?.ia || [])] };
      if (!novo[i].ia[idx]) novo[i].ia[idx] = { ...(ciclos[i]?.ia[idx] || {}) };
      novo[i].ia[idx][campo] = valor;
      return novo;
    });
  };

  const ciclos = useMemo(() => {
    const hist = animal.historico || {};
    const ia = [...(hist.inseminacoes || [])].map((i) => ({
      ...i,
      tipo: "IA",
    }));
    const partos = [...(hist.partos || [])].map((p) => ({
      ...p,
      tipo: "Parto",
    }));

    const registro = registroRepro.ocorrencias || [];
    const outrasOcorrencias = registro.map((o) => ({
      id: o.id,
      data: o.data,
      tipo: o.tipo,
      nomeProtocolo: o.nomeProtocolo,
      obs: o.obs || "—",
    }));

    const todosEventos = [
      ...ia,
      ...partos,
      ...(hist.secagens || []).map((s) => ({
        ...s,
        tipo: "Secagem",
      })),
      ...outrasOcorrencias,
    ];

    todosEventos.sort(
      (a, b) =>
        new Date(a.data.split("/").reverse().join("-")) -
        new Date(b.data.split("/").reverse().join("-")),
    );

    const partosOrdenados = todosEventos
      .filter((e) => e.tipo === "Parto")
      .sort(
        (a, b) =>
          new Date(a.data.split("/").reverse().join("-")) -
          new Date(b.data.split("/").reverse().join("-")),
      );

    // Se não houver partos registrados, agrupar eventos após a última IA
    if (partosOrdenados.length === 0) {
      const ultimaIA = ia
        .sort(
          (a, b) =>
            new Date(a.data.split("/").reverse().join("-")) -
            new Date(b.data.split("/").reverse().join("-")),
        )
        .slice(-1)[0];
      if (!ultimaIA) return [];
      const inicio = new Date(ultimaIA.data.split("/").reverse().join("-"));
      const eventosCiclo = todosEventos.filter(
        (ev) => new Date(ev.data.split("/").reverse().join("-")) >= inicio,
      );
      const iaCiclo = eventosCiclo.filter((ev) => ev.tipo === "IA");
      const secagens = eventosCiclo.filter((ev) => ev.tipo === "Secagem");
      const outros = eventosCiclo.filter(
        (ev) => !["IA", "Secagem", "Parto"].includes(ev.tipo),
      );
      const eventos = [...iaCiclo, ...outros, ...secagens].sort(
        (a, b) =>
          new Date(a.data.split("/").reverse().join("-")) -
          new Date(b.data.split("/").reverse().join("-")),
      );
      return [{ ia: iaCiclo, parto: null, eventos, secagens }];
    }

    const ciclosSeparados = [];
    for (let i = 0; i < partosOrdenados.length; i++) {
      const inicio = new Date(
        partosOrdenados[i].data.split("/").reverse().join("-"),
      );
      const proximoParto = partosOrdenados[i + 1];
      const fim = proximoParto
        ? new Date(proximoParto.data.split("/").reverse().join("-"))
        : hoje;

      const eventosCiclo = todosEventos.filter((ev) => {
        const d = new Date(ev.data.split("/").reverse().join("-"));
        return d > inicio && d <= fim;
      });

      const iaCiclo = eventosCiclo.filter((ev) => ev.tipo === "IA");
      const secagens = eventosCiclo.filter((ev) => ev.tipo === "Secagem");
      const outros = eventosCiclo.filter(
        (ev) => !["IA", "Secagem", "Parto"].includes(ev.tipo),
      );

      const eventos = [
        ...iaCiclo,
        ...outros,
        ...(proximoParto ? [proximoParto] : []),
        ...secagens,
      ].sort(
        (a, b) =>
          new Date(a.data.split("/").reverse().join("-")) -
          new Date(b.data.split("/").reverse().join("-")),
      );

      ciclosSeparados.push({
        ia: iaCiclo,
        parto: proximoParto || null,
        eventos,
        secagens,
      });
    }

    return ciclosSeparados;
  }, [animal, atualizar]);

  const delPorCiclo = useMemo(() => {
    const hist = animal.historico || {};
    const base = calcularDELPorCiclo(
      ciclos,
      hist.secagens || [],
      hoje,
    );
    return base
      .map((c, i) => ({ ...c, ciclo: `Ciclo ${i + 1}` }))
      .filter((c) => c.dias !== null);
  }, [ciclos]);

  const tempoEntrePartos = useMemo(() => {
    return ciclos
      .map((c, i) => {
        if (!c.parto || !ciclos[i + 1]?.parto) return null;
        const d1 = new Date(c.parto.data.split("/").reverse().join("-"));
        const d2 = new Date(
          ciclos[i + 1].parto.data.split("/").reverse().join("-"),
        );
        const dias = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
        return {
          ciclo: `Ciclo ${i + 1}`,
          meses: parseFloat((dias / 30).toFixed(1)),
        };
      })
      .filter(Boolean);
  }, [ciclos]);

  const curvaPrenhez = useMemo(() => {
    const hist = animal.historico || {};
    return (hist.diagnosticosGestacao || [])
      .filter((d) => d.resultado === "positivo" && d.data && d.dataIA)
      .map((d) => {
        const dataIA = new Date(d.dataIA.split("/").reverse().join("-"));
        const dataDiagnostico = new Date(d.data.split("/").reverse().join("-"));
        const dias = Math.floor(
          (dataDiagnostico - dataIA) / (1000 * 60 * 60 * 24),
        );
        return { data: d.data, dias };
      });
  }, [animal]);

  const eventosLinha = useMemo(() => {
    const eventos = [];
    ciclos.forEach((ciclo, i) => {
      const ias = ciclosEditados[i]?.ia || ciclo.ia;
      ias.forEach((ia) => {
        if (ia?.data) {
          eventos.push({
            tipo: "IA",
            data: ia.data,
            touro: ia.touro,
            inseminador: ia.inseminador,
            subtipo: ia.touro || null,
            obs: ia.obs || "—",
          });
        }
      });
      if (ciclo.parto)
        eventos.push({
          tipo: "Parto",
          data: ciclo.parto.data,
          subtipo: "",
          obs: ciclo.parto.obs || "—",
        });
      (ciclo.secagens || []).forEach((s) => {
        if (s?.data)
          eventos.push({
            tipo: "Secagem",
            data: s.data,
            subtipo: s.subtipo || "",
            obs: s.obs || "—",
          });
      });
    });
    const regs = registroRepro.ocorrencias || [];
    regs.forEach((r) => {
      eventos.push({
        tipo: r.tipo,
        data: r.data,
        subtipo: r.nomeProtocolo || "",
        obs: r.obs || "—",
      });
    });
    return eventos.sort(
      (a, b) =>
        new Date(a.data.split("/").reverse().join("-")) -
        new Date(b.data.split("/").reverse().join("-")),
    );
  }, [animal, ciclosEditados, ciclos, atualizar]);

  const registroOcorrencias = useMemo(() => {
    return registroRepro.ocorrencias || [];
  }, [registroRepro]);

  return (
    <div>
      <button
        onClick={() =>
          html2pdf().from(document.getElementById("reproducao-pdf")).save()
        }
      >
        Exportar PDF
      </button>
      <div id="reproducao-pdf">
        <FichaAnimalResumoReprodutivo
          animal={animal}
          partos={animal.historico?.partos || []}
          inseminacoes={animal.historico?.inseminacoes || []}
        />
        <GraficoDELporLactacao delPorCiclo={delPorCiclo} />
        <GraficoTempoEntrePartos tempoEntrePartos={tempoEntrePartos} />
        <GraficoCurvaPrenhez curvaPrenhez={curvaPrenhez} />
        <GraficoIAPorCiclo ciclos={ciclos} />
        <LinhaDoTempoReprodutiva eventos={eventosLinha} />

        {ciclos.map((c, i) => {
          const emEdicao = modoEdicao[i] ?? false;
          const dadosIA = ciclosEditados[i]?.ia || c.ia;
          return (
            <div
              key={`ciclo-${i}`}
              style={{
                marginBottom: "2rem",
                background: "#f9f9f9",
                borderRadius: "0.5rem",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <h4
                  style={{ color: "#1e40af", margin: 0 }}
                >{`📑 Ciclo ${i + 1}`}</h4>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {!emEdicao && (
                    <button
                      onClick={() =>
                        setModoEdicao((prev) => ({ ...prev, [i]: true }))
                      }
                      style={{
                        background: "#dbeafe",
                        border: "1px solid #3b82f6",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "0.3rem",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        color: "#1d4ed8",
                      }}
                    >
                      ✏️ Editar
                    </button>
                  )}
                  {emEdicao && (
                    <button
                      onClick={() => salvarAlteracoes(i)}
                      style={{
                        background: "#dcfce7",
                        border: "1px solid #22c55e",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "0.3rem",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        color: "#166534",
                      }}
                    >
                      💾 Salvar
                    </button>
                  )}
                </div>
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ background: "#f0f0f0" }}>
                    <th>Data</th>
                    <th>Evento</th>
                    <th>Touro / Inseminador</th>
                    <th>Observações</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {c.eventos.map((evento, idx) => (
                    <tr key={`evento-${i}-${idx}`}>
                      <td>{evento.data}</td>
                      <td>
                        {evento.tipo === "IA" ? "Inseminação" : evento.tipo}
                      </td>
                      <td>
                        {evento.tipo === "IA" && emEdicao ? (
                          <>
                            <input
                              type="text"
                              value={evento.touro || ""}
                              onChange={(e) =>
                                editarCampo(i, idx, "touro", e.target.value)
                              }
                              placeholder="Touro"
                              style={{ width: "45%", marginRight: "0.5rem" }}
                            />
                            <input
                              type="text"
                              value={evento.inseminador || ""}
                              onChange={(e) =>
                                editarCampo(
                                  i,
                                  idx,
                                  "inseminador",
                                  e.target.value,
                                )
                              }
                              placeholder="Inseminador"
                              style={{ width: "45%" }}
                            />
                          </>
                        ) : evento.tipo === "IA" ? (
                          `${evento.touro || "—"} / ${evento.inseminador || "—"}`
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {evento.tipo === "IA" && emEdicao ? (
                          <input
                            type="text"
                            value={evento.obs || ""}
                            onChange={(e) =>
                              editarCampo(i, idx, "obs", e.target.value)
                            }
                            placeholder="Observação"
                            style={{ width: "100%" }}
                          />
                        ) : (
                          evento.obs || "—"
                        )}
                      </td>
                      <td>
                        {evento.id && (
                          <button
                            onClick={() => {
                              const ind = (registroRepro.ocorrencias || []).findIndex(
                                (o) => o.id === evento.id
                              );
                              setEventoExcluir(ind >= 0 ? { indice: ind, id: evento.id } : null);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            🗑️
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
      {eventoExcluir && (
        <ModalConfirmarExclusao
          onCancelar={() => setEventoExcluir(null)}
          onConfirmar={async () => {
            const reg = { ...registroRepro };
            const [removido] = reg.ocorrencias.splice(eventoExcluir.indice, 1);
            setRegistroRepro(reg);

            if (eventoExcluir.id) {
              await excluirOcorrenciaFirestore(eventoExcluir.id);
            }

            // Remove eventos do protocolo no calendário
            if (removido?.protocoloId) {
              const eventos = await buscarEventosCalendarioSQLite();
              const restantes = eventos.filter(e => e.protocoloId !== removido.protocoloId);
              await salvarEventosCalendarioSQLite(restantes);
              window.dispatchEvent(new Event('eventosCalendarioAtualizados'));

              await cancelarProtocoloAtivo(animal.numero);
            }

            window.dispatchEvent(new Event('registroReprodutivoAtualizado'));

            setEventoExcluir(null);
            setAtualizar((a) => a + 1);
          }}
        />
      )}
    </div>
  );
}
