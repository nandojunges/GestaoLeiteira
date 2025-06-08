// 📁 src/pages/AppTarefas/index.jsx
import React, { useEffect, useState } from 'react';
import DashboardAlertas from './DashboardAlertas';
import DashboardCards from './DashboardCards';
import DashboardGraficos from './DashboardGraficos';
import {
  eventosDeHoje,
  resumoEventosHoje,
  produtosVencendo,
} from './utilsDashboard';

export default function AppTarefas() {
  const [eventos, setEventos] = useState([]);
  const [resumo, setResumo] = useState({ partos: 0, vacinacoes: 0, secagens: 0 });
  const [vencimentos, setVencimentos] = useState([]);

  useEffect(() => {
    const atualizar = () => {
      setEventos(eventosDeHoje());
      setResumo(resumoEventosHoje());
      setVencimentos(produtosVencendo());
    };
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
    <div className="p-4 space-y-6">
      <section>
        <DashboardCards />
      </section>

      <DashboardAlertas />

      <section className="space-y-2">
        <h2 className="font-bold border-b pb-1">🧬 Diagnósticos Reprodutivos</h2>
        <DashboardGraficos />
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <h3 className="font-bold border-b pb-1">📅 Eventos de Hoje</h3>
        <p className="text-sm text-gray-700">
          {`Partos: ${resumo.partos} · Vacinações: ${resumo.vacinacoes} · Secagens: ${resumo.secagens}`}
        </p>
        <ul className="space-y-1">
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
        {vencimentos.length > 0 && (
          <div>
            <p className="font-semibold mt-2">🗓️ Produtos vencendo</p>
            <ul className="list-disc ml-4 space-y-1 text-sm">
              {vencimentos.map((v, i) => (
                <li key={i}>{v.nomeComercial} - {v.validade}</li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={irParaCalendario} className="text-blue-600 underline text-sm">
          Ver todos os eventos
        </button>
      </div>
    </div>
  );
}
