import React, { useEffect, useState } from 'react';
import { contagemStatusVacas } from '../utilsDashboard';

export default function InsightsInteligentes() {
  const [frases, setFrases] = useState([]);

  useEffect(() => {
    const gerar = async () => {
      const dados = await contagemStatusVacas();
      const ins = [];
      if (dados.pev > 0) ins.push(`Você tem ${dados.pev} vacas em PEV.`);
      if (dados.negativas > 0) ins.push(`Há ${dados.negativas} diagnósticos negativos.`);
      if (dados.preParto > 0) ins.push(`${dados.preParto} vacas próximas do parto.`);
      if (dados.lactacao > 0) ins.push(`${dados.lactacao} vacas em lactação.`);
      setFrases(ins);
    };

    gerar();
    window.addEventListener('animaisAtualizados', gerar);
    return () => window.removeEventListener('animaisAtualizados', gerar);
  }, []);

  if (frases.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-bold mb-2">💡 Insights</h3>
      <ul className="list-disc pl-5 space-y-1">
        {frases.map((f, i) => (
          <li key={i} className="text-sm text-gray-700">
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
