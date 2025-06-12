import React, { useState, useEffect } from 'react';
import { carregarAnimaisDoLocalStorage, calcularDEL } from '../Animais/utilsAnimais';
import ModalHistoricoCompleto from "../Animais/ModalHistoricoCompleto";
import ModalConfiguracaoPEV from "./ModalConfiguracaoPEV";
import { getStatusVaca, filtrarAnimaisAtivos, filtrarPorStatus } from './utilsReproducao';
import ModalRegistrarOcorrencia from './ModalRegistrarOcorrencia';
import '../../styles/tabelaModerna.css';
import '../../styles/botoes.css';

export default function VisaoGeralReproducao() {
  const [vacas, setVacas] = useState([]);
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
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroDelMin, setFiltroDelMin] = useState('');
  const [filtroDelMax, setFiltroDelMax] = useState('');
  const [selecionados, setSelecionados] = useState([]);

  useEffect(() => {
    const animais = carregarAnimaisDoLocalStorage();
    const ativos = filtrarAnimaisAtivos(animais);
    setVacas(ativos);

    const config = JSON.parse(localStorage.getItem("configPEV") || "{}");
    setConfigPEV({
      diasPEV: config.diasPEV || 60,
      permitirPreSincronizacao: config.permitirPreSincronizacao || false,
      permitirSecagem: config.permitirSecagem || true,
    });
  }, []);

  const abrirFicha = (vaca) => {
    setAnimalFicha(vaca);
    setMostrarFicha(true);
  };

  const aplicarConfiguracoesPEV = (config) => {
    setConfigPEV(config);
    localStorage.setItem("configPEV", JSON.stringify(config));
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

  const obterStatus = (vaca, del) => {
    const statusBase = (vaca.statusReprodutivo || '').toLowerCase();
    if (statusBase === 'prenhe') return '✅ Prenhe confirmada';
    if (statusBase === 'seca') return '🔴 Seca';
    const statusPEV = getStatusVaca(del);
    return statusPEV === 'Liberada' ? '🟢 Liberada' : '🔵 Pós-parto (PEV)';
  };

  const obterProximaAcao = (vaca) => {
    return vaca.proximaAcao?.tipo || '—';
  };

  const obterDataProximaAcao = (vaca) => {
    return vaca.proximaAcao?.dataPrevista || '—';
  };

  const renderizarMenuAcoes = (vaca, del) => {
    const statusPEV = getStatusVaca(del);
    return (
      <button
        onClick={() => setVacaOcorrencia({ ...vaca, statusPEV })}
        className="botao-editar"
      >
        📋 Registrar Ocorrência
      </button>
    );
  };


  const alternarSelecionado = (num) => {
    setSelecionados((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const vacasFiltradas = filtrarPorStatus(vacas, filtroStatus, filtroDelMin, filtroDelMax);

  const todasSelecionadas = selecionados.length === vacasFiltradas.length && vacasFiltradas.length > 0;

  const selecionarTodas = (v) => {
    if (v.target.checked) setSelecionados(vacasFiltradas.map((v) => v.numero));
    else setSelecionados([]);
  };

  const aplicarAcaoLote = (acao) => {
    if (!acao) return;
    alert(`Aplicar "${acao}" para: ${selecionados.join(', ')}`);
  };

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

      <table className="tabela-padrao">
        <thead>
          <tr>
            {titulos.map((titulo, index) => (
              <th
                key={index}
                onMouseEnter={() => setColunaHover(index)}
                onMouseLeave={() => setColunaHover(null)}
                className={`${colunaHover === index ? 'coluna-hover' : ''} ${index === 8 ? 'coluna-acoes' : ''}`}
                style={index === 8 ? { minWidth: '180px' } : {}}
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
          {vacasFiltradas.map((vaca, index) => {
            const del = vaca.ultimoParto ? calcularDEL(vaca.ultimoParto) : null;
            const statusAtual = obterStatus(vaca, del);
            const proximaAcao = obterProximaAcao(vaca);
            const dataProximaAcao = obterDataProximaAcao(vaca);

            const dados = [
              <input
                type="checkbox"
                className="checkbox-tabela"
                checked={selecionados.includes(vaca.numero)}
                onChange={() => alternarSelecionado(vaca.numero)}
              />,
              vaca.numero,
              vaca.brinco || '—',
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
              </span>,
              statusAtual,
              vaca.ultimaAcao?.tipo || '—',
              proximaAcao,
              dataProximaAcao,
              renderizarMenuAcoes(vaca, del),
              <button
                onClick={() => abrirFicha(vaca)}
                className="botao-acao pequeno"
              >
                📁 Ficha
              </button>
            ];

            return (
              <tr key={index} className={statusAtual.includes('Prenhe') ? 'tr-prenha' : ''}>
                {dados.map((conteudo, colIdx) => (
                  <td
                    key={colIdx}
                    className={`${colunaHover === colIdx ? 'coluna-hover' : ''} ${colIdx === 8 ? 'coluna-acoes' : ''}`}
                    style={colIdx === 8 ? { minWidth: '180px' } : {}}
                  >
                    {conteudo}
                  </td>
                ))}
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
