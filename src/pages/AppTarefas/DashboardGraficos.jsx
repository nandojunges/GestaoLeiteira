import React, { useEffect, useState } from 'react';
import {
  diagnosticosPorStatus,
  consumoVsEstoque,
  producaoLeiteUltimos7Dias,
} from './utilsDashboard';
import DashboardEventos from './DashboardEventos';
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
  LineChart,
  Line,
} from 'recharts';

export default function DashboardGraficos() {
  const [diag, setDiag] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [leite, setLeite] = useState([]);

  useEffect(() => {
    const atualizar = async () => {
      setDiag(await diagnosticosPorStatus());
      setEstoque(await consumoVsEstoque());
      setLeite(await producaoLeiteUltimos7Dias());
    };
    atualizar();
    window.addEventListener('animaisAtualizados', atualizar);
    window.addEventListener('produtosAtualizados', atualizar);
    return () => {
      window.removeEventListener('animaisAtualizados', atualizar);
      window.removeEventListener('produtosAtualizados', atualizar);
    };
  }, []);

  const cores = ['#4ade80', '#f87171', '#a78bfa'];

  return (
    <div className="flex flex-col gap-4">
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
        <h3 className="font-bold mb-2">Produção de Leite</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={leite} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" hide />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-2">Consumo vs. Estoque</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={estoque} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="produto" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="estoque" fill="#60a5fa" name="Estoque" />
            <Bar dataKey="consumoDiario" fill="#f87171" name="Consumo/dia" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-2">Eventos do Mês</h3>
        <DashboardEventos />
      </div>
    </div>
  );
}
