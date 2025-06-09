import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#facc15", "#3b82f6"];

export default function AppTarefas() {
  const [carencias, setCarencias] = useState([]);
  const [dados, setDados] = useState({
    lactacao: 4,
    pev: 2,
    negativos: 0,
    preParto: 0,
    carencia: 1,
  });

  useEffect(() => {
    const dadosCarencia = JSON.parse(localStorage.getItem("alertasCarencia") || "[]");
    setCarencias(dadosCarencia);
  }, []);

  const graficoRepro = [
    { name: "Prenhez Confirmada", value: 1 },
    { name: "PEV", value: dados.pev },
    { name: "Negativo", value: dados.negativos },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Blocos de indicadores */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <Card indicador="🐄 Vacas em Lactação" valor={dados.lactacao} cor="text-green-600" />
        <Card indicador="🧪 Vacas em PEV" valor={dados.pev} cor="text-orange-600" />
        <Card indicador="❌ Negativos" valor={dados.negativos} cor="text-red-600" />
        <Card indicador="🤰 Pré-parto" valor={dados.preParto} cor="text-blue-600" />
        <Card indicador="⚠️ Carência leite/carne" valor={dados.carencia} cor="text-yellow-600" />
      </div>

      {/* Alertas ativos */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 shadow">
        <h2 className="text-lg font-bold mb-2">🔔 Alertas Atuais</h2>
        {carencias.length === 0 && <p className="text-gray-500">Nenhum alerta ativo.</p>}
        {carencias.map((c, i) => (
          <div key={i} className="text-sm font-medium text-yellow-800">
            ⚠️ Vaca {c.numeroAnimal} em carência de leite até {c.leiteAte} e carne até {c.carneAte}
          </div>
        ))}
      </div>

      {/* Gráfico reprodutivo */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-bold mb-4">🧬 Diagnósticos Reprodutivos</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={graficoRepro}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {graficoRepro.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Sugestões inteligentes */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-2">💡 Sugestões Inteligentes</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          <li>🔁 Programe pré-sincronização para vaca 15 — PEV prestes a encerrar</li>
          <li>📦 Estoque de Alcamax previsto para acabar em 3 dias</li>
          <li>📅 Realizar diagnóstico reprodutivo em 2 vacas com +30 dias de IA</li>
        </ul>
      </div>
    </div>
  );
}

function Card({ indicador, valor, cor }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center text-center">
      <span className={`text-xs font-semibold mb-1 ${cor}`}>{indicador}</span>
      <span className="text-3xl font-bold">{valor}</span>
    </div>
  );
}
