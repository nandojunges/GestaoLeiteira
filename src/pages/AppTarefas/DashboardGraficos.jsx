import React, { useEffect, useState } from 'react';
import {
  diagnosticosPorStatus,
  volumeLeitePorGrupo,
  consumoPorCategoria,
} from './utilsDashboard';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export default function DashboardGraficos() {
  const [diag, setDiag] = useState([]);
  const [leite, setLeite] = useState([]);
  const [consumo, setConsumo] = useState([]);

  useEffect(() => {
    const atualizar = () => {
      setDiag(diagnosticosPorStatus());
      setLeite(volumeLeitePorGrupo());
      setConsumo(consumoPorCategoria());
    };
    atualizar();
    window.addEventListener('animaisAtualizados', atualizar);
    window.addEventListener('medicoesAtualizadas', atualizar);
    window.addEventListener('produtosAtualizados', atualizar);
    return () => {
      window.removeEventListener('animaisAtualizados', atualizar);
      window.removeEventListener('medicoesAtualizadas', atualizar);
      window.removeEventListener('produtosAtualizados', atualizar);
    };
  }, []);

  const cores = ['#4ade80', '#f87171', '#a78bfa'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-2">Diagnósticos Reprodutivos</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={diag} dataKey="valor" nameKey="status" innerRadius={40} outerRadius={80}>
              {diag.map((_, i) => (
                <Cell key={i} fill={cores[i % cores.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-2">Leite por Grupo (mês)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={leite} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="grupo" type="category" width={80} />
            <Tooltip />
            <Bar dataKey="litros" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-2">Consumo por Categoria</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={consumo} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="categoria" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="quantidade" fill="#fb923c" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
