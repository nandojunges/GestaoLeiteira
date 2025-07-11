import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import gerarEventosCalendario from '@/utils/gerarEventosCalendario';
import VisualizarEventosDia from './VisualizarEventosDia';
import './calendario.css';
import { buscarTodos } from "../../utils/backendApi";

export default function CalendarioAtividades() {
  const [extras, setExtras] = useState([]);
  const [autoEventos, setAutoEventos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [mostrarRotineiros, setMostrarRotineiros] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(null);

  const [categorias, setCategorias] = useState({
    parto: true,
    secagem: true,
    preparto: true,
    vacina: true,
    exame: true,
    limpeza: true,
    estoque: true,
    checkup: true,
    dispositivo: true,
    hormonio: true,
    tratamento: true,
    protocolo: true,
  });


  const getIcone = (tipo) => {
    if (tipo === 'parto') return '/icones/parto.png';
    if (tipo === 'secagem') return '/icones/secagem.png';
    if (tipo === 'dispositivo') return '/icones/dispositivoIATF.png';
    if (tipo === 'hormonio') return '/icones/aplicacao.png';
    if (tipo === 'tratamento') return '/icones/tratamento.png';
    if (tipo === 'protocolo') return '/icones/protocoloIATF.png';
    if (tipo === 'vacina') return '/icones/aplicacao.png';
    return null;
  };

  const eventContent = (info) => {
    const tipo = info.event.extendedProps.tipo;
    const icon = getIcone(tipo);
    if (!icon) return null;
    return {
      domNodes: [
        (() => {
          const img = document.createElement('img');
          img.src = icon;
          img.alt = tipo;
          img.className = 'icone-tarefa';
          const wrap = document.createElement('div');
          wrap.appendChild(img);
          return wrap;
        })(),
      ],
    };
  };

  const renderDayCell = (arg) => {
    const data = arg.date.toISOString().split('T')[0];
    const eventosDoDia = filtrados.filter((e) => (e.date || e.data) === data);

    let html = `<div style="text-align:center;">${arg.dayNumberText}</div>`;

    const icones = eventosDoDia
      .map((event) => {
        const tipo = event.tipo;
        const icon = getIcone(tipo);
        if (!icon) return '';
        return `<img src="${icon}" alt="${tipo}" class="icone-tarefa" />`;
      })
      .join('');

    html += icones;
    return { html };
  };

  useEffect(() => {
    const carregarExtras = async () => {
      try {
        const eventosExtras = await buscarTodos('eventos');
        const lista = Array.isArray(eventosExtras) ? eventosExtras : [];
        setExtras(lista.map((e) => ({ prioridadeVisual: true, ...e })));
      } catch (err) {
        console.error('Erro ao carregar eventos extras:', err);
        setExtras([]);
      }
    };
    carregarExtras();

    let carregando = false;
    const atualizar = async () => {
      if (carregando) return;
      carregando = true;
      const eventos = await gerarEventosCalendario();
      setAutoEventos(Array.isArray(eventos) ? eventos : []);
      carregando = false;
    };
    atualizar();

    const eventos = [
      'animaisAtualizados',
      'manejosSanitariosAtualizados',
      'produtosAtualizados',
      'ciclosLimpezaAtualizados',
    ];
    eventos.forEach((e) => window.addEventListener(e, atualizar));
    return () => eventos.forEach((e) => window.removeEventListener(e, atualizar));
  }, []);

  useEffect(() => {
    const salvarExtras = async () => {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${import.meta.env.VITE_API_URL || '/api'}/eventos`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(extras),
        });
      } catch (err) {
        console.error('Erro ao salvar eventos extras:', err);
      }
    };
    salvarExtras();

    const todos = [...autoEventos, ...extras];
    setFiltrados(
      todos.filter(
        (ev) => categorias[ev.tipo] && (ev.prioridadeVisual || mostrarRotineiros)
      )
    );
  }, [extras, autoEventos, categorias, mostrarRotineiros]);

  const toggleCat = (c) => setCategorias((p) => ({ ...p, [c]: !p[c] }));
  const toggleRotineiros = () => setMostrarRotineiros((p) => !p);

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
          eventContent={eventContent}
          dayCellContent={renderDayCell}
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
