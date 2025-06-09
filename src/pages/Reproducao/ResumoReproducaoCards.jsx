import React from 'react';

export default function ResumoReproducaoCards({ dados }) {
  const cards = [
    { cor: 'bg-orange-400 text-black', icone: '\u{1F7E0}', titulo: 'Vacas em PEV', valor: dados.pev },
    { cor: 'bg-blue-500 text-white', icone: '\u{1F535}', titulo: 'Em protocolo', valor: dados.protocolo },
    { cor: 'bg-red-500 text-white', icone: '\u{1F534}', titulo: 'Diag. pendentes', valor: dados.pendentes },
    { cor: 'bg-green-500 text-white', icone: '\u{2705}', titulo: 'Prenhez confirmada', valor: dados.prenhes },
    { cor: 'bg-indigo-500 text-white', icone: '\u{1F4C8}', titulo: 'Taxa concepção', valor: `${dados.taxa}%` },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((c, i) => (
        <div key={i} className={`${c.cor} p-4 rounded-xl shadow-md flex justify-between items-center`}>
          <div>
            <p className="text-sm">{c.titulo}</p>
            <p className="text-2xl font-bold">{c.valor}</p>
          </div>
          <div className="text-3xl">{c.icone}</div>
        </div>
      ))}
    </div>
  );
}
