import React from 'react';

export default function DiagnosticoCio() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Diagnóstico e CIO</h2>
      <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4">Registrar Diagnóstico/CIO</button>
      <table className="table-auto w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2">Número</th>
            <th className="px-2">Data</th>
            <th className="px-2">Evento</th>
            <th className="px-2">Resultado</th>
            <th className="px-2">Observação</th>
          </tr>
        </thead>
        <tbody>
          {/* Diagnósticos e CIOs lançados aparecem aqui */}
        </tbody>
      </table>
    </div>
  );
}
