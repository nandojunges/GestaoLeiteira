import React, { useState, useEffect } from "react";
import ModalCadastroProtocolo from "./ModalCadastroProtocolo";
import ModalConfirmarExclusao from "../../components/ModalConfirmarExclusao";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";

export default function ProtocolosReprodutivos() {
  const [modalAberto, setModalAberto] = useState(false);
  const [indexEditar, setIndexEditar] = useState(null);
  const [protocolos, setProtocolos] = useState([]);
  const [colunaHover, setColunaHover] = useState(null);
  const [protocoloExpandido, setProtocoloExpandido] = useState(null);
  const [protocoloExcluir, setProtocoloExcluir] = useState(null);

  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem("protocolos") || "[]");
    setProtocolos(salvos);
  }, []);

  const salvarProtocolo = (prot, indice = null) => {
    let atualizados = [];
    if (indice !== null) {
      atualizados = protocolos.map((p, i) => (i === indice ? prot : p));
    } else {
      atualizados = [...protocolos, prot];
    }
    setProtocolos(atualizados);
    localStorage.setItem("protocolos", JSON.stringify(atualizados));
  };

  const removerProtocolo = (index) => {
    const atualizados = protocolos.filter((_, i) => i !== index);
    setProtocolos(atualizados);
    localStorage.setItem("protocolos", JSON.stringify(atualizados));
    setProtocoloExcluir(null);
  };

  const editarProtocolo = (index) => {
    setIndexEditar(index);
    setModalAberto(true);
  };

  const toggleExpandirProtocolo = (index) => {
    setProtocoloExpandido(protocoloExpandido === index ? null : index);
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

  const titulos = ["Nome", "Descrição", "Etapas", "Ações"];

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
              <td colSpan={4} className="text-center py-4 text-gray-500">
                Nenhum protocolo cadastrado.
              </td>
            </tr>
          ) : (
            protocolos.map((protocolo, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td className={colunaHover === 0 ? "coluna-hover" : ""}>
                    {protocolo.nome}
                  </td>
                  <td className={colunaHover === 1 ? "coluna-hover" : ""}>
                    {protocolo.descricao || "—"}
                  </td>
                  <td className={colunaHover === 2 ? "coluna-hover" : ""} style={{ whiteSpace: "normal", overflow: "visible" }}>
                    <div style={{ backgroundColor: "#eaf3ff", padding: "12px 16px", borderRadius: "8px", fontSize: "14px" }}>
                      <div style={{ fontWeight: 600, color: "#004AAD" }}>Etapas:</div>
                      {formatarEtapas(protocolo.etapas)}
                    </div>
                  </td>
                  <td
                    className={`${colunaHover === 3 ? "coluna-hover" : ""} text-center`}
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
                        {protocoloExpandido === index ? "🔼" : "🔽"}
                      </button>
                    </div>
                  </td>
                </tr>

                {protocoloExpandido === index && (
                  <tr>
                    <td colSpan={4} className="bg-gray-50 p-2 text-sm text-center text-gray-500">
                      Nenhum animal ativo listado para este protocolo.
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
