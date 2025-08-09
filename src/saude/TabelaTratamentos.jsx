import React from 'react';

export default function TabelaTratamentos({ lista = [], onEditar, onExcluir }) {
  const titulos = [
    'Data',
    'Animal',
    'Medicação',
    'Duração',
    'Carência',
    'Aplicador',
    'Observações',
    'Ações',
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-blue-900">
        <thead className="bg-blue-100">
          <tr>
            {titulos.map((t) => (
              <th key={t} className="px-3 py-2 text-left whitespace-nowrap">
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lista.length === 0 ? (
            <tr>
              <td colSpan={titulos.length} className="text-center py-4">
                Nenhum tratamento registrado.
              </td>
            </tr>
          ) : (
            lista.map((t, idx) => (
              <tr
                key={idx}
                className="border-b last:border-b-0 bg-white hover:bg-blue-50"
              >
                <td className="px-3 py-2 whitespace-nowrap">{t.data}</td>
                <td className="px-3 py-2 whitespace-nowrap">{t.animal}</td>
                <td className="px-3 py-2 whitespace-nowrap">{t.medicacao}</td>
                <td className="px-3 py-2 whitespace-nowrap">{t.duracao}</td>
                <td className="px-3 py-2 whitespace-nowrap">{t.carencia}</td>
                <td className="px-3 py-2 whitespace-nowrap">{t.aplicador}</td>
                <td className="px-3 py-2">{t.observacoes}</td>
                <td className="px-3 py-2 whitespace-nowrap flex gap-2">
                  {onEditar && (
                    <button
                      className="bg-blue-500 text-white rounded px-2"
                      onClick={() => onEditar(t, idx)}
                    >
                      Editar
                    </button>
                  )}
                  {onExcluir && (
                    <button
                      className="bg-red-500 text-white rounded px-2"
                      onClick={() => onExcluir(idx)}
                    >
                      Excluir
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
