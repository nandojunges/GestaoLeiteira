import React, { useState } from "react";
import ModalCadastroProtocolo from "./ModalCadastroProtocolo";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";

export default function ProtocolosReprodutivos() {
  const [modalAberto, setModalAberto] = useState(false);
  const [protocolos, setProtocolos] = useState([]);
  const [colunaHover, setColunaHover] = useState(null);
  const [protocoloExpandido, setProtocoloExpandido] = useState(null);

  const salvarProtocolo = (novoProtocolo) => {
    setProtocolos([...protocolos, novoProtocolo]);
  };

  const excluirProtocolo = (index) => {
    if (window.confirm("Tem certeza que deseja excluir este protocolo?")) {
      setProtocolos(protocolos.filter((_, i) => i !== index));
    }
  };

  const editarProtocolo = (index) => {
    alert("Funcionalidade de edição em desenvolvimento. Index: " + index);
  };

  const toggleExpandirProtocolo = (index) => {
    setProtocoloExpandido(protocoloExpandido === index ? null : index);
  };

  const titulos = ["Nome", "Descrição", "Etapas", "Ações"];

  return (
    <div className="w-full px-8 py-6 font-sans">
      <div style={{ marginBottom: "1rem", textAlign: "right" }}>
        <button
          onClick={() => setModalAberto(true)}
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
                  <td className={colunaHover === 2 ? "coluna-hover" : ""}>
                    {protocolo.etapas.map((etapa, i) => (
                      <div key={i}>
                        Dia {etapa.dia}: {etapa.acao}
                      </div>
                    ))}
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
                        onClick={() => excluirProtocolo(index)}
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
          onFechar={() => setModalAberto(false)}
          onSalvar={salvarProtocolo}
        />
      )}
    </div>
  );
}
