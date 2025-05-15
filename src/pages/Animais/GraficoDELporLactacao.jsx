// src/components/GraficosReproducao/GraficoDELporLactacao.jsx
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

export default function GraficoDELporLactacao({ delPorCiclo }) {
  const dados = (delPorCiclo || []).map((item, index) => ({
    ciclo: item.ciclo || `Ciclo ${index + 1}`,
    dias: item.dias ?? 0
  }));

  const corPorDEL = (dias) => {
    if (dias < 200) return "#10b981"; // verde
    if (dias <= 300) return "#facc15"; // amarelo
    return "#ef4444"; // vermelho
  };

  const mediaDEL = dados.length
    ? dados.reduce((acc, d) => acc + d.dias, 0) / dados.length
    : null;

  return (
    <div style={{ marginBottom: "3rem" }}>
      <h3 style={{ fontWeight: "bold", marginBottom: "0.75rem", fontSize: "1.2rem" }}>
        DEL por Lactação (dias)
      </h3>

      <ResponsiveContainer width="100%" height={60 + dados.length * 60}>
        <BarChart
          layout="vertical"
          data={dados}
          barSize={26}
          margin={{ top: 30, right: 60, left: 90, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeWidth={1.2} />
          <XAxis type="number" domain={[0, "dataMax + 30"]} tick={{ fontSize: 14 }} />
          <YAxis
            dataKey="ciclo"
            type="category"
            width={90}
            tick={{ fontSize: 14, fontWeight: 600 }}
          />
          <Tooltip
            formatter={(value) => `${value} dias`}
            labelFormatter={(label) => `Ciclo: ${label}`}
          />

          {/* Linha da MÉDIA - Azul */}
          {mediaDEL !== null && (
            <ReferenceLine
              x={mediaDEL}
              stroke="#1e40af"
              strokeDasharray="3 3"
              strokeWidth={2}
            />
          )}

          {/* Linha do IDEAL - Verde */}
          <ReferenceLine
            x={305}
            stroke="#22c55e"
            strokeDasharray="4 4"
            strokeWidth={2}
          />

          {/* Linha CRÍTICA - Vermelha */}
          <ReferenceLine
            x={400}
            stroke="#dc2626"
            strokeDasharray="5 5"
            strokeWidth={2}
          />

          <Bar
            dataKey="dias"
            radius={[0, 8, 8, 0]}
            label={{
              position: "right",
              fill: "#333",
              fontSize: 14,
              fontWeight: 600
            }}
          >
            {dados.map((item, index) => (
              <Cell key={`cell-${index}`} fill={corPorDEL(item.dias)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 🔻 LEGENDA PERSONALIZADA ABAIXO */}
      <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1rem" }}>
        <span style={{ color: "#15803d", fontWeight: "600" }}>🟢 Ideal (305 dias)</span>
        <span style={{ color: "#dc2626", fontWeight: "600" }}>🔴 Limite Crítico (400 dias)</span>
        <span style={{ color: "#1e40af", fontWeight: "600" }}>🔵 Média ({Math.round(mediaDEL)} dias)</span>
      </div>
    </div>
  );
}
