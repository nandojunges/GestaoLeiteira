import React, { useState } from "react";

export default function CardBrixColostro({ brix }) {
  const [mostrarHistorico, setMostrarHistorico] = useState(false);

  // Garantir que o Brix seja tratado como um array
  const registros = Array.isArray(brix) ? brix : brix ? [brix] : [];

  if (registros.length === 0) {
    return (
      <div className="bg-white shadow p-4 rounded-md text-sm space-y-1">
        <p className="italic text-gray-500">Sem registro de Brix.</p>
      </div>
    );
  }

  // Ordenar por data (mais recente primeiro)
  const ordenados = registros.sort((a, b) => new Date(b.data) - new Date(a.data));
  const maisRecente = ordenados[0];

  const avaliacao = 
    maisRecente.valor >= 22 ? "Excelente" :
    maisRecente.valor >= 18 ? "Bom" :
    "Baixo";

  return (
    <div className="space-y-4">
      {/* Card principal com o registro mais recente */}
      <div className="bg-white shadow rounded-xl p-4 text-sm space-y-1">
        <h3 className="text-lg font-semibold">🌟 Brix do Colostro</h3>
        <p><strong>Valor:</strong> {maisRecente.valor}%</p>
        <p><strong>Data do parto:</strong> {new Date(maisRecente.data + "T12:00:00").toLocaleDateString("pt-BR")}</p>
        <p><strong>Avaliação:</strong> {avaliacao}</p>
      </div>

      {/* Botão de Mostrar/Esconder Histórico */}
      {registros.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={() => setMostrarHistorico((prev) => !prev)}
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
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f3f4f6")}
          >
            {mostrarHistorico ? "Esconder Histórico ↓" : "Mostrar Histórico ↑"}
          </button>
        </div>
      )}

      {/* Histórico em tabela */}
      {mostrarHistorico && (
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
                <th className="px-4 py-2 border border-[#f1f5f9] text-left">Valor (%)</th>
                <th className="px-4 py-2 border border-[#f1f5f9] text-left">Avaliação</th>
              </tr>
            </thead>
            <tbody>
              {ordenados.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 border border-[#f1f5f9] font-medium">
                    {new Date(r.data + "T12:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-2 border border-[#f1f5f9]">{r.valor}%</td>
                  <td className="px-4 py-2 border border-[#f1f5f9]">
                    {r.valor >= 22 ? "Excelente" : r.valor >= 18 ? "Bom" : "Baixo"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
