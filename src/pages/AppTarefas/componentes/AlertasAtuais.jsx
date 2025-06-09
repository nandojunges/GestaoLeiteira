import React, { useEffect, useState } from 'react';

export default function AlertasAtuais() {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const parseData = (d) => {
      if (!d) return null;
      const [dia, mes, ano] = d.split('/');
      return new Date(ano, mes - 1, dia);
    };

    const atualizar = () => {
      const lista = JSON.parse(localStorage.getItem('alertasCarencia') || '[]');
      const hoje = new Date();
      const ativos = lista.filter((a) => {
        const l = parseData(a.leiteAte);
        const c = parseData(a.carneAte);
        return (l && l >= hoje) || (c && c >= hoje);
      });
      setAlertas(ativos);
    };

    atualizar();
    window.addEventListener('alertasCarenciaAtualizados', atualizar);
    return () => window.removeEventListener('alertasCarenciaAtualizados', atualizar);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-bold mb-2">🔔 Alertas de Carência</h3>
      {alertas.length === 0 ? (
        <p className="text-gray-500 italic">Nenhum alerta de carência no momento.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {alertas.map((a, i) => (
            <div
              key={i}
              className="bg-yellow-100 rounded-lg p-2 text-sm flex items-center gap-2 shadow"
            >
              <span>⚠️</span>
              <span>
                Vaca {a.numeroAnimal} leite até {a.leiteAte || '-'} / carne até {a.carneAte || '-'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
