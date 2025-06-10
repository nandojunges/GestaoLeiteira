import React, { useState } from 'react';
import ModalConfiguracaoPEV from './ModalConfiguracaoPEV';

export default function ConfigurarPEV() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const config = JSON.parse(localStorage.getItem('configPEV') || '{}');

  return (
    <div className="w-full px-8 py-6 font-sans">
      <div className="mb-4 text-right">
        <button onClick={() => setMostrarModal(true)} className="botao-acao">
          ⚙️ Ajustar Configurações
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <p>DEL máximo no PEV: <strong>{config.diasPEV || 60}</strong> dias</p>
        <p>
          Pré-sincronização:{' '}
          <strong>{config.permitirPreSincronizacao ? 'permitida' : 'não permitida'}</strong>
        </p>
        <p>
          Registrar Secagem:{' '}
          <strong>{config.permitirSecagem ? 'sim' : 'não'}</strong>
        </p>
      </div>

      {mostrarModal && (
        <ModalConfiguracaoPEV
          onClose={() => setMostrarModal(false)}
          onAplicar={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
}
