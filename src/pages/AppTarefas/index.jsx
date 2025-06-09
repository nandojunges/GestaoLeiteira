import React from 'react';
import DashboardCards from './DashboardCards';
import DashboardAlertas from './DashboardAlertas';
import DashboardGraficos from './DashboardGraficos';

export default function AppTarefas() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        <DashboardCards />

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-bold mb-2">🔔 Alertas Atuais</h2>
              <DashboardAlertas />
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-bold mb-2">💡 Sugestões Inteligentes</h2>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>3 vacas com DEL &gt; 290 dias ainda em lactação — avaliar secagem</li>
                <li>Nenhuma IA registrada nos últimos 10 dias</li>
                <li>Lote 2 com consumo projetado alto — revisar plano alimentar</li>
              </ul>
            </div>
          </div>

          <div className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-6 flex-shrink-0">
            <DashboardGraficos />
          </div>
        </div>
      </div>
    </div>
  );
}
