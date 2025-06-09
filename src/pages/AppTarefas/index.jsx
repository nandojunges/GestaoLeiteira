// 📁 src/pages/AppTarefas/index.jsx
import React, { useEffect, useState } from 'react';
import DashboardGraficos from './DashboardGraficos';
import {
  eventosDeHoje,
  resumoEventosHoje,
  produtosVencendo,
  contagemStatusVacas,
  getAlertasCriticos,
} from './utilsDashboard';

export default function AppTarefas() {
  const [eventos, setEventos] = useState([]);
  const [resumo, setResumo] = useState({ partos: 0, vacinacoes: 0, secagens: 0 });
  const [vencimentos, setVencimentos] = useState([]);
  const [status, setStatus] = useState({
    lactacao: 0,
    pev: 0,
    negativas: 0,
    preParto: 0,
    carencia: 0,
  });
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const atualizar = () => {
      setEventos(eventosDeHoje());
      setResumo(resumoEventosHoje());
      setVencimentos(produtosVencendo());
      setStatus(() => {
        const s = contagemStatusVacas();
        const car = getAlertasCriticos().filter((a) => /carência/i.test(a.mensagem)).length;
        return { ...s, carencia: car };
      });
      setAlertas(getAlertasCriticos());
    };
    atualizar();
    const evts = [
      'eventosExtrasAtualizados',
      'animaisAtualizados',
      'produtosAtualizados',
      'manejosSanitariosAtualizados',
      'examesSanitariosAtualizados',
      'ciclosLimpezaAtualizados',
      'alertasCarenciaAtualizados',
    ];
    evts.forEach((e) => window.addEventListener(e, atualizar));
    return () => evts.forEach((e) => window.removeEventListener(e, atualizar));
  }, []);

  const irParaCalendario = () => {
    localStorage.setItem('ultimaAba', 'calendario');
    window.location.reload();
  };

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {[
        { titulo: 'Vacas em lactação', valor: status.lactacao, cor: 'text-green-600', icone: '🐄' },
        { titulo: 'Vacas em PEV', valor: status.pev, cor: 'text-orange-600', icone: '🧪' },
        { titulo: 'Diagnóstico negativo', valor: status.negativas, cor: 'text-red-600', icone: '❌' },
        { titulo: 'Pré-parto', valor: status.preParto, cor: 'text-blue-600', icone: '🤰' },
        { titulo: 'Carência leite/carne', valor: status.carencia, cor: 'text-yellow-600', icone: '⚠️' },
      ].map((c, i) => (
        <div
          key={i}
          className="bg-white shadow-md rounded-2xl p-4 flex justify-between items-center transition-all duration-300 hover:scale-105"
        >
          <div>
            <div className="text-gray-600 text-sm">{c.titulo}</div>
            <div className={`text-3xl font-bold ${c.cor}`}>{c.valor}</div>
          </div>
          <div className="text-4xl">{c.icone}</div>
        </div>
      ))}

      <div className="sm:col-span-2 md:col-span-3 space-y-2">
        <h2 className="text-xl font-bold mb-2">📌 Alertas Atuais</h2>
        {alertas.map((a, i) => (
          <div
            key={i}
            className="bg-yellow-100 text-yellow-800 rounded-xl p-4 shadow flex items-center justify-between"
          >
            <span>⚠️ {a.mensagem}</span>
          </div>
        ))}
      </div>

      <div className="sm:col-span-2 md:col-span-3 space-y-2">
        <h2 className="text-xl font-bold mb-2">🔍 Diagnósticos Reprodutivos</h2>
        <DashboardGraficos />
      </div>

      <div className="sm:col-span-2 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          '➕ Cadastrar Animal',
          '📋 Nova Medição de Leite',
          '💉 Registrar Aplicação',
          '📦 Novo Produto',
        ].map((txt, i) => (
          <button
            key={i}
            className="flex-1 bg-blue-600 text-white rounded-xl py-3 px-4 shadow hover:bg-blue-700 transition-all duration-300"
          >
            {txt}
          </button>
        ))}
      </div>

      <div className="sm:col-span-2 md:col-span-3 bg-white rounded-xl shadow p-4 space-y-2">
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
