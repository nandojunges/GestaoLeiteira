import React, { useEffect, useState } from 'react';
import { eventosDoMes } from './utilsDashboard';

export default function DashboardEventos() {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const atualizar = () => setEventos(eventosDoMes());
    atualizar();
    window.addEventListener('animaisAtualizados', atualizar);
    window.addEventListener('produtosAtualizados', atualizar);
    window.addEventListener('eventosExtrasAtualizados', atualizar);
    return () => {
      window.removeEventListener('animaisAtualizados', atualizar);
      window.removeEventListener('produtosAtualizados', atualizar);
      window.removeEventListener('eventosExtrasAtualizados', atualizar);
    };
  }, []);

  if (eventos.length === 0) {
    return <p className="text-sm text-gray-500">Sem dados disponíveis</p>;
  }

  return (
    <ul className="text-sm space-y-1">
      {eventos.slice(0, 5).map((ev, i) => (
        <li key={i}>
          📅 {ev.title} ({new Date(ev.date).toLocaleDateString('pt-BR')})
        </li>
      ))}
    </ul>
  );
}
