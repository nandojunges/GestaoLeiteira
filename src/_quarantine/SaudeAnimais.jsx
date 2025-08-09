// [quarantine] movido na Fase 1.2 — manter até Fase 2 validar remoção definitiva.
import React from 'react';

export default function SaudeAnimais() {
  const cards = [
    { titulo: 'Cobertura Vacinal', valor: '92%' },
    { titulo: 'Próxima Vacinação', valor: '15/07/2024' },
    { titulo: 'Casos de Doença', valor: 2 },
    { titulo: 'Eventos Pendentes', valor: 1 },
  ];

  const animais = [
    {
      nome: 'A123',
      grupo: 'Lote 1',
      ultimaOcorrencia: '05/06/2024',
      ultimoTratamento: '10/06/2024',
      status: 'Saudável',
    },
    {
      nome: 'B456',
      grupo: 'Lote 2',
      ultimaOcorrencia: '08/06/2024',
      ultimoTratamento: '11/06/2024',
      status: 'Tratamento ativo',
    },
    {
      nome: 'C789',
      grupo: 'Lote 1',
      ultimaOcorrencia: '-',
      ultimoTratamento: '-',
      status: 'Observação',
    },
  ];

  const statusClasses = {
    'Saudável': 'bg-green-100 text-green-800',
    'Tratamento ativo': 'bg-yellow-100 text-yellow-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
        <span role="img" aria-label="Saúde">📋</span>
        Saúde dos Animais
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.titulo} className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700">{card.titulo}</h3>
            <p className="mt-1 text-2xl font-bold text-gray-900">{card.valor}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Número ou Nome</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grupo</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Última Ocorrência</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Último Tratamento</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {animais.map((animal, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2 whitespace-nowrap">{animal.nome}</td>
                <td className="px-4 py-2">{animal.grupo}</td>
                <td className="px-4 py-2">{animal.ultimaOcorrencia}</td>
                <td className="px-4 py-2">{animal.ultimoTratamento}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[animal.status] || statusClasses.default}`}>
                    {animal.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

