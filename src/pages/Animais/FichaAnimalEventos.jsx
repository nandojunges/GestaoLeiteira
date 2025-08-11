import React, { useEffect, useState } from 'react';
import { listarHistoricoReproducao, listarHistoricoSaude } from '../../api';

export default function FichaAnimalEventos({ animalId }) {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    async function carregar() {
      try {
        const [rep, sau] = await Promise.all([
          listarHistoricoReproducao(animalId),
          listarHistoricoSaude(animalId),
        ]);
        const normalizar = (arr, tipoPadrao) =>
          (arr || []).map((e) => ({
            data: e.data,
            tipo: e.tipo || tipoPadrao,
            obs: e.obs || e.observacao || '',
          }));
        const todos = [
          ...normalizar(rep, 'Reprodução'),
          ...normalizar(sau, 'Saúde'),
        ].sort((a, b) => new Date(a.data) - new Date(b.data));
        setEventos(todos);
      } catch (err) {
        console.error('Erro ao carregar histórico', err);
        setEventos([]);
      }
    }
    if (animalId) carregar();
  }, [animalId]);

  if (!eventos.length) {
    return (
      <p style={{ fontStyle: 'italic', color: '#777' }}>
        Sem eventos registrados.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {eventos.map((ev, idx) => (
        <div key={idx} className="border-b pb-1">
          <strong>
            {ev.data} — {ev.tipo}
          </strong>
          {ev.obs && <p className="text-sm">{ev.obs}</p>}
        </div>
      ))}
    </div>
  );
}
