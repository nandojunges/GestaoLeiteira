import React from 'react';

export default function ResumoRapido({ movs = [] }) {
  const listaSegura = Array.isArray(movs) ? movs : [];
  const totalReceitas = listaSegura.filter(m => m.tipo === 'Entrada').reduce((s, m) => s + m.valor, 0);
  const totalDespesas = listaSegura.filter(m => m.tipo === 'Saída').reduce((s, m) => s + m.valor, 0);
  const saldo = totalReceitas - totalDespesas;
  const formatar = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-green-100 text-green-700 rounded-lg p-3 text-center">
        <div className="text-sm">💵 Total Receitas</div>
        <div className="text-lg font-bold">{formatar(totalReceitas)}</div>
      </div>
      <div className="bg-red-100 text-red-700 rounded-lg p-3 text-center">
        <div className="text-sm">💸 Total Despesas</div>
        <div className="text-lg font-bold">{formatar(totalDespesas)}</div>
      </div>
      <div className="bg-blue-100 text-blue-700 rounded-lg p-3 text-center">
        <div className="text-sm">📊 Saldo</div>
        <div className="text-lg font-bold">{formatar(saldo)}</div>
      </div>
    </div>
  );
}
