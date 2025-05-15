import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import './calendario.css';

export default function Calendario() {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [categoriasAtivas, setCategoriasAtivas] = useState({
    geral: true,
    parto: true,
    vacina: true,
    ia: true,
    checkup: true,
  });

  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [tituloEvento, setTituloEvento] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("geral");

  useEffect(() => {
    const salvos = localStorage.getItem("eventosCalendario");
    if (salvos) setEventos(JSON.parse(salvos));
  }, []);

  useEffect(() => {
    localStorage.setItem("eventosCalendario", JSON.stringify(eventos));
    filtrarEventos();
  }, [eventos, categoriasAtivas]);

  const filtrarEventos = () => {
    const filtrados = eventos.filter((ev) => categoriasAtivas[ev.categoria]);
    setEventosFiltrados(filtrados);
  };

  const toggleCategoria = (cat) => {
    setCategoriasAtivas(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const aoClicarData = (info) => {
    setDataSelecionada(info.dateStr);
  };

  const adicionarEvento = () => {
    if (!tituloEvento.trim()) return;
    const novo = {
      title: tituloEvento,
      date: dataSelecionada,
      categoria: categoriaSelecionada,
    };
    setEventos([...eventos, novo]);
    setTituloEvento("");
    setCategoriaSelecionada("geral");
    setDataSelecionada(null);
  };

  return (
    <div className="w-full min-h-screen bg-white p-6 overflow-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-900 text-center">📅 Calendário de Atividades</h1>

      {/* Filtros de categoria */}
      <div className="flex flex-wrap gap-4 justify-center mb-4">
        {Object.keys(categoriasAtivas).map((cat) => (
          <label key={cat} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={categoriasAtivas[cat]}
              onChange={() => toggleCategoria(cat)}
            />
            <span className="capitalize">{cat}</span>
          </label>
        ))}
      </div>

      <div className="max-w-6xl mx-auto bg-white p-4 rounded-xl shadow-md">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          events={eventosFiltrados}
          selectable={true}
          dateClick={aoClicarData}
          height="auto"
        />
      </div>

      {/* Modal para adicionar evento */}
      {dataSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">Novo Evento</h2>
            <p className="text-sm text-gray-500 mb-2">
              📆 {new Date(dataSelecionada).toLocaleDateString("pt-BR")}
            </p>
            <input
              type="text"
              placeholder="Título do evento"
              value={tituloEvento}
              onChange={(e) => setTituloEvento(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <select
              value={categoriaSelecionada}
              onChange={(e) => setCategoriaSelecionada(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
            >
              <option value="geral">📌 Geral</option>
              <option value="parto">🍼 Parto</option>
              <option value="vacina">💉 Vacina</option>
              <option value="ia">🧬 IA</option>
              <option value="checkup">📋 Check-up</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDataSelecionada(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarEvento}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
