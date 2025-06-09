import React, { useEffect, useState } from 'react';
import {
  contagemStatusVacas,
  eventosDeHoje,
  resumoEventosHoje,
} from './utilsDashboard';
import GraficosRepro from './componentes/GraficosRepro';
import InsightsInteligentes from './componentes/InsightsInteligentes';
import ResumoEstoqueCritico from './componentes/ResumoEstoqueCritico';

export default function AppTarefas() {
  const [alertas, setAlertas] = useState([]);
  const [eventosHoje, setEventosHoje] = useState([]);
  const [resumoEventos, setResumoEventos] = useState({
    partos: 0,
    vacinacoes: 0,
    secagens: 0,
  });
  const [resumo, setResumo] = useState({
    lactacao: 0,
    pev: 0,
    negativas: 0,
    preParto: 0,
    carencias: 0,
  });

  useEffect(() => {
    const atualizarAlertas = () => {
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
      setResumo((r) => ({ ...r, carencias: ativos.length }));
    };

    const atualizarResumo = () => {
      const dados = contagemStatusVacas();
      setResumo((r) => ({ ...r, ...dados }));
    };

    const atualizarEventos = () => {
      setEventosHoje(eventosDeHoje());
      setResumoEventos(resumoEventosHoje());
    };

    atualizarAlertas();
    atualizarResumo();
    atualizarEventos();

    window.addEventListener('alertasCarenciaAtualizados', atualizarAlertas);
    window.addEventListener('animaisAtualizados', atualizarResumo);
    const eventos = [
      'animaisAtualizados',
      'manejosSanitariosAtualizados',
      'produtosAtualizados',
      'examesSanitariosAtualizados',
      'eventosExtrasAtualizados',
    ];
    eventos.forEach((e) => window.addEventListener(e, atualizarEventos));
    return () => {
      window.removeEventListener('alertasCarenciaAtualizados', atualizarAlertas);
      window.removeEventListener('animaisAtualizados', atualizarResumo);
      eventos.forEach((e) => window.removeEventListener(e, atualizarEventos));
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

      {/* DUAS COLUNAS: ESQUERDA (principal), DIREITA (lateral) */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-8">
        {/* COLUNA PRINCIPAL (ESQUERDA) */}
        <main className="flex flex-col gap-6">
          {/* ALERTAS ATUAIS – GRANDE E EM DESTAQUE */}
          <Card>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              🔔 Alertas Atuais
            </h2>
            {alertas.length === 0 ? (
              <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                Nenhum alerta de carência no momento
              </div>
            ) : (
              alertas.map((a, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#fef3c7',
                    padding: '1rem',
                    borderRadius: '1rem',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                  }}
                >
                  ⚠️ Vaca {a.numeroAnimal} em carência de leite até {a.leiteAte || '-'} e carne até{' '}
                  {a.carneAte || '-'}
                </div>
              ))
            )}
          </Card>

          {/* DESTAQUES DO DIA */}
          <Card>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              📅 Destaques do Dia
            </h2>
            {eventosHoje.length === 0 ? (
              <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                Nenhum evento para hoje.
              </div>
            ) : (
              <ul style={{ paddingLeft: '1.25rem', listStyleType: 'disc' }}>
                {eventosHoje.slice(0, 5).map((ev, i) => (
                  <li key={i}>{ev.title}</li>
                ))}
              </ul>
            )}
          </Card>

          {/* DIAGNÓSTICOS */}
          <Card>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              🧬 Diagnósticos Reprodutivos
            </h2>
            Ainda não há diagnósticos lançados.
          </Card>

          {/* AÇÕES RÁPIDAS */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button className="botao-acao">➕ Iniciar protocolo</button>
            <button className="botao-acao">🩺 Lançar diagnóstico</button>
            <button className="botao-acao">📦 Ver estoque</button>
            <button className="botao-acao">📊 Ver relatório</button>
          </div>
        </main>

        {/* COLUNA LATERAL (DIREITA) */}
        <aside className="flex flex-col gap-6">
          <Card>
            <GraficosRepro />
          </Card>
          <Card>
            <ResumoEstoqueCritico />
          </Card>
          <Card>
            <InsightsInteligentes />
          </Card>
        </aside>
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

function Card({ children, className }) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: '#fff',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
        padding: '2rem',
        transition: 'transform 0.2s ease-in-out',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {children}
    </div>
  );
}
