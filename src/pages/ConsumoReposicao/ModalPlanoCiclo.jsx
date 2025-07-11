import React, { useEffect } from "react";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const overlay = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  background: "#fff",
  borderRadius: "1rem",
  width: "600px",
  maxHeight: "90vh",
  overflow: "hidden",
  fontFamily: "Poppins, sans-serif",
  display: "flex",
  flexDirection: "column",
};

const header = {
  background: "#1e40af",
  color: "white",
  padding: "1rem 1.5rem",
  fontWeight: "bold",
  fontSize: "1.1rem",
  borderTopLeftRadius: "1rem",
  borderTopRightRadius: "1rem",
  textAlign: "center",
};

const botaoConfirmar = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "0.6rem 1.4rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "600",
};

function parseCond(c) {
  if (!c) return { tipo: "sempre" };
  if (typeof c === "object") return c;
  if (c === "sempre") return { tipo: "sempre" };
  const m = c.match(/a cada\s*(\d+)/i);
  if (m) return { tipo: "cada", intervalo: parseInt(m[1]) };
  if (c.toLowerCase().includes("manhã")) return { tipo: "manha" };
  if (c.toLowerCase().includes("tarde")) return { tipo: "tarde" };
  return { tipo: "sempre" };
}

export default function ModalPlanoCiclo({ ciclo, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!ciclo) return null;

  const freq = parseInt(ciclo.frequencia || 1);
  const etapas = ciclo.etapas || [
    { produto: ciclo.produto, quantidade: ciclo.quantidade, unidade: ciclo.unidade, condicao: { tipo: "sempre" } }
  ];

  const cont = etapas.map(() => 0);
  const dias = [];

  for (let d = 0; d < 7; d++) {
    if (!ciclo.diasSemana?.includes(d)) continue;
    const execs = [];
    for (let exec = 0; exec < freq; exec++) {
      const horario = freq === 1 ? "" : exec === 0 ? "Manhã" : exec === 1 ? "Tarde" : `Ordenha ${exec + 1}`;
      const itens = [];
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
      if (itens.length) execs.push({ horario, itens });
    }
    if (execs.length) dias.push({ dia: DIAS[d], execs });
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>Plano de Limpeza</div>
        <div style={{ padding: "1rem", fontSize: "1rem", lineHeight: 1.5, overflowY: "auto", maxHeight: "80vh" }}>
          {dias.map((dia) => (
            <div key={dia.dia} style={{ marginBottom: "0.75rem" }}>
              <div style={{ fontWeight: "600" }}>📅 {dia.dia}</div>
              {dia.execs.map((ex, idx) => (
                <div key={idx} style={{ marginLeft: "1rem" }}>
                  {ex.horario && (
                    <div>
                      {ex.horario === "Manhã" ? "🕘" : ex.horario === "Tarde" ? "🌇" : ex.horario}
                      {ex.horario ? ":" : ""}
                    </div>
                  )}
                  <ul style={{ listStyle: "disc", marginLeft: "1.2rem" }}>
                    {ex.itens.map((it, i) => (
                      <li key={i}> {it} </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "right", padding: "0 1rem 1rem" }}>
          <button onClick={onClose} style={botaoConfirmar}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

