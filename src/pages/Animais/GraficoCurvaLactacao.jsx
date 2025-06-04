import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function GraficoCurvaLactacao({ dadosLactacao = [], dataParto }) {
  const [lactacoesDisponiveis, setLactacoesDisponiveis] = useState([]);
  const [lactacaoSelecionada, setLactacaoSelecionada] = useState(null);
  const [dadosFiltrados, setDadosFiltrados] = useState([]);
  const [mostrarTabela, setMostrarTabela] = useState(false);

  useEffect(() => {
    const lactacoes = Array.from(
      new Set(dadosLactacao.map((d) => d.lactacao))
    ).sort((a, b) => a - b);
    setLactacoesDisponiveis(lactacoes);
    setLactacaoSelecionada(lactacoes[0] || null);
  }, [dadosLactacao]);

  useEffect(() => {
    if (lactacaoSelecionada != null) {
      const filtrados = dadosLactacao
        .filter((d) => d.lactacao === lactacaoSelecionada)
        .map((d) => {
          let DEL = "—";
          if (dataParto && dataParto.length === 10) {
            const [dia, mes, ano] = dataParto.split('/');
            const dParto = new Date(`${ano}-${mes}-${dia}T12:00:00`);
            const dMedicao = new Date(d.data + "T12:00:00");
            const dias = Math.floor((dMedicao - dParto) / (1000 * 60 * 60 * 24));
            DEL = !isNaN(dias) && dias >= 0 ? dias : "—";
          }
          return {
            ...d,
            DEL,
            dataFormatada: new Date(d.data).toLocaleDateString("pt-BR")
          };
        })
        .sort((a, b) => new Date(a.data) - new Date(b.data));
      setDadosFiltrados(filtrados);
    }
  }, [lactacaoSelecionada, dadosLactacao, dataParto]);

  if (lactacoesDisponiveis.length === 0) {
    return <p className="italic text-gray-500">Sem registros de produção de leite.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Ciclo de Lactação:</label>
        <select
          value={lactacaoSelecionada}
          onChange={(e) => setLactacaoSelecionada(Number(e.target.value))}
          style={{
            padding: "0.75rem",
            borderRadius: "0.6rem",
            border: "1px solid #ccc",
            fontSize: "0.95rem",
            outline: "none"
          }}
        >
          {lactacoesDisponiveis.map((ciclo) => (
            <option key={ciclo} value={ciclo}>{ciclo}ª Lactação</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow p-3">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dadosFiltrados}>
            <CartesianGrid stroke="#e5e7eb" strokeOpacity={0.5} />
            <XAxis dataKey="DEL" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                fontSize: "0.95rem",
                lineHeight: "1.4"
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0] && payload[0].payload) {
                  return `Data: ${new Date(payload[0].payload.data + "T12:00:00").toLocaleDateString("pt-BR")}`;
                }
                return "";
              }}
              formatter={(value, name) => {
                if (name === "litros") return [`${value}`, "Litros"];
                return [`${value}`, name];
              }}
            />
            <Line
              type="monotone"
              dataKey="litros"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Produção"
            />
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
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#f3f4f6")}
        >
          {mostrarTabela ? "Esconder Tabela ↓" : "Mostrar Tabela ↑"}
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
            marginTop: "0.75rem"
          }}
        >
          <table className="min-w-full text-sm table-fixed border-collapse">
            <thead style={{ backgroundColor: "#f9fafb", color: "#374151" }}>
              <tr>
                <th className="px-4 py-2 border border-[#f1f5f9] text-left">Data</th>
                <th className="px-4 py-2 border border-[#f1f5f9] text-left">Litros</th>
                <th className="px-4 py-2 border border-[#f1f5f9] text-left">DEL</th>
                <th className="px-4 py-2 border border-[#f1f5f9] text-left">Obs.</th>
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.map((l, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 border border-[#f1f5f9] font-medium">
                    {new Date(l.data + "T12:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-2 border border-[#f1f5f9]">{l.litros}</td>
                  <td className="px-4 py-2 border border-[#f1f5f9]">{l.DEL}</td>
                  <td className="px-4 py-2 border border-[#f1f5f9] text-gray-500 italic">{l.obs || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
