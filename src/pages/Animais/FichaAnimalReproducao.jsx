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
import { carregarRegistro } from "../../utils/registroReproducao";

export default function FichaAnimalReproducao({ animal }) {
  const hoje = new Date();
  const [modoEdicao, setModoEdicao] = useState({});
  const [ciclosEditados, setCiclosEditados] = useState({});
  const chaveLocalStorage = `ciclosEditados_${animal.numero || "vaca"}`;

  useEffect(() => {
    const salvos = localStorage.getItem(chaveLocalStorage);
    if (salvos) setCiclosEditados(JSON.parse(salvos));
  }, [chaveLocalStorage]);

  const salvarAlteracoes = (i) => {
    const atualizado = { ...ciclosEditados };
    localStorage.setItem(chaveLocalStorage, JSON.stringify(atualizado));
    setModoEdicao((prev) => ({ ...prev, [i]: false }));
  };

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
    const ia = [...(animal.inseminacoes || [])].map(i => ({ ...i, tipo: "IA" }));
    const partos = [...(animal.partos || [])].map(p => ({ ...p, tipo: "Parto" }));

    if (animal.iaAnteriores)
      ia.push(...animal.iaAnteriores.map(d => ({ data: d.data || d, tipo: "IA", touro: "—", inseminador: "—", obs: "—" })));
    if (animal.ultimaIA)
      ia.push({ data: animal.ultimaIA, tipo: "IA", touro: "—", inseminador: "—", obs: "—" });
    if (animal.partosAnteriores)
      partos.push(...animal.partosAnteriores.map(d => ({ data: d.data || d, tipo: "Parto", obs: "—" })));
    if (animal.ultimoParto)
      partos.push({ data: animal.ultimoParto, tipo: "Parto", obs: "—" });

    ia.sort((a, b) => new Date(a.data.split("/").reverse().join("-")) - new Date(b.data.split("/").reverse().join("-")));
    partos.sort((a, b) => new Date(a.data.split("/").reverse().join("-")) - new Date(b.data.split("/").reverse().join("-")));

    const ciclosSeparados = [];
    let iParto = 0;
    for (let i = 0; i < ia.length; i++) {
      const dataIA = new Date(ia[i].data.split("/").reverse().join("-"));
      while (iParto < partos.length && dataIA > new Date(partos[iParto].data.split("/").reverse().join("-"))) {
        iParto++;
      }
      const cicloIA = [ia[i]];
      let j = i + 1;
      while (
        j < ia.length &&
        (!partos[iParto] || new Date(ia[j].data.split("/").reverse().join("-")) < new Date(partos[iParto].data.split("/").reverse().join("-")))
      ) {
        cicloIA.push(ia[j]);
        j++;
      }
      i = j - 1;
      const parto = partos[iParto] || null;

      const inicio = new Date(cicloIA[0].data.split("/").reverse().join("-"));
      const fim = parto ? new Date(parto.data.split("/").reverse().join("-")) : hoje;
      const secagens = (animal.secagensAnteriores || []).filter(s => {
        const d = new Date(s.data.split("/").reverse().join("-"));
        return d >= inicio && d <= fim;
      }).map(s => ({ ...s, tipo: "Secagem" }));

      const eventos = [...cicloIA, ...(parto ? [parto] : []), ...secagens].sort(
        (a, b) => new Date(a.data.split("/").reverse().join("-")) - new Date(b.data.split("/").reverse().join("-"))
      );

      ciclosSeparados.push({ ia: cicloIA, parto, eventos, secagens });
      if (parto) iParto++;
    }

    return ciclosSeparados;
  }, [animal]);

  const delPorCiclo = useMemo(() => {
    const base = calcularDELPorCiclo(ciclos, animal.secagensAnteriores || [], hoje);
    return base.map((c, i) => ({ ...c, ciclo: `Ciclo ${i + 1}` })).filter(c => c.dias !== null);
  }, [ciclos]);

  const tempoEntrePartos = useMemo(() => {
    return ciclos.map((c, i) => {
      if (!c.parto || !ciclos[i + 1]?.parto) return null;
      const d1 = new Date(c.parto.data.split("/").reverse().join("-"));
      const d2 = new Date(ciclos[i + 1].parto.data.split("/").reverse().join("-"));
      const dias = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
      return {
        ciclo: `Ciclo ${i + 1}`,
        meses: parseFloat((dias / 30).toFixed(1))
      };
    }).filter(Boolean);
  }, [ciclos]);

  const curvaPrenhez = useMemo(() => {
    return (animal.diagnosticos || [])
      .filter(d => d.resultado === "positivo" && d.data && d.dataIA)
      .map(d => {
        const dataIA = new Date(d.dataIA.split("/").reverse().join("-"));
        const dataDiagnostico = new Date(d.data.split("/").reverse().join("-"));
        const dias = Math.floor((dataDiagnostico - dataIA) / (1000 * 60 * 60 * 24));
        return { data: d.data, dias };
      });
  }, [animal]);

  const eventosLinha = useMemo(() => {
    const eventos = [];
    ciclos.forEach((ciclo, i) => {
      const ias = ciclosEditados[i]?.ia || ciclo.ia;
      ias.forEach((ia) => {
        if (ia?.data) {
          eventos.push({ tipo: "IA", data: ia.data, touro: ia.touro, inseminador: ia.inseminador, subtipo: ia.touro || null, obs: ia.obs || "—" });
        }
      });
      if (ciclo.parto) eventos.push({ tipo: "Parto", data: ciclo.parto.data, subtipo: "", obs: ciclo.parto.obs || "—" });
      (ciclo.secagens || []).forEach((s) => {
        if (s?.data) eventos.push({ tipo: "Secagem", data: s.data, subtipo: s.subtipo || "", obs: s.obs || "—" });
      });
    });
    const regs = carregarRegistro(animal.numero).ocorrencias || [];
    regs.forEach(r => {
      eventos.push({ tipo: r.tipo, data: r.data, subtipo: r.nomeProtocolo || "", obs: r.obs || "—" });
    });
    return eventos.sort((a, b) => new Date(a.data.split("/").reverse().join("-")) - new Date(b.data.split("/").reverse().join("-")));
  }, [animal, ciclosEditados, ciclos]);

  const registroOcorrencias = useMemo(() => {
    return carregarRegistro(animal.numero).ocorrencias || [];
  }, [animal]);

  return (
    <div>
      <button onClick={() => html2pdf().from(document.getElementById("reproducao-pdf")).save()}>Exportar PDF</button>
      <div id="reproducao-pdf">
        <FichaAnimalResumoReprodutivo animal={animal} partos={animal.partos || []} inseminacoes={animal.inseminacoes || []} />
        <GraficoDELporLactacao delPorCiclo={delPorCiclo} />
        <GraficoTempoEntrePartos tempoEntrePartos={tempoEntrePartos} />
        <GraficoCurvaPrenhez curvaPrenhez={curvaPrenhez} />
        <GraficoIAPorCiclo ciclos={ciclos} />
        <LinhaDoTempoReprodutiva eventos={eventosLinha} />

        {ciclos.map((c, i) => {
          const emEdicao = modoEdicao[i] ?? false;
          const dadosIA = ciclosEditados[i]?.ia || c.ia;
          return (
            <div key={`ciclo-${i}`} style={{ marginBottom: "2rem", background: "#f9f9f9", borderRadius: "0.5rem", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h4 style={{ color: "#1e40af", margin: 0 }}>{`📑 Ciclo ${i + 1}`}</h4>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {!emEdicao && (
                    <button onClick={() => setModoEdicao((prev) => ({ ...prev, [i]: true }))} style={{ background: "#dbeafe", border: "1px solid #3b82f6", padding: "0.3rem 0.6rem", borderRadius: "0.3rem", fontSize: "0.8rem", cursor: "pointer", color: "#1d4ed8" }}>✏️ Editar</button>
                  )}
                  {emEdicao && (
                    <button onClick={() => salvarAlteracoes(i)} style={{ background: "#dcfce7", border: "1px solid #22c55e", padding: "0.3rem 0.6rem", borderRadius: "0.3rem", fontSize: "0.8rem", cursor: "pointer", color: "#166534" }}>💾 Salvar</button>
                  )}
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f0f0f0" }}>
                    <th>Data</th>
                    <th>Evento</th>
                    <th>Touro / Inseminador</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {c.eventos.map((evento, idx) => (
                    <tr key={`evento-${i}-${idx}`}>
                      <td>{evento.data}</td>
                      <td>{evento.tipo === "IA" ? "Inseminação" : evento.tipo}</td>
                      <td>
                        {evento.tipo === "IA" && emEdicao ? (
                          <>
                            <input type="text" value={evento.touro || ""} onChange={(e) => editarCampo(i, idx, "touro", e.target.value)} placeholder="Touro" style={{ width: "45%", marginRight: "0.5rem" }} />
                            <input type="text" value={evento.inseminador || ""} onChange={(e) => editarCampo(i, idx, "inseminador", e.target.value)} placeholder="Inseminador" style={{ width: "45%" }} />
                          </>
                        ) : evento.tipo === "IA" ? `${evento.touro || "—"} / ${evento.inseminador || "—"}` : "—"}
                      </td>
                      <td>
                        {evento.tipo === "IA" && emEdicao ? (
                          <input type="text" value={evento.obs || ""} onChange={(e) => editarCampo(i, idx, "obs", e.target.value)} placeholder="Observação" style={{ width: "100%" }} />
                        ) : evento.obs || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {registroOcorrencias.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ color: '#1e40af', marginBottom: '0.5rem' }}>📑 Ocorrências Reprodutivas</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th>Data</th>
                  <th>Evento</th>
                  <th>Protocolo</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {registroOcorrencias.map((o, idx) => (
                  <tr key={`reg-${idx}`}>
                    <td>{o.data}</td>
                    <td>{o.tipo}</td>
                    <td>{o.nomeProtocolo || '–'}</td>
                    <td>{o.obs || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
