import React, { useEffect, useState } from 'react';
import { contagemStatusVacas } from './utilsDashboard';

export default function DashboardCards() {
  const [dados, setDados] = useState({ lactacao: 0, pev: 0, negativas: 0, preParto: 0 });

  useEffect(() => {
    const atualizar = async () => setDados(await contagemStatusVacas());
    atualizar();
    window.addEventListener('animaisAtualizados', atualizar);
    return () => window.removeEventListener('animaisAtualizados', atualizar);
  }, []);

  const cards = [
    {
      cor: 'bg-green-500 text-white',
      icone: '\u{1F7E2}',
      titulo: 'Vacas em lactação',
      valor: dados.lactacao,
    },
    {
      cor: 'bg-orange-400 text-black',
      icone: '\u{1F7E0}',
      titulo: 'Vacas em PEV',
      valor: dados.pev,
    },
    {
      cor: 'bg-red-500 text-white',
      icone: '\u{1F534}',
      titulo: 'Diagnóstico negativo',
      valor: dados.negativas,
    },
    {
      cor: 'bg-blue-500 text-white',
      icone: '\u{1F535}',
      titulo: 'Vacas em pré-parto',
      valor: dados.preParto,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className={`${c.cor} p-4 rounded-xl shadow-md flex justify-between items-center`}>
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
