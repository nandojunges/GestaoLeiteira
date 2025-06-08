// 📁 src/pages/AppTarefas/index.jsx
import React, { useEffect, useState } from 'react';

export default function AppTarefas() {
  const [alertas, setAlertas] = useState([]);

  const parseDate = (d) => {
    if (!d) return null;
    const [dia, mes, ano] = d.split('/');
    return new Date(ano, mes - 1, dia);
  };

  useEffect(() => {
    const atualizar = () => {
      const lista = JSON.parse(localStorage.getItem('alertasCarencia') || '[]');
      const hoje = new Date();
      const ativos = lista.filter((a) => {
        const l = parseDate(a.leiteAte);
        const c = parseDate(a.carneAte);
        return (l && l >= hoje) || (c && c >= hoje);
      });
      localStorage.setItem('alertasCarencia', JSON.stringify(ativos));
      setAlertas(ativos);
    };

    atualizar();
    window.addEventListener('alertasCarenciaAtualizados', atualizar);
    return () => window.removeEventListener('alertasCarenciaAtualizados', atualizar);
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-xl shadow-md p-4 mb-4">
        <h2 className="text-lg font-bold mb-2">⚠️ Alertas de Carência</h2>
        <div className="space-y-2">
          {alertas.length === 0 && (
            <div className="text-gray-500">Nenhum alerta de carência no momento</div>
          )}
          {alertas.map((a, i) => {
            const hoje = new Date();
            return (
              <React.Fragment key={i}>
                {a.leiteAte && parseDate(a.leiteAte) >= hoje && (
                  <div className="bg-yellow-100 text-yellow-800 p-2 rounded">
                    🟡 Vaca {a.numeroAnimal} em carência de leite até {a.leiteAte}
                  </div>
                )}
                {a.carneAte && parseDate(a.carneAte) >= hoje && (
                  <div className="bg-red-100 text-red-800 p-2 rounded">
                    🔴 Vaca {a.numeroAnimal} em carência de carne até {a.carneAte}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <h2 className="text-lg font-bold mb-2">📌 Resumo Diário</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>3 vacas em tratamento</li>
          <li>2 diagnósticos pendentes</li>
          <li>4 tarefas agendadas para hoje</li>
        </ul>
      </div>
    </div>
  );
}
  