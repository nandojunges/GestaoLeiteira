// [quarantine] movido na Fase 1.2 — manter até Fase 2 validar remoção definitiva.
import React, { useEffect, useState } from 'react';
import { buscarPorId } from '../../utils/backendApi';

export default function ResumoLactacoes({ idAnimal }) {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    if (!idAnimal) return;
    buscarPorId('leite/lactacoes', idAnimal)
      .then((lista) => setDados(Array.isArray(lista) ? lista : []));
  }, [idAnimal]);

  if (!dados.length) {
    return (
      <p className="italic text-gray-500">Nenhuma lactação registrada.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm table-fixed border-collapse">
        <thead style={{ backgroundColor: '#f9fafb', color: '#374151' }}>
          <tr>
            <th className="px-4 py-2 border border-[#f1f5f9] text-left">Ciclo</th>
            <th className="px-4 py-2 border border-[#f1f5f9] text-left">Parto</th>
            <th className="px-4 py-2 border border-[#f1f5f9] text-left">Secagem</th>
            <th className="px-4 py-2 border border-[#f1f5f9] text-left">Dias</th>
            <th className="px-4 py-2 border border-[#f1f5f9] text-left">Volume</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((l, i) => (
            <tr key={i} className="hover:bg-gray-50 transition">
              <td className="px-4 py-2 border border-[#f1f5f9]">{i + 1}</td>
              <td className="px-4 py-2 border border-[#f1f5f9]">{l.parto}</td>
              <td className="px-4 py-2 border border-[#f1f5f9]">{l.secagem || '—'}</td>
              <td className="px-4 py-2 border border-[#f1f5f9]">{l.dias}</td>
              <td className="px-4 py-2 border border-[#f1f5f9]">{l.volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
