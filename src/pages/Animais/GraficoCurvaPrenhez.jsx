// src/components/GraficosReproducao/GraficoCurvaPrenhez.jsx
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  ReferenceLine // ✅ Importação corrigida
} from "recharts";

export default function GraficoCurvaPrenhez({ curvaPrenhez }) {
  if (!curvaPrenhez || curvaPrenhez.length === 0) {
    return <p style={{ color: "#888", fontStyle: "italic" }}>Nenhum diagnóstico positivo com data de IA encontrada.</p>;
  }

  // Ordena por data crescente
  const dados = [...curvaPrenhez]
    .sort((a, b) => new Date(a.data.split("/").reverse().join("-")) - new Date(b.data.split("/").reverse().join("-")))
    .map((item, index) => ({
      data: item.data || `Dia ${index + 1}`,
      dias: item.dias ?? 0
    }));

  const mediaDias = dados.length
    ? dados.reduce((soma, item) => soma + item.dias, 0) / dados.length
    : null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Curva de Prenhez Real</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="data" angle={-15} textAnchor="end" />
          <YAxis label={{ value: "Dias até confirmação", angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={(value) => `${value} dias`} />
          <Line dataKey="dias" stroke="#f59e0b" strokeWidth={2} dot />
          {mediaDias !== null && (
            <ReferenceLine
              y={mediaDias}
              stroke="#e11d48"
              strokeDasharray="3 3"
              label={{
                value: `Média (${mediaDias.toFixed(1)} dias)`,
                position: "top",
                fill: "#e11d48",
                fontSize: 12
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
