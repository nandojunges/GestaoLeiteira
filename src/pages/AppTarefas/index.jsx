import React, { useEffect, useState } from 'react';
import { contagemStatusVacas } from './utilsDashboard';
import TarefasDiarias from './componentes/TarefasDiarias';
import GraficosRepro from './componentes/GraficosRepro';
import InsightsInteligentes from './componentes/InsightsInteligentes';
import ResumoEstoqueCritico from './componentes/ResumoEstoqueCritico';
import CardLateral from './componentes/CardLateral';

export default function AppTarefas() {
  const [resumo, setResumo] = useState({
    lactacao: 0,
    pev: 0,
    negativas: 0,
    preParto: 0,
    carencias: 0,
  });

  useEffect(() => {
    const parse = (d) => {
      if (!d) return null;
      const [dia, mes, ano] = d.split('/');
      return new Date(ano, mes - 1, dia);
    };

    const atualizarCarencias = () => {
      const lista = JSON.parse(localStorage.getItem('alertasCarencia') || '[]');
      const hoje = new Date();
      const ativos = lista.filter((a) => {
        const l = parse(a.leiteAte);
        const c = parse(a.carneAte);
        return (l && l >= hoje) || (c && c >= hoje);
      });
      setResumo((r) => ({ ...r, carencias: ativos.length }));
    };

    const atualizarResumo = () => {
      const dados = contagemStatusVacas();
      setResumo((r) => ({ ...r, ...dados }));
    };

    atualizarCarencias();
    atualizarResumo();

    window.addEventListener('alertasCarenciaAtualizados', atualizarCarencias);
    window.addEventListener('animaisAtualizados', atualizarResumo);

    return () => {
      window.removeEventListener('alertasCarenciaAtualizados', atualizarCarencias);
      window.removeEventListener('animaisAtualizados', atualizarResumo);
    };
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Poppins, sans-serif' }}>
      {/* RESUMO NO TOPO */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <BlocoResumo titulo="Vacas em Lactação" valor={resumo.lactacao} icone="🐄" cor="#16a34a" />
        <BlocoResumo titulo="Vacas em PEV" valor={resumo.pev} icone="🧪" cor="#f97316" />
        <BlocoResumo titulo="Negativos" valor={resumo.negativas} icone="❌" cor="#dc2626" />
        <BlocoResumo titulo="Pré-parto" valor={resumo.preParto} icone="🤰" cor="#2563eb" />
        <BlocoResumo titulo="Carência leite/carne" valor={resumo.carencias} icone="⚠️" cor="#eab308" />
      </div>

      {/* CONTEÚDO PRINCIPAL COM COLUNA LATERAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <TarefasDiarias />

        <div className="grid grid-cols-1 gap-4">
          <CardLateral>
            <ResumoEstoqueCritico />
          </CardLateral>

          <CardLateral>
            <GraficosRepro />
          </CardLateral>

          <CardLateral>
            <InsightsInteligentes />
          </CardLateral>
        </div>
      </div>
    </div>
  );
}

function BlocoResumo({ titulo, valor, icone, cor }) {
  return (
    <div
      className="fade-in"
      style={{
        backgroundColor: '#fff',
        borderRadius: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '1.25rem',
        flex: 1,
        minWidth: '200px',
        transition: 'transform 0.2s ease-in-out',
        cursor: 'default',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div
        style={{
          fontSize: '1.25rem',
          color: cor || '#111827',
          fontWeight: 700,
        }}
      >
        {icone} {titulo}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800 }}>{valor}</div>
    </div>
  );
}

