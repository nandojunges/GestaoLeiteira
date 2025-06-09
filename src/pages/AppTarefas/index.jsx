import React, { useEffect, useState } from 'react';
import DashboardGraficos from './DashboardGraficos';
import {
  contagemStatusVacas,
  eventosDeHoje,
  resumoEventosHoje,
  produtosVencendo,
  parseDate,
} from './utilsDashboard';

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
  const [sugestoes, setSugestoes] = useState([]);

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

  useEffect(() => {
    const gerar = () => {
      const sugs = [];
      const vencendo = produtosVencendo();
      if (vencendo.length > 0) {
        const p = vencendo[0];
        const dias = Math.ceil((parseDate(p.validade) - new Date()) / (1000 * 60 * 60 * 24));
        sugs.push({ icone: '✍️', texto: `Repor ${p.nomeComercial}: estoque baixo, previsão de esgotar em ${dias} dias.` });
      }
      if (resumo.pev > 0) {
        sugs.push({ icone: '⚕️', texto: `Iniciar protocolo de pré-sincronização em ${resumo.pev} vacas nos próximos 5 dias.` });
      }
      setSugestoes(sugs.slice(0, 3));
    };
    gerar();
  }, [resumo, alertas]);

  return (
    <div className="p-8 space-y-8 font-poppins">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <BlocoResumo titulo="Vacas em Lactação" valor={resumo.lactacao} icone="🐄" cor="text-green-600" aba="animais" />
        <BlocoResumo titulo="Vacas em PEV" valor={resumo.pev} icone="🧪" cor="text-orange-500" aba="reproducao" />
        <BlocoResumo titulo="Diagnóstico negativo" valor={resumo.negativas} icone="❌" cor="text-red-600" aba="reproducao" />
        <BlocoResumo titulo="Pré-parto" valor={resumo.preParto} icone="🤰" cor="text-blue-600" aba="reproducao" />
        <BlocoResumo titulo="Carência leite/carne" valor={resumo.carencias} icone="⚠️" cor="text-yellow-600" aba="reproducao" />
      </div>

      <AlertasCard alertas={alertas} />

      <DashboardGraficos />

      <Sugestoes itens={sugestoes} />

      <div className="flex flex-wrap justify-center gap-3">
        <button className="botao-acao">➕ Iniciar protocolo</button>
        <button className="botao-acao">🩺 Lançar diagnóstico</button>
        <button className="botao-acao">📦 Ver estoque</button>
        <button className="botao-acao">📊 Ver relatório</button>
      </div>
    </div>
  );
}

function BlocoResumo({ titulo, valor, icone, cor, aba }) {
  return (
    <button
      onClick={() =>
        window.dispatchEvent(new CustomEvent('navegarParaAba', { detail: aba }))
      }
      className="bg-white rounded-xl shadow p-4 text-left transition hover:shadow-lg hover:scale-105"
    >
      <div className={`text-sm font-semibold ${cor}`}>{icone} {titulo}</div>
      <div className="text-2xl font-bold">{valor}</div>
    </button>
  );
}

function Card({ children, className }) {
  return (
    <div
      className={`bg-white rounded-xl shadow p-6 transition hover:scale-105 ${className || ''}`}
    >
      {children}
    </div>
  );
}

function AlertasCard({ alertas }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="bg-yellow-100 rounded-xl shadow p-4 space-y-2">
      <h2 className="font-bold">🔔 Alertas Atuais</h2>
      {alertas.length === 0 && (
        <div className="italic text-gray-600">Nenhum alerta de carência no momento</div>
      )}
      {alertas.length > 0 && (
        <>
          {aberto ? (
            <ul className="list-disc pl-5 space-y-1">
              {alertas.map((a, i) => (
                <li key={i}>⚠️ Vaca {a.numeroAnimal} em carência de leite até {a.leiteAte || '-'} e carne até {a.carneAte || '-'}</li>
              ))}
            </ul>
          ) : (
            <div>
              ⚠️ Vaca {alertas[0].numeroAnimal} em carência de leite até {alertas[0].leiteAte || '-'} e carne até {alertas[0].carneAte || '-'}
            </div>
          )}
          <button className="botao-acao" onClick={() => setAberto(!aberto)}>
            {aberto ? 'Fechar' : 'Ver detalhes'}
          </button>
        </>
      )}
    </div>
  );
}

function Sugestoes({ itens }) {
  if (!itens || itens.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {itens.map((s, i) => (
        <div key={i} className="bg-white rounded-xl shadow p-4 flex items-start gap-2">
          <span className="text-xl">{s.icone}</span>
          <span>{s.texto}</span>
        </div>
      ))}
    </div>
  );
}

