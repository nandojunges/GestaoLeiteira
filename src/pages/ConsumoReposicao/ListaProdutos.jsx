import React, { useState, useEffect } from "react";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";
import {
  db,
  buscarTodos,
  adicionarItem,
} from "../../utils/db";
import verificarAlertaEstoqueInteligente from "../../utils/verificarAlertaEstoque";
import verificarValidadeProduto from "../../utils/VerificarValidadeProduto";
import ModalEditarProduto from "./ModalEditarProduto";
import ModalExclusaoPadrao from "../../components/ModalExclusaoPadrao";

export default function ListaProdutos({ categoriaFiltro }) {
  const [produtos, setProdutos] = useState([]);
  const [colunaHover, setColunaHover] = useState(null);
  const [produtoEditar, setProdutoEditar] = useState(null);
  const [indiceEditar, setIndiceEditar] = useState(null);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);

  useEffect(() => {
    const atualizar = async () => {
      try {
        const armazenados = await buscarTodos("produtos");
        setProdutos(armazenados);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        setProdutos([]);
      }
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
    "Validade",
    "Alerta Estoque",
    "Alerta Validade",
    "Ação",
  ];

  const colWidths = {
    "Nome Comercial": "16%",
    Categoria: "12%",
    Quantidade: "10%",
    "Valor Total": "10%",
    Apresentação: "10%",
    Validade: "12%",
    "Alerta Estoque": "12%",
    "Alerta Validade": "12%",
    Ação: "6%",
  };

  const estiloCabecalho = {
    "Nome Comercial": { width: colWidths["Nome Comercial"], whiteSpace: "nowrap" },
    Categoria: { width: colWidths["Categoria"], whiteSpace: "nowrap", textAlign: "center" },
    Quantidade: { width: colWidths["Quantidade"], whiteSpace: "nowrap", textAlign: "center" },
    "Valor Total": { width: colWidths["Valor Total"], whiteSpace: "nowrap", textAlign: "center" },
    Apresentação: { width: colWidths["Apresentação"], whiteSpace: "nowrap", textAlign: "center" },
    Validade: { width: colWidths["Validade"], whiteSpace: "nowrap", textAlign: "center" },
    "Alerta Estoque": { width: colWidths["Alerta Estoque"], whiteSpace: "nowrap", textAlign: "center" },
    "Alerta Validade": { width: colWidths["Alerta Validade"], whiteSpace: "nowrap", textAlign: "center" },
    Ação: { width: colWidths["Ação"], whiteSpace: "nowrap", textAlign: "center" },
  };




  const abrirModalEdicao = (produto, index) => {
    setProdutoEditar({ ...produto });
    setIndiceEditar(index);
    setMostrarModalEdicao(true);
  };

  const confirmarExclusao = (produto) => {
    setProdutoParaExcluir(produto);
  };

  return (
    <div className="w-full px-8 py-6 font-sans">
      <table className="tabela-padrao" style={{ tableLayout: "fixed", width: "100%" }}>
        <thead>
          <tr>
            {titulos.map((titulo, index) => (
              <th
                key={index}
                onMouseEnter={() => setColunaHover(index)}
                onMouseLeave={() => setColunaHover(null)}
                className={colunaHover === index ? "coluna-hover" : ""}
                style={estiloCabecalho[titulo]}
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
              if (
                categoriaFiltro !== "Todos" &&
                agrupamento &&
                agrupamento !== categoriaFiltro
              )
                return null;

              const alerta = verificarAlertaEstoqueInteligente(p);
              const statusValidade = verificarValidadeProduto(p.validade);

              return (
                <tr key={index}>
                  <td style={{ fontWeight: 600, width: colWidths["Nome Comercial"] }} className="truncate">
                    {p.nomeComercial || "—"}
                  </td>
                  <td style={{ textAlign: "center", width: colWidths["Categoria"] }}>{p.categoria || "—"}</td>
                  <td style={{ textAlign: "center", width: colWidths["Quantidade"] }}>{p.quantidade ? `${p.quantidade} ${p.unidade || ""}` : "—"}</td>
                  <td style={{ textAlign: "center", width: colWidths["Valor Total"] }}>{p.valorTotal ? `R$ ${Number(p.valorTotal).toFixed(2)}` : "—"}</td>
                  <td style={{ textAlign: "center", width: colWidths["Apresentação"] }}>{p.apresentacao || "—"}</td>
                  <td style={{ textAlign: "center", width: colWidths["Validade"] }}>{p.validade || "—"}</td>
                  <td style={{ textAlign: "center", color: alerta.status === "ok" ? "green" : alerta.status === "insuficiente" ? "red" : "orange", fontWeight: 600 }}>
                    {alerta.status === "insuficiente" && "🔴 Insuficiente"}
                    {alerta.status === "baixo" && `🟠 Estoque baixo${alerta.mensagem ? ` (${alerta.mensagem})` : ''}`}
                    {alerta.status === "ok" && "🟢 OK"}
                  </td>
                  <td style={{ textAlign: "center", color: statusValidade.cor, fontWeight: 600, width: colWidths["Alerta Validade"] }}>
                    {statusValidade.icone ? `${statusValidade.icone} ${statusValidade.texto}` : statusValidade.texto}
                  </td>
                  <td style={{ whiteSpace: "nowrap", textAlign: "center", width: colWidths["Ação"] }}>
                    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                      <button
                        type="button"
                        onClick={() => abrirModalEdicao(p, index)}
                        className="btn-editar"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmarExclusao(p)}
                        className="btn-excluir"
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
          indice={indiceEditar}
          onFechar={() => {
            setMostrarModalEdicao(false);
            setIndiceEditar(null);
          }}
          onSalvar={() => {
            setMostrarModalEdicao(false);
            setIndiceEditar(null);
          }}
        />
      )}

      {produtoParaExcluir && (
        <ModalExclusaoPadrao
          mensagem={`Deseja realmente excluir o produto \u201c${
            produtoParaExcluir.nomeComercial || "sem nome"
          }\u201d?`}
          onCancelar={() => setProdutoParaExcluir(null)}
          onConfirmar={async () => {
            const lista = await buscarTodos("produtos");
            const novaLista = (lista || []).filter(
              (p) => JSON.stringify(p) !== JSON.stringify(produtoParaExcluir)
            );
            await adicionarItem("produtos", novaLista);
            window.dispatchEvent(new Event("produtosAtualizados"));
            window.dispatchEvent(new Event("estoqueAtualizado"));
            setProdutoParaExcluir(null);
          }}
        />
      )}
    </div>
  );
}
