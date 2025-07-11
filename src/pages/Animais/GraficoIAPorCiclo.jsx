// src/components/GraficosReproducao/GraficoIAPorCiclo.jsx
import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line
} from "recharts";

export default function GraficoIAPorCiclo({ ciclos }) {
  const dados = (ciclos || []).map((c, i) => {
    const totalIA = c.ia?.length || 0;
    if (totalIA === 0) {
      return {
        ciclo: `Ciclo ${i + 1}`,
        positivas: 0,
        negativas: 0,
        taxa: 0,
      };
    }

    let positivas = 0;
    let negativas = 0;

    const partoData = c.parto?.data
      ? new Date(c.parto.data.split("/").reverse().join("-"))
      : null;

    const ordenadas = [...c.ia].sort((a, b) => {
      const d1 = new Date(a.data.split("/").reverse().join("-"));
      const d2 = new Date(b.data.split("/").reverse().join("-"));
      return d1 - d2;
    });

    // Identificar última IA válida para considerar como positiva
    let indiceUltimaValida = -1;
    if (partoData) {
      for (let j = ordenadas.length - 1; j >= 0; j--) {
        const iaDate = new Date(ordenadas[j].data.split("/").reverse().join("-"));
        if (iaDate < partoData) {
          indiceUltimaValida = j;
          break;
        }
      }
    }

    ordenadas.forEach((ia, idx) => {
      if (ia.diagnostico === "positivo") {
        positivas++;
      } else if (!ia.diagnostico && idx === indiceUltimaValida) {
        positivas++;
      } else {
        negativas++;
      }
    });

    const taxa = (positivas + negativas) > 0
      ? Math.round((positivas / (positivas + negativas)) * 100)
      : 0;

    return {
      ciclo: `Ciclo ${i + 1}`,
      positivas,
      negativas,
      taxa,
    };
  });

  return (
    <div style={{ marginBottom: "3rem" }}>
      <h3 style={{ fontWeight: "bold", marginBottom: "0.75rem", fontSize: "1.2rem" }}>
        IA por Ciclo – Resultado e Eficiência
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={dados} margin={{ top: 40, right: 60, left: 40, bottom: 10 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis dataKey="ciclo" tick={{ fontSize: 14 }} angle={-15} textAnchor="end" />
          <YAxis yAxisId="esquerda" allowDecimals={false} tick={{ fontSize: 14 }} />
          <YAxis
            yAxisId="direita"
            orientation="right"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 14 }}
          />

          <Tooltip
            formatter={(value, name) => {
              if (name === "taxa") return [`${value}%`, "Taxa de Sucesso"];
              if (name === "positivas") return [value, "IA Positiva"];
              if (name === "negativas") return [value, "IA Negativa"];
              return [value, name];
            }}
            labelFormatter={(label) => `${label}`}
            contentStyle={{
              backgroundColor: "#1e293b",
              borderRadius: "0.5rem",
              color: "#fff",
              border: "none"
            }}
          />

          <Bar yAxisId="esquerda" dataKey="negativas" stackId="ia" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="esquerda" dataKey="positivas" stackId="ia" fill="#10b981" radius={[4, 4, 0, 0]} />

          <Line
            yAxisId="direita"
            type="monotone"
            dataKey="taxa"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          marginTop: "1rem",
          fontWeight: 600
        }}
      >
        <span style={{ color: "#10b981" }}>🟢 IA com diagnóstico ou parto</span>
        <span style={{ color: "#ef4444" }}>🔴 IA sem confirmação</span>
        <span style={{ color: "#3b82f6" }}>🔵 Taxa de sucesso (%)</span>
      </div>
    </div>
  );
}
