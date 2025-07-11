// src/components/GraficosReproducao/GraficoTempoEntrePartos.jsx
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  ReferenceLine
} from "recharts";

export default function GraficoTempoEntrePartos({ tempoEntrePartos }) {
  const dados = (tempoEntrePartos || []).map((item, index) => ({
    ciclo: item.ciclo || `Ciclo ${index + 1}`,
    meses: item.meses ?? 0
  }));

  const corPorMeses = (meses) => {
    if (meses < 14) return "#10b981"; // verde
    if (meses <= 16) return "#facc15"; // amarelo
    return "#ef4444"; // vermelho
  };

  const media = dados.length
    ? dados.reduce((acc, d) => acc + d.meses, 0) / dados.length
    : null;

  return (
    <div style={{ marginBottom: "3rem" }}>
      <h3 style={{ fontWeight: "bold", marginBottom: "0.75rem", fontSize: "1.2rem" }}>
        Tempo entre Partos (em meses)
      </h3>

      <ResponsiveContainer width="100%" height={60 + dados.length * 60}>
        <BarChart
          data={dados}
          margin={{ top: 40, right: 40, left: 40, bottom: 10 }}
          barSize={32}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeWidth={1.2} />
          <XAxis dataKey="ciclo" tick={{ fontSize: 14 }} />
          <YAxis tick={{ fontSize: 14 }} />
          <Tooltip formatter={(value) => `${value} meses`} />

          {/* ✅ Linha ideal */}
          <ReferenceLine
            y={13.5}
            stroke="#15803d"
            strokeDasharray="4 4"
            strokeWidth={2}
          />

          {/* ✅ Linha da média — renderizada apenas uma vez */}
          {media !== null && (
            <ReferenceLine
              y={media}
              stroke="#60a5fa"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={() => null}
            />
          )}

          <Bar dataKey="meses" radius={[4, 4, 0, 0]}>
            {dados.map((item, index) => (
              <Cell key={index} fill={corPorMeses(item.meses)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* ✅ Legenda final */}
      <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1rem" }}>
        <span style={{ color: "#10b981", fontWeight: "600" }}>🟢 Bom (&lt; 14)</span>
        <span style={{ color: "#facc15", fontWeight: "600" }}>🟡 Limite (14&ndash;16)</span>
        <span style={{ color: "#ef4444", fontWeight: "600" }}>🔴 Ruim (&gt; 16)</span>
        {media !== null && (
          <span style={{ color: "#1e40af", fontWeight: "600" }}>
            🔵 Média ({media.toFixed(1)} meses)
          </span>
        )}
      </div>
    </div>
  );
}
