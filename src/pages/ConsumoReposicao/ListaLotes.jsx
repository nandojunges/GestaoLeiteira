import React, { useEffect, useState } from "react";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";
import ModalInfoLote from "./ModalInfoLote";

export default function ListaLotes({ onAbrirCadastro }) {
  const [lotes, setLotes] = useState([]);
  const [colunaHover, setColunaHover] = useState(null);
  const [modalLote, setModalLote] = useState(null);

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

  const nivelProdutivo = (lote) => {
    const animais = (JSON.parse(localStorage.getItem("animais") || "[]")).filter(
      (a) => a.lote === lote.nome
    );
    switch (lote.funcao) {
      case "Lactação": {
        const leite = JSON.parse(localStorage.getItem("leite") || "[]");
        const medias = animais.map((a) => {
          const ult = leite
            .filter((l) => l.numeroAnimal === a.numero)
            .sort((x, y) => new Date(y.data) - new Date(x.data))[0];
          return parseFloat(ult?.litros) || 0;
        });
        if (!medias.length) return "—";
        const media = medias.reduce((a, b) => a + b, 0) / medias.length;
        return media.toFixed(1) + " L";
      }
      case "Pré-parto": {
        const hoje = new Date();
        const dias = animais
          .map((a) => {
            if (!a.dataPrevistaParto) return null;
            const [d, m, y] = a.dataPrevistaParto.split("/");
            const data = new Date(y, m - 1, d);
            return Math.round((data - hoje) / (1000 * 60 * 60 * 24));
          })
          .filter((n) => n != null);
        if (!dias.length) return "—";
        const media = dias.reduce((a, b) => a + b, 0) / dias.length;
        return Math.round(media) + " dias";
      }
      case "Secagem": {
        const tratados = animais.filter((a) =>
          localStorage.getItem("secagem_" + a.numero)
        );
        return tratados.length;
      }
      case "Novilhas": {
        const idades = animais
          .map((a) => {
            if (!a.dataNascimento) return null;
            const [d, m, y] = a.dataNascimento.split("/");
            const nasc = new Date(y, m - 1, d);
            const hoje = new Date();
            return (
              (hoje.getFullYear() - nasc.getFullYear()) * 12 +
              (hoje.getMonth() - nasc.getMonth())
            );
          })
          .filter((n) => n != null);
        if (!idades.length) return "—";
        const media = idades.reduce((a, b) => a + b, 0) / idades.length;
        return Math.round(media) + " meses";
      }
      case "Descarte": {
        const descartes = animais.filter((a) => a.saida);
        return descartes.length;
      }
      case "Tratamento": {
        const total = animais.reduce(
          (acc, a) => acc + ((a.tratamentos || []).length || 0),
          0
        );
        return total;
      }
      default:
        return "";
    }
  };

  const alternarAtivo = (index) => {
    const atualizados = [...lotes];
    atualizados[index].ativo = !atualizados[index].ativo;
    setLotes(atualizados);
    localStorage.setItem("lotes", JSON.stringify(atualizados));
    window.dispatchEvent(new Event("lotesAtualizados"));
  };

  const excluir = (index) => {
    if (!window.confirm("Deseja excluir este lote?")) return;
    const atualizados = lotes.filter((_, i) => i !== index);
    setLotes(atualizados);
    localStorage.setItem("lotes", JSON.stringify(atualizados));
    window.dispatchEvent(new Event("lotesAtualizados"));
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
                      className="botao-editar"
                      onClick={() => alternarAtivo(index)}
                    >
                      {l.ativo ? "Inativar" : "Ativar"}
                    </button>
                    <button
                      className="botao-editar"
                      onClick={() => excluir(index)}
                      style={{ borderColor: "#dc3545", color: "#dc3545" }}
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
    </div>
  );
}
