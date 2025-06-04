// src/pages/Animais/LinhaDoTempoReprodutiva.jsx
import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
  Cell
} from "recharts";

const icones = {
  IA: "💉",
  Parto: "👶",
  Diagnostico: "🩺",
  Secagem: "🛑",
  Tratamento: "💊"
};

const corPorTipo = {
  IA: "#3b82f6",
  Parto: "#22c55e",
  Diagnostico: "#0ea5e9",
  Secagem: "#a855f7",
  Tratamento: "#f97316"
};

const ordemTipo = ["IA", "Diagnostico", "Tratamento", "Secagem", "Parto"];

export default function LinhaDoTempoReprodutiva({ eventos = [] }) {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const convertidos = (eventos || [])
      .filter((e) => e.data && e.tipo)
      .map((e) => {
        const [dia, mes, ano] = e.data.split("/");
        const dataNum = new Date(`${ano}-${mes}-${dia}`).getTime();
        return {
          ...e,
          dataNum,
          y: ordemTipo.indexOf(e.tipo)
        };
      })
      .sort((a, b) => a.dataNum - b.dataNum);

    setDados(convertidos);
  }, [eventos]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const e = payload[0].payload;

    return (
      <div style={{
        background: "#1e293b",
        color: "#fff",
        padding: "0.75rem",
        borderRadius: "0.5rem",
        fontSize: "0.85rem",
        minWidth: "180px"
      }}>
        <div><strong>{icones[e.tipo] || "❔"} {e.tipo}</strong></div>
        <div>📅 {e.data}</div>
        {e.touro && e.touro !== "—" && <div>🐂 {e.touro}</div>}
        {e.inseminador && e.inseminador !== "—" && <div>👤 {e.inseminador}</div>}
        {e.subtipo && e.subtipo !== "—" && <div>🔹 {e.subtipo}</div>}
        {e.obs && e.obs !== "—" && <div>📝 {e.obs}</div>}
      </div>
    );
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ fontWeight: "bold", marginBottom: "1rem" }}>
        🗓️ Linha do Tempo Reprodutiva
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="dataNum"
            domain={["auto", "auto"]}
            tickFormatter={(value) => {
              const d = new Date(value);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, ordemTipo.length - 1]}
            tickFormatter={(index) => ordemTipo[index]}
            tick={{ fontSize: 13 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }} />
          <Scatter data={dados} shape="circle">
            {dados.map((e, i) => (
              <Cell key={`cell-${i}`} fill={corPorTipo[e.tipo] || "#64748b"} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
