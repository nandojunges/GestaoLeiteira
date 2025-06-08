import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import gerarEventosCalendario from '../../utils/gerarEventosCalendario';
import VisualizarEventosDia from './VisualizarEventosDia';
import './calendario.css';

export default function CalendarioAtividades() {
  const [extras, setExtras] = useState([]);
  const [autoEventos, setAutoEventos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [mostrarRotineiros, setMostrarRotineiros] = useState(false);
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

  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem('eventosExtras') || '[]').map((e) => ({ prioridadeVisual: true, ...e }));
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
    setFiltrados(
      todos.filter(
        (ev) => categorias[ev.tipo] && (ev.prioridadeVisual || mostrarRotineiros)
      )
    );
  }, [extras, autoEventos, categorias, mostrarRotineiros]);

  const toggleCat = (c) => {
    setCategorias((p) => ({ ...p, [c]: !p[c] }));
  };

  const toggleRotineiros = () => {
    setMostrarRotineiros((p) => !p);
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

      <div className="flex justify-center mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={mostrarRotineiros} onChange={toggleRotineiros} />
          Mostrar eventos rotineiros (limpeza, rotina)
        </label>
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
        <VisualizarEventosDia
          data={dataSelecionada}
          eventos={[...autoEventos, ...extras]}
          mostrarRotineiros={mostrarRotineiros}
          onToggleRotineiros={toggleRotineiros}
          onFechar={() => setDataSelecionada(null)}
        />
      )}
    </div>
  );
}
