import { useState } from 'react';

export default function TabelaMovimentos({ movs = [] }) {
  const listaSegura = Array.isArray(movs) ? movs : [];

  const formatar = (valor) => `R$ ${valor.toFixed(2)}`;

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-[800px] mx-auto">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Livro Caixa</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Data</th>
              <th className="p-2">Descrição</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Categoria</th>
              <th className="p-2">Origem</th>
              <th className="p-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {listaSegura.map((m) => (
              <tr key={m.id} className="border-b odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <td className="p-2 whitespace-nowrap">{m.data}</td>
                <td className="p-2">{m.descricao}</td>
                <td className="p-2 whitespace-nowrap text-center">
                  {m.tipo === 'Entrada' ? (
                    <span className="text-green-600">➕ Entrada</span>
                  ) : (
                    <span className="text-red-500">➖ Saída</span>
                  )}
                </td>
                <td className="p-2 whitespace-nowrap">{m.categoria}</td>
                <td className="p-2 whitespace-nowrap">{m.origem || '—'}</td>
                <td className="p-2 whitespace-nowrap text-right">
                  {m.tipo === 'Entrada' ? (
                    <span className="text-green-600 font-medium">{formatar(m.valor)}</span>
                  ) : (
                    <span className="text-red-500 font-medium">{formatar(m.valor)}</span>
                  )}
                </td>
              </tr>
            ))}
            {!listaSegura.length && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">Sem dados para exibir</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
