import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import gerarEventosCalendario from '../../utils/gerarEventosCalendario';
import './calendario.css';

export default function CalendarioAtividades() {
  const [extras, setExtras] = useState([]);
  const [autoEventos, setAutoEventos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [categorias, setCategorias] = useState({
    parto: true,
    secagem: true,
    preparto: true,
    vacina: true,
    exame: true,
    limpeza: true,
    estoque: true,
    checkup: true,
  });
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [titulo, setTitulo] = useState('');

  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem('eventosExtras') || '[]');
    setExtras(salvos);

    const atualizar = () => setAutoEventos(gerarEventosCalendario());
    atualizar();

    const eventos = [
      'animaisAtualizados',
      'manejosSanitariosAtualizados',
      'produtosAtualizados',
      'ciclosLimpezaAtualizados',
      'examesSanitariosAtualizados',
    ];
    eventos.forEach((e) => window.addEventListener(e, atualizar));
    return () => eventos.forEach((e) => window.removeEventListener(e, atualizar));
  }, []);

  useEffect(() => {
    localStorage.setItem('eventosExtras', JSON.stringify(extras));
    const todos = [...autoEventos, ...extras];
    setFiltrados(todos.filter((ev) => categorias[ev.tipo]));
  }, [extras, autoEventos, categorias]);

  const toggleCat = (c) => {
    setCategorias((p) => ({ ...p, [c]: !p[c] }));
  };

  const adicionarEvento = () => {
    if (!titulo.trim() || !dataSelecionada) return;
    const novo = {
      title: titulo,
      date: dataSelecionada,
      tipo: 'checkup',
      color: '#95A5A6',
    };
    setExtras((prev) => [...prev, novo]);
    setTitulo('');
    setDataSelecionada(null);
  };

  return (
    <div className="w-full min-h-screen bg-white p-6 overflow-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-900 text-center">📅 Calendário de Atividades</h1>

      <div className="flex flex-wrap gap-4 justify-center mb-4">
        {Object.keys(categorias).map((cat) => (
          <label key={cat} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={categorias[cat]} onChange={() => toggleCat(cat)} />
            <span className="capitalize">{cat}</span>
          </label>
        ))}
      </div>

      <div className="max-w-6xl mx-auto bg-white p-4 rounded-xl shadow-md">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          events={filtrados}
          selectable={true}
          dateClick={(info) => setDataSelecionada(info.dateStr)}
          height="auto"
        />
      </div>

      {dataSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Novo Check-up</h2>
            <p className="text-sm text-gray-500 mb-2">
              📆 {new Date(dataSelecionada).toLocaleDateString('pt-BR')}
            </p>
            <input
              type="text"
              placeholder="Título do check-up"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setDataSelecionada(null)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition">
                Cancelar
              </button>
              <button onClick={adicionarEvento} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
