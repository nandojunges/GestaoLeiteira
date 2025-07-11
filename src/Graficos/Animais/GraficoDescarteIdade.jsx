import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { buscarTodos } from '../../utils/backendApi';

export default function GraficoDescarteIdade() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    buscarTodos('animais').then((lista) => {
      const freq = {};
      (lista || [])
        .filter((a) => (a.status || '').toLowerCase() === 'inativo')
        .forEach((a) => {
          const idade = parseInt(a.idade, 10);
          if (!isNaN(idade)) {
            freq[idade] = (freq[idade] || 0) + 1;
          }
        });
      const arr = Object.keys(freq)
        .map((i) => ({ idade: i, total: freq[i] }))
        .sort((a, b) => a.idade - b.idade);
      setDados(arr);
    });
  }, []);

  if (!dados.length) {
    return (
      <p className="italic text-gray-500">Nenhuma informação de descarte disponível.</p>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-bold mb-2">Idade ao Descarte</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={dados} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="idade" label={{ value: 'Idade (anos)', position: 'insideBottom', offset: -5 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
