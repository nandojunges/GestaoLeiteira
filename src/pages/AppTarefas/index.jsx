// 📁 src/pages/AppTarefas/index.jsx
import React, { useEffect, useState } from 'react';
import DashboardAlertas from './DashboardAlertas';
import DashboardCards from './DashboardCards';
import DashboardGraficos from './DashboardGraficos';
import { eventosDeHoje } from './utilsDashboard';

export default function AppTarefas() {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const atualizar = () => setEventos(eventosDeHoje());
    atualizar();
    const evts = [
      'eventosExtrasAtualizados',
      'animaisAtualizados',
      'produtosAtualizados',
      'manejosSanitariosAtualizados',
      'examesSanitariosAtualizados',
      'ciclosLimpezaAtualizados',
    ];
    evts.forEach((e) => window.addEventListener(e, atualizar));
    return () => evts.forEach((e) => window.removeEventListener(e, atualizar));
  }, []);

  const irParaCalendario = () => {
    localStorage.setItem('ultimaAba', 'calendario');
    window.location.reload();
  };

  return (
    <div className="p-4 space-y-4">
      <DashboardAlertas />
      <DashboardCards />
      <DashboardGraficos />

      <div className="flex flex-wrap gap-4">
        {[
          '➕ Cadastrar Animal',
          '📋 Nova Medição de Leite',
          '💉 Registrar Aplicação',
          '📦 Novo Produto',
        ].map((txt, i) => (
          <button
            key={i}
            className="flex-1 bg-blue-600 text-white rounded-xl py-3 px-4 shadow hover:bg-blue-700 transition"
          >
            {txt}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-bold mb-2">📅 Eventos de Hoje</h3>
        <ul className="space-y-1 mb-2">
          {eventos.map((ev, i) => (
            <li
              key={i}
              className={ev.prioridadeVisual ? 'text-red-600' : 'text-gray-600'}
            >
              {ev.prioridadeVisual ? '⚠️' : '🔧'} {ev.title}
            </li>
          ))}
          {eventos.length === 0 && <li className="text-gray-500">Nenhum evento</li>}
        </ul>
        <button onClick={irParaCalendario} className="text-blue-600 underline text-sm">
          Ver todos os eventos
        </button>
      </div>
    </div>
  );
}
