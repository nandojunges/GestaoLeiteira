import React, { useState, useEffect } from "react";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";
import ModalEditarProduto from "./ModalEditarProduto";

export default function ListaProdutos({ categoriaFiltro }) {
  const [produtos, setProdutos] = useState([]);
  const [colunaHover, setColunaHover] = useState(null);
  const [produtoEditar, setProdutoEditar] = useState(null);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);

  useEffect(() => {
    const atualizar = () => {
      const armazenados = JSON.parse(localStorage.getItem("produtos") || "[]");
      setProdutos(armazenados);
    };

    atualizar();
    window.addEventListener("produtosAtualizados", atualizar);
    return () => window.removeEventListener("produtosAtualizados", atualizar);
  }, []);

  const titulos = [
    "Nome Comercial",
    "Categoria",
    "Quantidade",
    "Valor Total",
    "Apresentação",
    "Volume",
    "Valor Unitário",
    "Validade",
    "Alerta Estoque",
    "Alerta Validade",
    "Ação"
  ];

  const calcularValorUnitario = (produto) => {
    if (produto.valorTotal && produto.quantidade && produto.volume) {
      const totalVolume = produto.quantidade * produto.volume;
      return totalVolume > 0 ? produto.valorTotal / totalVolume : null;
    }
    return null;
  };

  const verificarAlertaEstoque = (produto) => {
    const ajustes = JSON.parse(localStorage.getItem("ajustesEstoque") || "{}");
    const minimo = ajustes[produto.categoria] || 0;
    return produto.quantidade < minimo;
  };

  const verificarAlertaValidade = (validade) => {
    if (!validade) return false;
    const diasAlerta = 30;
    const hoje = new Date();
    const dataVal = new Date(validade);
    const diff = (dataVal - hoje) / (1000 * 60 * 60 * 24);
    return diff <= diasAlerta;
  };

  const abrirModalEdicao = (produto) => {
    setProdutoEditar({ ...produto });
    setMostrarModalEdicao(true);
  };

  const confirmarExclusao = (produto) => {
    setProdutoParaExcluir(produto);
  };

  return (
    <div className="w-full px-8 py-6 font-sans">
      <table className="tabela-padrao" style={{ tableLayout: "auto", width: "100%" }}>
        <thead>
          <tr>
            {titulos.map((titulo, index) => (
              <th
                key={index}
                onMouseEnter={() => setColunaHover(index)}
                onMouseLeave={() => setColunaHover(null)}
                className={colunaHover === index ? "coluna-hover" : ""}
                style={{
                  whiteSpace: "nowrap",
                  width: titulo === "Ação" ? "1%" : "auto",
                  textAlign: "left"
                }}
              >
                {titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {produtos.length === 0 ? (
            <tr>
              <td colSpan={titulos.length} style={{ textAlign: "center" }}>
                Nenhum produto cadastrado.
              </td>
            </tr>
          ) : (
            produtos.map((p, index) => {
              if (!p) return null;
              const agrupamento = p.agrupamento || "";
              if (categoriaFiltro !== "Todos" && agrupamento !== categoriaFiltro) return null;

              const valorUnitario = calcularValorUnitario(p);
              const alertaEstoque = verificarAlertaEstoque(p);
              const alertaValidade = verificarAlertaValidade(p.validade);

              return (
                <tr key={index}>
                  <td style={{ fontWeight: 600 }}>{p.nomeComercial || "—"}</td>
                  <td>{p.categoria || "—"}</td>
                  <td>{p.quantidade ? `${p.quantidade} ${p.unidade || ""}` : "—"}</td>
                  <td>{p.valorTotal ? `R$ ${Number(p.valorTotal).toFixed(2)}` : "—"}</td>
                  <td>{p.apresentacao || "—"}</td>
                  <td>{p.volume ? `${p.volume} ${p.unidade || ""}` : "—"}</td>
                  <td>{valorUnitario ? `R$ ${valorUnitario.toFixed(2)} / ${p.unidade}` : "—"}</td>
                  <td>{p.validade || "—"}</td>
                  <td style={{ color: alertaEstoque ? "red" : "green", fontWeight: 600 }}>
                    {alertaEstoque ? "⚠️ Baixo" : "OK"}
                  </td>
                  <td style={{ color: alertaValidade ? "orange" : "green", fontWeight: 600 }}>
                    {alertaValidade ? "⚠️ Vencendo" : "OK"}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        type="button"
                        onClick={() => abrirModalEdicao(p)}
                        style={{
                          backgroundColor: "#007bff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.4rem 0.8rem",
                          fontWeight: "bold",
                          cursor: "pointer"
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmarExclusao(p)}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.4rem 0.8rem",
                          fontWeight: "bold",
                          cursor: "pointer"
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {mostrarModalEdicao && (
        <ModalEditarProduto
          produto={produtoEditar}
          onFechar={() => setMostrarModalEdicao(false)}
          onSalvar={() => setMostrarModalEdicao(false)}
        />
      )}

      {produtoParaExcluir && (
        <div style={estilos.overlay}>
          <div style={estilos.modal}>
            <h3 style={estilos.titulo}>❗ Confirmar Exclusão</h3>
            <p style={estilos.texto}>
              Deseja realmente excluir o produto <strong>{produtoParaExcluir.nomeComercial || "sem nome"}</strong>?
            </p>
            <div style={estilos.botoes}>
              <button
                onClick={() => setProdutoParaExcluir(null)}
                style={estilos.btnCancelar}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const lista = JSON.parse(localStorage.getItem("produtos") || "[]");
                  const novaLista = lista.filter(
                    (p) => JSON.stringify(p) !== JSON.stringify(produtoParaExcluir)
                  );
                  localStorage.setItem("produtos", JSON.stringify(novaLista));
                  window.dispatchEvent(new Event("produtosAtualizados"));
                  setProdutoParaExcluir(null);
                }}
                style={estilos.btnConfirmar}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const estilos = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  modal: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
  },
  titulo: {
    fontSize: "1.2rem",
    marginBottom: "1rem"
  },
  texto: {
    fontSize: "1rem",
    marginBottom: "1.5rem"
  },
  botoes: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem"
  },
  btnCancelar: {
    backgroundColor: "#ccc",
    color: "#000",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  btnConfirmar: {
    backgroundColor: "#dc3545",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer"
  }
};
