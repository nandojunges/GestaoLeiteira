// 📁 src/pages/AppTarefas/index.jsx
import React, { useEffect, useState } from 'react';

export default function AppTarefas() {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const atualizar = () => {
      const lista = JSON.parse(localStorage.getItem('alertasCarencia') || '[]');
      const hoje = new Date();
      const parse = (d) => {
        if (!d) return null;
        const [dia, mes, ano] = d.split('/');
        return new Date(ano, mes - 1, dia);
      };
      const ativos = lista.filter((a) => {
        const l = parse(a.leiteAte);
        const c = parse(a.carneAte);
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
    <div className="p-4 flex flex-col gap-2">
      {alertas.length === 0 && (
        <div className="text-center text-gray-600 text-xl font-semibold mt-10">
          📄 Página AppTarefas ainda em construção
        </div>
      )}
      {alertas.map((a, i) => {
        const parse = (d) => {
          const [dia, mes, ano] = d.split('/');
          return new Date(ano, mes - 1, dia);
        };
        const hoje = new Date();
        return (
          <React.Fragment key={i}>
            {a.leiteAte && parse(a.leiteAte) >= hoje && (
              <div className="bg-yellow-100 text-yellow-800 p-2 rounded">
                ⚠️ Vaca {a.numeroAnimal} em carência de leite (até {a.leiteAte})
              </div>
            )}
            {a.carneAte && parse(a.carneAte) >= hoje && (
              <div className="bg-yellow-100 text-yellow-800 p-2 rounded">
                ⚠️ Vaca {a.numeroAnimal} em carência de carne (até {a.carneAte})
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
  