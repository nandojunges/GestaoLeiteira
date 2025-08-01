import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { buscarVacas } from '../../utils/apiFuncoes.js';
import { buscarAnimaisComCache } from "../../utils/cacheAnimais";
import { buscarTodos } from '../../utils/backendApi';
import { calcularDEL } from '../Animais/utilsAnimais';
import ModalHistoricoCompleto from "../Animais/ModalHistoricoCompleto";
import ModalConfiguracaoPEV from "./ModalConfiguracaoPEV";
import { getStatusVaca, filtrarAnimaisAtivos, filtrarPorStatus } from './utilsReproducao';
import ModalRegistrarOcorrencia from './ModalRegistrarOcorrencia';
import '../../styles/tabelaModerna.css';
import '../../styles/botoes.css';
import { carregarRegistro, calcularEtapasOcorrencia } from '../../utils/registroReproducao';
import OverflowInfo from '../../components/OverflowInfo';

export default function VisaoGeralReproducao() {
  const [vacas, setVacas] = useState([]);
  const [carregandoVacas, setCarregandoVacas] = useState(true);
  const [animalFicha, setAnimalFicha] = useState(null);
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [vacaOcorrencia, setVacaOcorrencia] = useState(null);
  const [colunaHover, setColunaHover] = useState(null);
  const [mostrarModalPEV, setMostrarModalPEV] = useState(false);
  const [configPEV, setConfigPEV] = useState({
    diasPEV: 60,
    permitirPreSincronizacao: false,
    permitirSecagem: true
  });
  const [carregandoConfig, setCarregandoConfig] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroDelMin, setFiltroDelMin] = useState('');
  const [filtroDelMax, setFiltroDelMax] = useState('');
  const [selecionados, setSelecionados] = useState([]);

  const carregarVacas = useCallback(async () => {
    setCarregandoVacas(true);
    try {
      const dados = await buscarAnimaisComCache();
      const animais = dados.filter((a) => a.status !== 'Inativo');
      const ativos = await filtrarAnimaisAtivos(animais);

      const ativosComDados = await Promise.all(
      ativos.map(async (a) => {
        const registro = await carregarRegistro(a.numero);
        const ocorr = registro.ocorrencias || [];

        if (a.protocoloAtivo) {
          const etapas = a.protocoloAtivo.etapasProgramadas || [];
          const ultima = [...etapas].reverse().find((e) => e.status === 'concluida');
          const proxima = etapas.find((e) => e.status === 'pendente');
          if (ultima) {
            a.ultimaAcao = {
              tipo: `${ultima.acao}${ultima.subtipo ? ' ' + ultima.subtipo : ''}`,
              data: ultima.data.split('-').reverse().join('/'),
            };
          }
          if (proxima) {
            a.proximaAcao = {
              tipo: `${proxima.acao}${proxima.subtipo ? ' ' + proxima.subtipo : ''}`,
              dataPrevista: proxima.data.split('-').reverse().join('/'),
            };
          }
        }

        if (!a.ultimaAcao && ocorr.length) {
          const ultimo = ocorr[ocorr.length - 1];
          a.ultimaAcao = { tipo: ultimo.tipo, data: ultimo.data };
        }

        if (!a.proximaAcao) {
          const protocolo = [...ocorr].reverse().find((o) => Array.isArray(o.etapas));
          if (protocolo) {
            const { ultima, proxima } = calcularEtapasOcorrencia(protocolo);
            if (!a.ultimaAcao) a.ultimaAcao = ultima;
            a.proximaAcao = proxima;
          }
        }

        return a;
      })
    );

      const unicos = ativosComDados.filter(
        (v, i, arr) => arr.findIndex((o) => o.numero === v.numero) === i
      );
      setVacas(unicos);
    } catch (err) {
      console.error('Erro ao carregar vacas:', err);
      setVacas([]);
    } finally {
      setCarregandoVacas(false);
    }
  }, []);

  const carregarConfig = useCallback(async () => {
    setCarregandoConfig(true);
    const listaCfg = await buscarTodos('configPEV');
    const config = listaCfg[0] || {};
    setConfigPEV({
      diasPEV: config.diasPEV || 60,
      permitirPreSincronizacao: config.permitirPreSincronizacao || false,
      permitirSecagem: config.permitirSecagem || true,
    });
    setCarregandoConfig(false);
  }, []);

  useEffect(() => {
    carregarVacas();
    carregarConfig();
  }, [carregarVacas, carregarConfig]);

  useEffect(() => {
    const eventos = [
      'registroReprodutivoAtualizado',
      'tarefasAtualizadas',
      'protocolosAtivosAtualizados',
    ];
    eventos.forEach((ev) => window.addEventListener(ev, carregarVacas));
    return () => eventos.forEach((ev) => window.removeEventListener(ev, carregarVacas));
  }, [carregarVacas]);

  const abrirFicha = (vaca) => {
    setAnimalFicha(vaca);
    setMostrarFicha(true);
  };

  const aplicarConfiguracoesPEV = async (config) => {
    setConfigPEV(config);
    await adicionarItem("configPEV", { id: "cfg", ...config });
    setMostrarModalPEV(false);
  };

  const titulos = [
    "",
    "Número",
    "Brinco",
    "DEL",
    "Status Atual",
    "Última Ação",
    "Próxima Ação",
    "Data Prevista",
    "Ações",
    "Ficha",
  ];

  const colClasses = [
    'checkbox',
    'numero',
    'brinco',
    'del',
    '',
    '',
    '',
    '',
    'acoes',
    'ficha'
  ];

  const obterStatus = (vaca, del) => {
    const statusBase = (vaca.statusReprodutivo || '').toLowerCase();
    if (statusBase === 'prenhe') return '✅ Prenhe confirmada';
    if (statusBase === 'seca') return '🔴 Seca';
    const statusPEV = getStatusVaca(del);
    return statusPEV === 'Liberada' ? '🟢 Liberada' : '🔵 Pós-parto (PEV)';
  };

  const obterUltimaAcao = (vaca) => {
    const etapas = vaca.protocoloAtivo?.etapasProgramadas || [];
    const ultima = [...etapas].reverse().find((e) => e.status === 'concluida');
    if (ultima)
      return `${ultima.acao}${ultima.subtipo ? ' ' + ultima.subtipo : ''}`;
    return vaca.ultimaAcao?.tipo || '—';
  };

  const obterProximaAcao = (vaca) => {
    const etapas = vaca.protocoloAtivo?.etapasProgramadas || [];
    const proxima = etapas.find((e) => e.status === 'pendente');
    if (proxima)
      return `${proxima.acao}${proxima.subtipo ? ' ' + proxima.subtipo : ''}`;
    return vaca.proximaAcao?.tipo || '—';
  };

  const obterDataProximaAcao = (vaca) => {
    const etapas = vaca.protocoloAtivo?.etapasProgramadas || [];
    const proxima = etapas.find((e) => e.status === "pendente");
    if (proxima && proxima.data)
      return proxima.data.split("-").reverse().join("/");
    return vaca.proximaAcao?.dataPrevista || "—";
  };

  const obterDetalhesAcao = (vaca, tipo) => {
    const protocolo = vaca.protocoloAtivo;
    if (!protocolo) return null;
    const etapas = protocolo.etapasProgramadas || [];
    const alvo = tipo === "proxima" ? etapas.find((e) => e.status === "pendente") : [...etapas].reverse().find((e) => e.status === "concluida");
    if (!alvo) return null;
    const inicioIso = protocolo.inicio.includes("/") ? protocolo.inicio.split("/").reverse().join("-") : protocolo.inicio;
    const dia = Math.floor((new Date(alvo.data) - new Date(inicioIso)) / (1000 * 60 * 60 * 24));
    const acoesDia = etapas.filter((e) => e.data === alvo.data && e.status === alvo.status).map((et) => `${et.acao}${et.subtipo ? " — " + et.subtipo : ""}`);
    return { dia, data: alvo.data.split("-").reverse().join("/"), acoes: acoesDia };
  };

  const formatarDetalhes = (det) => {
    if (!det) return null;
    return (
      <div>
        <div style={{ fontWeight: "bold", marginBottom: 4 }}>{`Dia ${det.dia}${det.data ? " - " + det.data : ""}`}</div>
        <ul style={{ paddingLeft: "1rem", listStyleType: "disc" }}>
          {det.acoes.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderizarMenuAcoes = (vaca, del) => {
    const statusPEV = getStatusVaca(del);
    return (
      <button
        onClick={() => setVacaOcorrencia({ ...vaca, statusPEV })}
        className="botao-editar"
      >
        Registrar 📋
      </button>
    );
  };


  const alternarSelecionado = (num) => {
    setSelecionados((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const vacasFiltradas = useMemo(
    () => filtrarPorStatus(vacas, filtroStatus, filtroDelMin, filtroDelMax),
    [vacas, filtroStatus, filtroDelMin, filtroDelMax]
  );

  const todasSelecionadas = selecionados.length === vacasFiltradas.length && vacasFiltradas.length > 0;

  const selecionarTodas = (v) => {
    if (v.target.checked) setSelecionados(vacasFiltradas.map((v) => v.numero));
    else setSelecionados([]);
  };

  const aplicarAcaoLote = (acao) => {
    if (!acao) return;
    alert(`Aplicar "${acao}" para: ${selecionados.join(', ')}`);
  };

  if (carregandoVacas || carregandoConfig) {
    return <div className="w-full text-center py-8">Carregando...</div>;
  }

  if (vacas.length === 0) {
    return <div className="w-full text-center py-8">Nenhum dado encontrado</div>;
  }

  return (
    <div className="w-full px-8 py-6 font-sans">
      <div className="flex flex-wrap gap-2 items-end mb-4">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="todos">Todos Status</option>
          <option value="pev">Pós-parto</option>
          <option value="liberada">Liberada</option>
        </select>
        <input
          type="number"
          placeholder="DEL mínimo"
          value={filtroDelMin}
          onChange={(e) => setFiltroDelMin(e.target.value)}
          className="border p-2 rounded w-24"
        />
        <input
          type="number"
          placeholder="DEL máximo"
          value={filtroDelMax}
          onChange={(e) => setFiltroDelMax(e.target.value)}
          className="border p-2 rounded w-24"
        />
        <div className="ml-auto">
          <button onClick={() => setMostrarModalPEV(true)} className="botao-acao">
            ⚙️ Configurar PEV
          </button>
        </div>
      </div>

      <table className="tabela-padrao tabela-reproducao">
        <thead>
          <tr>
            {titulos.map((titulo, index) => (
              <th
                key={index}
                onMouseEnter={() => setColunaHover(index)}
                onMouseLeave={() => setColunaHover(null)}
                className={`${colunaHover === index ? 'coluna-hover' : ''} ${index === 8 ? 'coluna-acoes' : ''} ${colClasses[index]}`}
              >
                {index === 0 ? (
                  <input
                    type="checkbox"
                    className="checkbox-tabela"
                    checked={todasSelecionadas}
                    onChange={selecionarTodas}
                  />
                ) : (
                  titulo
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vacasFiltradas.map((vaca) => {
            const del = vaca.ultimoParto ? calcularDEL(vaca.ultimoParto) : null;
            const statusAtual = obterStatus(vaca, del);
            const proximaAcaoTexto = obterProximaAcao(vaca);
              const infoProximaAcao = formatarDetalhes(obterDetalhesAcao(vaca, "proxima"));
            const dataProximaAcao = obterDataProximaAcao(vaca);
            const ultimaAcaoTexto = obterUltimaAcao(vaca);
            const infoUltimaAcao = formatarDetalhes(obterDetalhesAcao(vaca, "ultima"));

            return (
              <tr key={vaca.numero} className={statusAtual.includes('Prenhe') ? 'tr-prenha' : ''}>
                <td className={`${colunaHover === 0 ? 'coluna-hover' : ''} ${colClasses[0]}`}>
                  <input
                    type="checkbox"
                    className="checkbox-tabela"
                    checked={selecionados.includes(vaca.numero)}
                    onChange={() => alternarSelecionado(vaca.numero)}
                  />
                </td>
                <td className={`${colunaHover === 1 ? 'coluna-hover' : ''} ${colClasses[1]}`}>{vaca.numero}</td>
                <td className={`${colunaHover === 2 ? 'coluna-hover' : ''} ${colClasses[2]}`}>{vaca.brinco || '—'}</td>
                <td
                  className={`${colunaHover === 3 ? 'coluna-hover' : ''} ${colClasses[3]}`}
                >
                  <span
                    className={
                      del === null
                        ? ''
                        : del < 30
                        ? 'text-yellow-600'
                        : del > 60
                        ? 'text-red-600'
                        : 'text-green-600'
                    }
                  >
                    {del}
                  </span>
                </td>
                <td className={`${colunaHover === 4 ? 'coluna-hover' : ''} ${colClasses[4]}`}>{statusAtual}</td>
                <td
                  className={`coluna-overflow ${colunaHover === 5 ? 'coluna-hover' : ''} ${colClasses[5]} coluna-limitada`}
                >
                  <OverflowInfo texto={ultimaAcaoTexto} infoTexto={infoUltimaAcao} />
                </td>
                <td
                  className={`coluna-overflow ${colunaHover === 6 ? 'coluna-hover' : ''} ${colClasses[6]} coluna-limitada`}
                >
                  <OverflowInfo texto={proximaAcaoTexto} infoTexto={infoProximaAcao} />
                </td>
                <td className={`${colunaHover === 7 ? 'coluna-hover' : ''} ${colClasses[7]}`}>{dataProximaAcao}</td>
                <td
                  className={`${colunaHover === 8 ? 'coluna-hover' : ''} ${colClasses[8]} coluna-acoes`}
                >
                  {renderizarMenuAcoes(vaca, del)}
                </td>
                <td className={`${colunaHover === 9 ? 'coluna-hover' : ''} ${colClasses[9]}`}> 
                  <button
                    onClick={() => abrirFicha(vaca)}
                     className="botao-acao pequeno"
                  >
                    <img
                      src="/icones/fichaanimal.png"
                      alt="Ficha Animal"
                      style={{ width: '36px', height: '36px', objectFit: 'contain', display: 'block', margin: 'auto' }}
                    />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selecionados.length > 0 && (
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            className="checkbox-tabela"
            checked={todasSelecionadas}
            onChange={selecionarTodas}
          />
          <select id="bulk-action" onChange={(e) => aplicarAcaoLote(e.target.value)} className="border p-2 rounded">
            <option value="">Ações em lote...</option>
            <option value="Iniciar Protocolo">Iniciar Protocolo</option>
            <option value="Alterar Status">Alterar Status</option>
          </select>
        </div>
      )}

      {mostrarFicha && animalFicha && (
        <ModalHistoricoCompleto
          animal={animalFicha}
          onClose={() => {
            setMostrarFicha(false);
            setAnimalFicha(null);
          }}
        />
      )}

      {mostrarModalPEV && (
        <ModalConfiguracaoPEV
          onClose={() => setMostrarModalPEV(false)}
          onAplicar={aplicarConfiguracoesPEV}
        />
      )}

      {vacaOcorrencia && (
        <ModalRegistrarOcorrencia
          vaca={vacaOcorrencia}
          status={vacaOcorrencia.statusPEV}
          onClose={() => setVacaOcorrencia(null)}
          onSalvar={() => setVacaOcorrencia(null)}
        />
      )}
    </div>
  );
}
