import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { diagnosticosPorStatus } from '../utilsDashboard';

export default function GraficosRepro() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const atualizar = async () => setDados(await diagnosticosPorStatus());
    atualizar();
    window.addEventListener('animaisAtualizados', atualizar);
    return () => window.removeEventListener('animaisAtualizados', atualizar);
  }, []);

  const cores = ['#4ade80', '#f87171', '#fbbf24'];

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-bold mb-2">🧬 Diagnósticos Reprodutivos</h3>
      {dados.length === 0 ? (
        <p className="text-gray-500 italic">Ainda não há diagnósticos lançados.</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={dados} dataKey="valor" nameKey="status" outerRadius={80}>
              {dados.map((_, i) => (
                <Cell key={i} fill={cores[i % cores.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
