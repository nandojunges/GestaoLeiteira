import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function SecaoCMT({ cmt = [] }) {
  const [mostrarTabela, setMostrarTabela] = useState(false);

  if (cmt.length === 0) {
    return <p className="italic text-gray-500">Sem registros de CMT.</p>;
  }

  const resultadoParaNumero = (res) => {
    switch (res) {
      case "0": return 0;
      case "+": return 1;
      case "++": return 2;
      case "+++": return 3;
      default: return null;
    }
  };

  const dadosGrafico = cmt
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .map((r) => ({
      data: new Date(r.data).toLocaleDateString("pt-BR"),
      PE: resultadoParaNumero(r.cmt?.PE?.resultado),
      PD: resultadoParaNumero(r.cmt?.PD?.resultado),
      AE: resultadoParaNumero(r.cmt?.TE?.resultado),
      AD: resultadoParaNumero(r.cmt?.TD?.resultado),
    }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">📈 Evolução dos Resultados de CMT</h3>
      <div className="bg-white rounded-xl shadow p-3">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dadosGrafico}>
            <CartesianGrid stroke="#e5e7eb" strokeOpacity={0.5} />
            <XAxis dataKey="data" />
            <YAxis
              label={{ value: "Grau", angle: -90, position: "insideLeft" }}
              domain={[0, 3]}
              ticks={[0, 1, 2, 3]}
            />
            <Tooltip />
            <Line type="monotone" dataKey="PE" stroke="#10b981" name="Posterior Esq." dot />
            <Line type="monotone" dataKey="PD" stroke="#f97316" name="Posterior Dir." dot />
            <Line type="monotone" dataKey="AE" stroke="#3b82f6" name="Anterior Esq." dot />
            <Line type="monotone" dataKey="AD" stroke="#ef4444" name="Anterior Dir." dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

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

      {mostrarTabela && (
        <div
          style={{
            transition: "all 0.4s ease",
            overflow: "hidden",
            borderRadius: "0.75rem",
            border: "1px solid #f1f5f9",
            boxShadow: "0 0 4px rgba(0,0,0,0.05)",
            marginTop: "0.75rem",
          }}
        >
          <table className="min-w-full text-sm table-fixed border-collapse">
            <thead style={{ backgroundColor: "#f9fafb", color: "#374151" }}>
              <tr>
                <th className="px-4 py-2 border border-[#f1f5f9] text-left">Data</th>
                <th className="px-4 py-2 border border-[#f1f5f9] text-left">PE</th>
                <th className="px-4 py-2 border border-[#f1f5f9] text-left">PD</th>
                <th className="px-4 py-2 border border-[#f1f5f9] text-left">AE</th>
                <th className="px-4 py-2 border border-[#f1f5f9] text-left">AD</th>
              </tr>
            </thead>
            <tbody>
              {cmt
                .sort((a, b) => new Date(a.data) - new Date(b.data))
                .map((registro, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2 border border-[#f1f5f9] font-medium">
                      {new Date(registro.data).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-2 border border-[#f1f5f9]">{registro.cmt?.PE?.resultado || "—"}</td>
                    <td className="px-4 py-2 border border-[#f1f5f9]">{registro.cmt?.PD?.resultado || "—"}</td>
                    <td className="px-4 py-2 border border-[#f1f5f9]">{registro.cmt?.TE?.resultado || "—"}</td>
                    <td className="px-4 py-2 border border-[#f1f5f9]">{registro.cmt?.TD?.resultado || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
