import React, { useEffect, useState } from 'react';
import { contagemStatusVacas } from './utilsDashboard';

export default function DashboardCards() {
  const [dados, setDados] = useState({ lactacao: 0, pev: 0, negativas: 0, preParto: 0 });

  useEffect(() => {
    const atualizar = () => setDados(contagemStatusVacas());
    atualizar();
    window.addEventListener('animaisAtualizados', atualizar);
    return () => window.removeEventListener('animaisAtualizados', atualizar);
  }, []);

  const cards = [
    { cor: 'from-green-400 to-green-600', icone: '🐄', titulo: 'Vacas em lactação', valor: dados.lactacao },
    { cor: 'from-yellow-400 to-yellow-600', icone: '⏳', titulo: 'Vacas em PEV', valor: dados.pev },
    { cor: 'from-red-400 to-red-600', icone: '❌', titulo: 'Diagnóstico negativo', valor: dados.negativas },
    { cor: 'from-purple-400 to-purple-600', icone: '🤰', titulo: 'Vacas em pré-parto', valor: dados.preParto },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`bg-gradient-to-r ${c.cor} text-white p-4 rounded-xl shadow-md flex justify-between items-center`}
        >
          <div>
            <p className="text-sm">{c.titulo}</p>
            <p className="text-2xl font-bold">{c.valor}</p>
          </div>
          <div className="text-4xl">{c.icone}</div>
        </div>
      ))}
    </div>
  );
}
