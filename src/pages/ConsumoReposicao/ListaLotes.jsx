import React, { useEffect, useState } from "react";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";
import ModalInfoLote from "./ModalInfoLote";
import ModalConfirmarExclusao from "../../components/ModalConfirmarExclusao";

export default function ListaLotes({ onAbrirCadastro }) {
  const [lotes, setLotes] = useState([]);
  const [colunaHover, setColunaHover] = useState(null);
  const [modalLote, setModalLote] = useState(null);
  const [loteExcluir, setLoteExcluir] = useState(null);

  const carregar = () => {
    const dados = JSON.parse(localStorage.getItem("lotes") || "[]");
    setLotes(dados);
  };

  useEffect(() => {
    carregar();
    window.addEventListener("lotesAtualizados", carregar);
    return () => window.removeEventListener("lotesAtualizados", carregar);
  }, []);

  const numeroVacas = (lote) => {
    const medicoes = JSON.parse(localStorage.getItem("medicoesLeite") || "[]");
    const ultima = medicoes[medicoes.length - 1];
    return ultima?.vacas?.filter((v) => v.lote === lote.nome).length || 0;
  };

  const nivelProdutivo = (lote) => lote.nivelProducao || "—";

  const alternarAtivo = (index) => {
    const atualizados = [...lotes];
    atualizados[index].ativo = !atualizados[index].ativo;
    setLotes(atualizados);
    localStorage.setItem("lotes", JSON.stringify(atualizados));
    window.dispatchEvent(new Event("lotesAtualizados"));
  };

  const removerLote = (index) => {
    const atualizados = lotes.filter((_, i) => i !== index);
    setLotes(atualizados);
    localStorage.setItem("lotes", JSON.stringify(atualizados));
    window.dispatchEvent(new Event("lotesAtualizados"));
    setLoteExcluir(null);
  };

  const abrirModal = (lote) => {
    setModalLote({ nome: lote.nome, funcao: lote.funcao });
  };

  const fecharModal = () => setModalLote(null);

  const titulos = [
    "Nome",
    "Nº de Vacas",
    "Função",
    "Nível Produtivo",
    "Status",
    "Ação",
  ];

  return (
    <div className="w-full px-8 py-6 font-sans">
      <div style={{ marginBottom: "10px" }}>
        <button className="botao-acao" onClick={onAbrirCadastro}>
          + Cadastrar Lote
        </button>
      </div>
      <table className="tabela-padrao">
        <thead>
          <tr>
            {titulos.map((titulo, idx) => (
              <th
                key={idx}
                onMouseEnter={() => setColunaHover(idx)}
                onMouseLeave={() => setColunaHover(null)}
                className={colunaHover === idx ? "coluna-hover" : ""}
              >
                {titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lotes.length === 0 ? (
            <tr>
              <td colSpan={titulos.length} style={{ textAlign: "center" }}>
                Nenhum lote cadastrado.
              </td>
            </tr>
          ) : (
            lotes.map((l, index) => (
              <tr key={index}>
                <td>{l.nome || "—"}</td>
                <td>
                  {numeroVacas(l)}
                  <button
                    onClick={() => abrirModal(l)}
                    style={{ marginLeft: "0.4rem" }}
                  >
                    ℹ️
                  </button>
                </td>
                <td>{l.funcao || "—"}</td>
                <td>{nivelProdutivo(l)}</td>
                <td>{l.ativo ? "Ativo" : "Inativo"}</td>
                <td>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      className="btn-editar"
                      onClick={() => alternarAtivo(index)}
                    >
                      {l.ativo ? "Inativar" : "Ativar"}
                    </button>
                    <button
                      className="btn-excluir"
                      onClick={() => setLoteExcluir(index)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {modalLote && (
        <ModalInfoLote
          nomeDoLote={modalLote.nome}
          funcaoDoLote={modalLote.funcao}
          onFechar={fecharModal}
        />
      )}

      {loteExcluir !== null && (
        <ModalExclusaoPadrao
          mensagem="Deseja realmente excluir este lote?"
          onCancelar={() => setLoteExcluir(null)}
          onConfirmar={() => removerLote(loteExcluir)}
        />
      )}
    </div>
  );
}
