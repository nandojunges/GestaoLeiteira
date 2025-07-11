import React, { useEffect, useState } from 'react';
import { getAlertasCriticos } from './utilsDashboard';

export default function DashboardAlertas() {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const atualizar = async () => setAlertas(await getAlertasCriticos());
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

  const definirEstilo = (msg) => {
    const critico = /carência|pev|negativo/i.test(msg);
    return critico
      ? { cor: 'bg-red-500 text-white', icone: '\u{1F534}' }
      : { cor: 'bg-yellow-400 text-black', icone: '\u{1F7E0}' };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {alertas.map((a, i) => {
        const estilo = definirEstilo(a.mensagem);
        return (
          <div
            key={i}
            className={`flex items-center gap-2 p-3 rounded-xl shadow ${estilo.cor}`}
          >
            <span className="text-xl">{estilo.icone}</span>
            <span className="text-sm md:text-base">{a.mensagem}</span>
          </div>
        );
      })}
    </div>
  );
}
