import React, { useEffect, useState } from 'react';
import { getAlertasCriticos } from './utilsDashboard';

export default function DashboardAlertas() {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const atualizar = () => setAlertas(getAlertasCriticos());
    atualizar();
    window.addEventListener('animaisAtualizados', atualizar);
    window.addEventListener('produtosAtualizados', atualizar);
    window.addEventListener('alertasCarenciaAtualizados', atualizar);
    window.addEventListener('eventosExtrasAtualizados', atualizar);
    return () => {
      window.removeEventListener('animaisAtualizados', atualizar);
      window.removeEventListener('produtosAtualizados', atualizar);
      window.removeEventListener('alertasCarenciaAtualizados', atualizar);
      window.removeEventListener('eventosExtrasAtualizados', atualizar);
    };
  }, []);

  if (alertas.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow space-y-1">
      {alertas.map((a, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-red-800">
          <span>❗</span>
          <span>{a.mensagem}</span>
        </div>
      ))}
    </div>
  );
}
