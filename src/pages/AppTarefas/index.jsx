import React, { useEffect, useState } from 'react';

export default function AppTarefas() {
  const [alertas, setAlertas] = useState([]);
  const [resumo, setResumo] = useState({
    lactacao: 4,
    pev: 2,
    negativos: 0,
    preparto: 0,
    carencias: 2,
  });

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
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {/* RESUMO */}
      <ResumoCard titulo="🐄 Vacas em lactação" valor={resumo.lactacao} cor="green" />
      <ResumoCard titulo="🧪 Vacas em PEV" valor={resumo.pev} cor="orange" />
      <ResumoCard titulo="❌ Diagnóstico negativo" valor={resumo.negativos} cor="red" />
      <ResumoCard titulo="🤰 Vacas em pré-parto" valor={resumo.preparto} cor="blue" />
      <ResumoCard titulo="⚠️ Carência leite/carne" valor={resumo.carencias} cor="yellow" />

      {/* ALERTAS ATUAIS */}
      <div className="col-span-full">
        <h2 className="text-xl font-bold mt-6 mb-2">🔔 Alertas Atuais</h2>
        {alertas.length === 0 && (
          <div className="text-gray-500 italic">Nenhum alerta de carência no momento</div>
        )}
        {alertas.map((a, i) => (
          <div
            key={i}
            className="bg-yellow-100 text-yellow-800 p-3 rounded-xl shadow flex items-center gap-2 mb-2"
          >
            ⚠️ Vaca {a.numeroAnimal} em carência de leite até {a.leiteAte || '-'} e carne até {a.carneAte || '-'}
          </div>
        ))}
      </div>

      {/* DIAGNÓSTICOS */}
      <div className="col-span-full mt-6">
        <h2 className="text-xl font-bold mb-2">🧬 Diagnósticos Reprodutivos</h2>
        <div className="bg-white rounded-xl shadow p-4 text-gray-700">
          {/* Conteúdo futuro aqui */}
          Ainda não há diagnósticos lançados.
        </div>
      </div>
    </div>
  );
}

function ResumoCard({ titulo, valor, cor = 'gray' }) {
  const corTexto = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    orange: 'text-orange-600',
    gray: 'text-gray-600',
  }[cor];

  const corFundo = {
    green: 'bg-green-50',
    red: 'bg-red-50',
    blue: 'bg-blue-50',
    yellow: 'bg-yellow-50',
    orange: 'bg-orange-50',
    gray: 'bg-gray-100',
  }[cor];

  return (
    <div
      className={`${corFundo} ${corTexto} rounded-2xl shadow-md p-4 hover:scale-105 transition-transform duration-200`}
    >
      <div className="text-sm mb-1">{titulo}</div>
      <div className="text-3xl font-bold">{valor}</div>
    </div>
  );
}
