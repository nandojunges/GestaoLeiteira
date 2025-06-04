import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function SecaoCCS({ ccs = [] }) {
  const [mostrarTabela, setMostrarTabela] = useState(false);

  if (!ccs || ccs.length === 0) {
    return <p className="italic text-gray-500">Sem registros de CCS.</p>;
  }

  // Ordena por data (crescente)
  const dadosOrdenados = [...ccs].sort(
    (a, b) => new Date(a.data) - new Date(b.data)
  );

  // Prepara dados para o gráfico (converte datas para "pt-BR")
  const dadosGrafico = dadosOrdenados.map((r) => ({
    data: new Date(r.data + "T12:00:00").toLocaleDateString("pt-BR"),
    valor: r.valor
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">📈 CCS Individual</h3>
      {/* Gráfico */}
      <div className="bg-white rounded-xl shadow p-3">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dadosGrafico}>
            <CartesianGrid stroke="#e5e7eb" strokeOpacity={0.5} />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip
              formatter={(v) => [`${v}`, "CCS"]}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Botão Mostrar/Esconder Histórico */}
      <div className="flex justify-end">
        <button
          onClick={() => setMostrarTabela((prev) => !prev)}
          style={{
            background: "#f3f4f6",
            border: "1px solid #d1d5db",
            padding: "0.6rem 1rem",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: "500",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#e5e7eb"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#f3f4f6"}
        >
          {mostrarTabela ? "Esconder Histórico ↓" : "Mostrar Histórico ↑"}
        </button>
      </div>

      {/* Tabela de Histórico */}
      {mostrarTabela && (
        <div
          style={{
            transition: "all 0.4s ease",
            overflow: "hidden",
            borderRadius: "0.75rem",
            border: "1px solid #e5e7eb",
            boxShadow: "0 0 4px rgba(0,0,0,0.1)",
            marginTop: "0.75rem",
          }}
        >
          <table className="min-w-full text-sm table-fixed border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border border-[#f1f5f9] text-left">Data</th>
                <th className="px-4 py-2 border border-[#f1f5f9] text-left">CCS (cél/mL)</th>
              </tr>
            </thead>
            <tbody>
              {dadosOrdenados.map((r, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 border border-[#f1f5f9] font-medium">
                    {new Date(r.data + "T12:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-2 border border-[#f1f5f9]">{r.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
