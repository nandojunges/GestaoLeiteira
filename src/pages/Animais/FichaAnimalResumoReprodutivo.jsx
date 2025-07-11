import React, { useMemo, useState } from "react";
import { calcularDELPorCiclo } from "./utilsAnimais";

export default function FichaAnimalResumoReprodutivo({ animal }) {
  const hoje = new Date();
  const [cardAberto, setCardAberto] = useState(null);
  const hist = animal.historico || {};

  const ciclos = useMemo(() => {
    const ia = [...(hist.inseminacoes || [])].map(i => ({ ...i, tipo: "IA" }));
    const partos = [...(hist.partos || [])].map(p => ({ ...p, tipo: "Parto" }));

    // Eventos legados

    ia.sort((a, b) => new Date(a.data.split("/").reverse().join("-")) - new Date(b.data.split("/").reverse().join("-")));
    partos.sort((a, b) => new Date(a.data.split("/").reverse().join("-")) - new Date(b.data.split("/").reverse().join("-")));

    const ciclosSeparados = [];
    let iParto = 0;

    for (let i = 0; i < ia.length; i++) {
      const dataIA = new Date(ia[i].data.split("/").reverse().join("-"));
      while (iParto < partos.length && dataIA > new Date(partos[iParto].data.split("/").reverse().join("-"))) iParto++;

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

      ciclosSeparados.push({ ia: cicloIA, parto });
      if (parto) iParto++;
    }

    return ciclosSeparados;
  }, [animal]);

  const totalIA = ciclos.reduce((acc, c) => acc + c.ia.length, 0);
  const totalPartos = ciclos.filter(c => !!c.parto).length;

  const cicloComUltimoParto = [...ciclos].reverse().find(c => c.parto?.data);
  const dataUltimoParto = cicloComUltimoParto?.parto?.data || null;

  const delAtual = useMemo(() => {
    if (!dataUltimoParto) return "—";
    const partoData = new Date(dataUltimoParto.split("/").reverse().join("-"));
    const dias = Math.floor((hoje - partoData) / (1000 * 60 * 60 * 24));
    return dias;
  }, [dataUltimoParto]);

  const delPorCiclo = useMemo(() => {
    const base = calcularDELPorCiclo(ciclos, (hist.secagens || []), hoje);
    return base.filter(c => c.dias !== null);
  }, [ciclos]);

  const mediaDEL = delPorCiclo.length
    ? Math.round(delPorCiclo.reduce((acc, cur) => acc + cur.dias, 0) / delPorCiclo.length)
    : "—";

  return (
    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
      <Resumo
        titulo="Total de IA"
        valor={totalIA}
        tooltip="Quantidade total de inseminações registradas"
      />
      <Resumo
        titulo="Ciclos com Parto"
        valor={totalPartos}
        tooltip="Número de ciclos com pelo menos um parto registrado"
      />
      <Resumo
        titulo="DEL Atual"
        valor={delAtual}
        tooltip="Dias em Lactação desde o último parto"
        destaque={typeof delAtual === "number" ? delAtual : null}
        onClick={() => setCardAberto(cardAberto === "DEL" ? null : "DEL")}
        expandido={cardAberto === "DEL"}
        detalhes={
          dataUltimoParto && typeof delAtual === "number" ? (
            <>
              <div>📅 Último parto: <strong>{dataUltimoParto}</strong></div>
              <div>⏱️ DEL atual: <strong>{delAtual} dias</strong></div>
              <div>🧮 Secagem prevista: <strong>{calcSecagem(dataUltimoParto)}</strong></div>
            </>
          ) : <div>Sem informações de parto.</div>
        }
      />
      <Resumo
        titulo="Média DEL por Lactação"
        valor={mediaDEL}
        tooltip="Média de dias em lactação por ciclo com parto"
      />
    </div>
  );
}

function calcSecagem(dataPartoStr) {
  const parto = new Date(dataPartoStr.split("/").reverse().join("-"));
  parto.setDate(parto.getDate() + 245);
  return parto.toLocaleDateString("pt-BR");
}

function Resumo({ titulo, valor, tooltip, destaque, detalhes, onClick, expandido }) {
  const cor = (() => {
    if (titulo.includes("DEL") && typeof destaque === "number") {
      if (destaque < 250) return "#bbf7d0";   // verde mais vivo
      if (destaque <= 400) return "#fef08a"; // amarelo forte
      return "#fecaca";                      // vermelho visível
    }
    return "#f8fafc"; // azul acinzentado claro
  })();

  return (
    <div
      onClick={onClick}
      title={tooltip}
      style={{
        flex: "1 1 160px",
        background: cor,
        borderRadius: "0.75rem",
        padding: "1.3rem",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        transition: "transform 0.2s ease-in-out",
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.015)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
    >
      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e40af" }}>{valor}</div>
      <div style={{ fontSize: "0.9rem", color: "#444", marginTop: "0.4rem" }}>{titulo}</div>
      {expandido && detalhes && (
        <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#333", lineHeight: "1.4" }}>
          {detalhes}
        </div>
      )}
    </div>
  );
}
