import React, { useEffect, useState } from "react";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";
import ModalInfoLote from "./ModalInfoLote";
import ModalExclusaoPadrao from "../../components/ModalExclusaoPadrao";
import {
  db,
  buscarTodos,
  adicionarItem,
} from "../../utils/db";

export default function ListaLotes({ onAbrirCadastro }) {
  const [lotes, setLotes] = useState([]);
  const [colunaHover, setColunaHover] = useState(null);
  const [modalLote, setModalLote] = useState(null);
  const [loteExcluir, setLoteExcluir] = useState(null);

  const carregar = async () => {
    try {
      const dados = await buscarTodos("lotes");
      setLotes(dados);
    } catch (err) {
      console.error("Erro ao carregar lotes:", err);
      setLotes([]);
    }
  };

  useEffect(() => {
    carregar();
    window.addEventListener("lotesAtualizados", carregar);
    return () => window.removeEventListener("lotesAtualizados", carregar);
  }, []);

  const numeroVacas = async (lote) => {
    const medicoes = await buscarTodos("medicoesLeite");
    const ultima = medicoes[medicoes.length - 1];
    return ultima?.vacas?.filter((v) => v.lote === lote.nome).length || 0;
  };

  const nivelProdutivo = (lote) => lote.nivelProducao || "—";

  const alternarAtivo = async (index) => {
    const atualizados = [...lotes];
    atualizados[index].ativo = !atualizados[index].ativo;
    setLotes(atualizados);
    await adicionarItem("lotes", atualizados);
    window.dispatchEvent(new Event("lotesAtualizados"));
  };

  const removerLote = async (index) => {
    const atualizados = lotes.filter((_, i) => i !== index);
    setLotes(atualizados);
    await adicionarItem("lotes", atualizados);
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
                  <img
                    src="/icones/informacoes.png"
                    alt="Informações"
                    style={{
                      width: 28,
                      height: 28,
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      boxShadow: 'none',
                      marginLeft: '0.4rem',
                    }}
                    onClick={() => abrirModal(l)}
                  />
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
