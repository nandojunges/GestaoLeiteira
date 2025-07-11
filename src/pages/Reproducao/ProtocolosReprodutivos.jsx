import React, { useState, useEffect, useRef } from "react";
import {
  buscarProtocolos,
  registrarProtocolo,
  atualizarItem,
  excluirItem, // agora deve funcionar
} from "../../utils/apiFuncoes.js";

import { buscarTodosAnimais } from "../../sqlite/animais"; // ✅ também CORRETO
import ModalConfirmarExclusao from "../../components/ModalConfirmarExclusao";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";
import {
  listarVacasAtivasNoProtocolo,
} from "../../utils/registroReproducao";
import gerarTarefasAutomaticas from "../../utils/gerarTarefasAutomaticas";

export default function ProtocolosReprodutivos() {
  const [modalAberto, setModalAberto] = useState(false);
  const [indexEditar, setIndexEditar] = useState(null);
  const [protocolos, setProtocolos] = useState([]);
  const [carregandoProt, setCarregandoProt] = useState(true);
  const [colunaHover, setColunaHover] = useState(null);
  const [protocoloExpandido, setProtocoloExpandido] = useState(null);
  const [protocoloExcluir, setProtocoloExcluir] = useState(null);
  const [vacasPorProtocolo, setVacasPorProtocolo] = useState({});
  const vacasRef = useRef({});

  useEffect(() => {
    vacasRef.current = vacasPorProtocolo;
  }, [vacasPorProtocolo]);

  useEffect(() => {
    (async () => {
      const salvos = await buscarProtocolos();
      setProtocolos(salvos || []);
      setCarregandoProt(false);
    })();
    const atualizar = async () => {
      const ids = Object.keys(vacasRef.current);
      const novo = {};
      for (const id of ids) {
        novo[id] = await listarVacasAtivasNoProtocolo(id);
      }
      setVacasPorProtocolo(novo);
    };
    window.addEventListener('protocolosAtivosAtualizados', atualizar);
    return () => window.removeEventListener('protocolosAtivosAtualizados', atualizar);
  }, []);

  const salvarProtocolo = async (prot, indice = null) => {
    let atualizados = [];
    if (indice !== null) {
      const id = protocolos[indice]?.id;
      if (id) await atualizarItem("protocolos-reprodutivos", id, prot);
      atualizados = protocolos.map((p, i) => (i === indice ? { ...prot, id } : p));
    } else {
      const res = await registrarProtocolo(prot);
      const newId = res?.id;
      atualizados = [...protocolos, { ...prot, id: newId }];
    }
    setProtocolos(atualizados);
  };

  const removerProtocolo = async (index) => {
    const id = protocolos[index]?.id;
    const atualizados = protocolos.filter((_, i) => i !== index);
    setProtocolos(atualizados);
    await excluirItem("protocolos-reprodutivos", id);
    await gerarTarefasAutomaticas();
    setProtocoloExcluir(null);
  };

  const editarProtocolo = (index) => {
    setIndexEditar(index);
    setModalAberto(true);
  };

  const toggleExpandirProtocolo = async (index) => {
    if (protocoloExpandido === index) {
      setProtocoloExpandido(null);
    } else {
      setProtocoloExpandido(index);
      const prot = protocolos[index];
      if (prot) {
        const idProt = prot.id ?? index;
        const animais = await buscarTodosAnimais();
        const vacas = (prot.vacasAtivas || [])
          .map((n) => animais.find((a) => a.numero === n))
          .filter(Boolean)
          .map((v) => {
            const prox = (v.protocoloAtivo?.etapasProgramadas || []).find(
              (e) => e.status === 'pendente'
            );
            return {
              numero: v.numero,
              brinco: v.brinco || v.nome || '',
              inicio: v.protocoloAtivo?.inicio || '—',
              proximaAcao: prox ? prox.acao : null,
              proximaData: prox ? prox.data.split('-').reverse().join('/') : null,
            };
          });
        setVacasPorProtocolo((v) => ({ ...v, [idProt]: vacas }));
      }
    }
  };

  const formatarEtapas = (lista) => {
    const agrupado = lista.reduce((acc, e) => {
      if (!acc[e.dia]) acc[e.dia] = [];
      if (e.hormonio) acc[e.dia].push(e.hormonio);
      if (e.acao) acc[e.dia].push(e.acao);
      return acc;
    }, {});
    return Object.entries(agrupado).map(([dia, itens]) => (
      <div key={dia} style={{ marginBottom: "8px" }}>
        <div style={{ fontWeight: 600 }}>Dia {dia}:</div>
        <ul className="list-disc ml-4" style={{ wordBreak: "break-word" }}>
          {itens.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
      </div>
    ));
  };

  const titulos = ["Nome", "Descrição", "Tipo", "Etapas", "Ações"];

  if (carregandoProt) {
    return <div className="w-full text-center py-8">Carregando...</div>;
  }

  return (
    <div className="w-full px-8 py-6 font-sans">
      <div style={{ marginBottom: "1rem", textAlign: "right" }}>
        <button
          onClick={() => {
            setIndexEditar(null);
            setModalAberto(true);
          }}
          className="botao-acao"
        >
          ➕ Cadastrar Protocolo
        </button>
      </div>

      <table className="tabela-padrao">
        <thead>
          <tr>
            {titulos.map((titulo, index) => (
              <th
                key={index}
                onMouseEnter={() => setColunaHover(index)}
                onMouseLeave={() => setColunaHover(null)}
                className={colunaHover === index ? "coluna-hover" : ""}
              >
                {titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {protocolos.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                Nenhum protocolo cadastrado.
              </td>
            </tr>
          ) : (
            protocolos.map((protocolo, index) => (
              <React.Fragment key={protocolo.id ?? index}>
                <tr>
                  <td className={colunaHover === 0 ? "coluna-hover" : ""}>
                    {protocolo.nome}
                  </td>
                  <td className={colunaHover === 1 ? "coluna-hover" : ""}>
                    {protocolo.descricao || "—"}
                  </td>
                  <td className={colunaHover === 2 ? "coluna-hover" : ""}>
                    {protocolo.tipo || '—'}
                  </td>
                  <td className={colunaHover === 3 ? "coluna-hover" : ""} style={{ whiteSpace: "normal", overflow: "visible" }}>
                    <div style={{ backgroundColor: "#eaf3ff", padding: "12px 16px", borderRadius: "8px", fontSize: "14px" }}>
                      <div style={{ fontWeight: 600, color: "#004AAD" }}>Etapas:</div>
                      {formatarEtapas(protocolo.etapas)}
                    </div>
                  </td>
                  <td
                    className={`${colunaHover === 4 ? "coluna-hover" : ""} text-center`}
                  >
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => editarProtocolo(index)}
                        className="botao-acao pequeno"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => setProtocoloExcluir(index)}
                        className="botao-acao pequeno"
                      >
                        🗑️ Excluir
                      </button>
                      <button
                        onClick={() => toggleExpandirProtocolo(index)}
                        className="botao-acao pequeno"
                      >
                        {protocoloExpandido === index ? "🔼 Ocultar" : "🔽 Ver Vacas"}
                      </button>
                    </div>
                  </td>
                </tr>

                {protocoloExpandido === index && (
                  <tr>
                    <td colSpan={5} className="bg-gray-50 p-2 text-sm">
                      {(
                        vacasPorProtocolo[protocolo.id ?? index] || []
                      ).length === 0 ? (
                        <div className="text-center text-gray-500">
                          Nenhum animal ativo listado para este protocolo.
                        </div>
                      ) : (
                        <table className="w-full text-left border border-gray-200 mt-1">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 py-1">Número</th>
                              <th className="px-2 py-1">Brinco</th>
                              <th className="px-2 py-1">Data de início</th>
                              <th className="px-2 py-1">Próxima etapa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vacasPorProtocolo[protocolo.id ?? index].map((v) => (
                              <tr key={v.numero} className="odd:bg-white even:bg-gray-50">
                                <td className="px-2 py-1">{v.numero}</td>
                                <td className="px-2 py-1">{v.brinco || '—'}</td>
                                <td className="px-2 py-1">{v.inicio || '—'}</td>
                                <td className="px-2 py-1">
                                  {v.proximaAcao ? `${v.proximaAcao} (${v.proximaData || '—'})` : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>

      {modalAberto && (
        <ModalCadastroProtocolo
          onFechar={() => {
            setModalAberto(false);
            setIndexEditar(null);
          }}
          onSalvar={(p) => {
            salvarProtocolo(p, indexEditar);
            setModalAberto(false);
            setIndexEditar(null);
          }}
          protocoloInicial={indexEditar !== null ? protocolos[indexEditar] : null}
          indiceEdicao={indexEditar}
        />
      )}

      {protocoloExcluir !== null && (
        <ModalConfirmarExclusao
          mensagem="Tem certeza que deseja excluir este protocolo?"
          onCancelar={() => setProtocoloExcluir(null)}
          onConfirmar={() => removerProtocolo(protocoloExcluir)}
        />
      )}
    </div>
  );
}
