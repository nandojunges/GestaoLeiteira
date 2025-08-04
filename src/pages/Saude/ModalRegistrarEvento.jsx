import React from 'react';

export default function ModalRegistrarEvento({ aberto, onClose }) {
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Registrar Evento de Saúde</h2>
        <p className="text-sm text-gray-600 mb-4">
          Estrutura do modal pronta para receber formulário de ocorrências e tratamentos.
        </p>
        <button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
