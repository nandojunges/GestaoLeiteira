// src/pages/Animais/FichaAnimalReproducao.jsx
import React, { useMemo, useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import GraficoDELporLactacao from "./GraficoDELporLactacao";
import GraficoTempoEntrePartos from "./GraficoTempoEntrePartos";
import GraficoCurvaPrenhez from "./GraficoCurvaPrenhez";
import GraficoIAPorCiclo from "./GraficoIAPorCiclo";
import LinhaDoTempoReprodutiva from "./LinhaDoTempoReprodutiva";
import { calcularDELAtual, calcularDELPorCiclo } from "./utilsAnimais";
import FichaAnimalResumoReprodutivo from "./FichaAnimalResumoReprodutivo";

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
    const eventosReprodutivos = (animal.eventos || []).filter(e => e.tipo === "reproducao");

    if (animal.iaAnteriores) ia.push(...animal.iaAnteriores.map(d => ({ data: d.data || d, tipo: "IA", touro: "—", inseminador: "—", obs: "—" })));
    if (animal.ultimaIA) ia.push({ data: animal.ultimaIA, tipo: "IA", touro: "—", inseminador: "—", obs: "—" });
    if (animal.partosAnteriores) partos.push(...animal.partosAnteriores.map(d => ({ data: d.data || d, tipo: "Parto", obs: "—" })));
    if (animal.ultimoParto) partos.push({ data: animal.ultimoParto, tipo: "Parto", obs: "—" });

    ia.sort((a, b) => new Date(a.data.split("/").reverse().join("-")) - new Date(b.data.split("/").reverse().join("-")));
    partos.sort((a, b) => new Date(a.data.split("/").reverse().join("-")) - new Date(b.data.split("/").reverse().join("-")));
    eventosReprodutivos.sort((a, b) => new Date(a.data.split("/").reverse().join("-")) - new Date(b.data.split("/").reverse().join("-")));

    const ciclosSeparados = [];
    let iParto = 0;
    for (let i = 0; i < ia.length; i++) {
      const dataIA = new Date(ia[i].data.split("/").reverse().join("-"));
      while (iParto < partos.length && dataIA > new Date(partos[iParto].data.split("/").reverse().join("-"))) {
        iParto++;
      }
      const cicloIA = [ia[i]];
      let j = i + 1;
      while (j < ia.length && (!partos[iParto] || new Date(ia[j].data.split("/").reverse().join("-")) < new Date(partos[iParto].data.split("/").reverse().join("-")))) {
        cicloIA.push(ia[j]);
        j++;
      }
      i = j - 1;
      const parto = partos[iParto] || null;
      const eventos = eventosReprodutivos.filter(e => {
        const d = new Date(e.data.split("/").reverse().join("-"));
        return d >= new Date(cicloIA[0].data.split("/").reverse().join("-")) && (!parto || d <= new Date(parto.data.split("/").reverse().join("-")));
      });
      ciclosSeparados.push({ ia: cicloIA, parto, eventos });
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
      (ciclo.eventos || []).forEach((e) => eventos.push({ tipo: e.tipo, data: e.data, subtipo: e.subtipo || "", obs: e.obs || "" }));
    });
    return eventos.sort((a, b) => new Date(b.data.split("/").reverse().join("-")) - new Date(a.data.split("/").reverse().join("-")));
  }, [animal, ciclosEditados, ciclos]);

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
                    <th style={th}>Data</th>
                    <th style={th}>Evento</th>
                    <th style={th}>Touro / Inseminador</th>
                    <th style={th}>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosIA.map((ia, idx) => (
                    <tr key={`ia-${i}-${idx}`}>
                      <td style={td}>{ia.data}</td>
                      <td style={td}>Inseminação</td>
                      <td style={td}>{emEdicao ? (<><input type="text" value={ia.touro || ""} onChange={(e) => editarCampo(i, idx, "touro", e.target.value)} placeholder="Touro" style={{ width: "45%", marginRight: "0.5rem" }} /><input type="text" value={ia.inseminador || ""} onChange={(e) => editarCampo(i, idx, "inseminador", e.target.value)} placeholder="Inseminador" style={{ width: "45%" }} /></>) : (`${ia.touro || "—"} / ${ia.inseminador || "—"}`)}</td>
                      <td style={td}>{emEdicao ? (<input type="text" value={ia.obs || ""} onChange={(e) => editarCampo(i, idx, "obs", e.target.value)} placeholder="Observação" style={{ width: "100%" }} />) : (ia.obs || "—")}</td>
                    </tr>
                  ))}
                  {c.eventos?.map((ev, eidx) => (
                    <tr key={`ev-${i}-${eidx}`}>
                      <td style={td}>{ev.data}</td>
                      <td style={td}>{ev.subtipo || ev.tipo}</td>
                      <td style={td}>—</td>
                      <td style={td}>{ev.obs || "—"}</td>
                    </tr>
                  ))}
                  {c.parto && (
                    <tr key={`parto-${i}`}>
                      <td style={td}>{c.parto.data}</td>
                      <td style={td}>Parto</td>
                      <td style={td}>—</td>
                      <td style={td}>{c.parto.obs || "—"}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const th = { padding: "0.5rem", textAlign: "left", borderBottom: "1px solid #ccc" };
const td = { padding: "0.4rem 0.5rem", borderBottom: "1px solid #eee" };
