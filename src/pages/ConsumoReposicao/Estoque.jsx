import React, { useState, useEffect } from "react";
import {
  buscarTodos,
  adicionarItem,
  atualizarItem,
  excluirItem,
} from "../../utils/backendApi";
import CadastroProduto from "./CadastroProduto";
import AjustesEstoque from "./AjustesEstoque";
import ModalEditarProduto from "./ModalEditarProduto";
import Select from "react-select";
import ModalExclusaoPadrao from "../../components/modals/ModalExclusaoPadrao";
import "../../styles/botoes.css";
import "../../styles/tabelaModerna.css";
import "../../styles/estoque.css";
import verificarAlertaEstoqueInteligente from "../../utils/verificarAlertaEstoque";
import verificarValidadeProduto from "../../utils/VerificarValidadeProduto";

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [produtoEditar, setProdutoEditar] = useState(null);
  const [indiceEditar, setIndiceEditar] = useState(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");

  const categorias = [
    "Todos",
    "Cozinha",
    "Higiene e Limpeza",
    "Farmácia",
    "Materiais Gerais"
  ];


  useEffect(() => {
    const atualizar = async () => {
      try {
        const lista = await buscarTodos("estoque");
        setProdutos(Array.isArray(lista) ? lista : []);
      } catch (err) {
        console.error("Erro ao carregar estoque:", err);
        setProdutos([]);
      }
    };

    atualizar();
    window.addEventListener("estoqueAtualizado", atualizar);
    return () => window.removeEventListener("estoqueAtualizado", atualizar);
  }, []);

  const handleSalvarProduto = async (novoProduto) => {
    try {
      const salvo = await adicionarItem("estoque", novoProduto);
      setProdutos([...produtos, salvo]);
      setMostrarCadastro(false);
      window.dispatchEvent(new Event("estoqueAtualizado"));
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
    }
  };



  const abrirModalEdicao = (produto, index) => {
    setProdutoEditar({ ...produto });
    setIndiceEditar(index);
    setMostrarModalEdicao(true);
  };

  const confirmarExclusao = (produto) => {
    setProdutoParaExcluir(produto);
  };

  const produtosFiltrados = categoriaSelecionada === "Todos"
    ? produtos
    : produtos.filter((p) => p?.categoria === categoriaSelecionada);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
        <button className="botao-acao" onClick={() => setMostrarCadastro(true)}>+ Novo Produto</button>
        <button className="botao-acao" onClick={() => setMostrarAjustes(true)}>⚙️ Ajustes</button>
        <div style={{ minWidth: "180px" }}>
          <Select
            options={categorias.map((cat) => ({ value: cat, label: cat }))}
            value={{ value: categoriaSelecionada, label: categoriaSelecionada }}
            onChange={(option) => setCategoriaSelecionada(option.value)}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Categoria"
            isSearchable={false}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="tabela-padrao tabela-estoque">
        <thead>
          <tr>
            {[
              "Nome Comercial",
              "Categoria",
              "Quantidade",
              "Valor Total",
              "Apresentação",
              "Validade",
              "Alerta Estoque",
              "Alerta Validade",
              "Ação"
            ].map((titulo, index) => (
              <th key={index}>{titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {produtosFiltrados.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ textAlign: "center", padding: "20px" }}>
                Nenhum produto cadastrado.
              </td>
            </tr>
          ) : (
            produtosFiltrados.map((p, index) => {
              if (!p || typeof p !== "object") return null;
              const alerta = verificarAlertaEstoqueInteligente(p);
              const statusValidade = verificarValidadeProduto(p.validade);

              return (
                <tr key={index}>
                  <td style={{ fontWeight: 600 }} className="truncate">
                    {p.nomeComercial || "—"}
                  </td>
                  <td>{p.categoria || "—"}</td>
                  <td>{p.quantidade ? `${p.quantidade} ${p.unidade || ""}` : "—"}</td>
                  <td>{p.valorTotal ? `R$ ${Number(p.valorTotal).toFixed(2)}` : "—"}</td>
                  <td>{p.apresentacao || "—"}</td>
                  <td>{p.validade || "—"}</td>
                  <td
                    style={{
                      color: alerta.status === "ok" ? "green" : alerta.status === "insuficiente" ? "red" : "orange",
                      fontWeight: 600,
                      whiteSpace: "normal",
                      maxWidth: "180px",
                      overflowWrap: "break-word"
                    }}
                  >
                    {alerta.status === "insuficiente" && "🔴 Insuficiente"}
                    {alerta.status === "baixo" && `🟠 Estoque baixo${alerta.mensagem ? ` (${alerta.mensagem})` : ''}`}
                    {alerta.status === "ok" && "🟢 OK"}
                  </td>
                  <td style={{ color: statusValidade.cor, fontWeight: 600 }}>
                    {statusValidade.icone ? `${statusValidade.icone} ${statusValidade.texto}` : statusValidade.texto}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "4px", justifyContent: "center", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => abrirModalEdicao(p, index)}
                        className="btn-editar"
                      >
                        Editar
                      </button>
                      <button
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
      </div>

      {mostrarCadastro && (
        <CadastroProduto
          onFechar={() => setMostrarCadastro(false)}
          onSalvar={handleSalvarProduto}
        />
      )}

      {mostrarAjustes && (
        <div className="modal">
          <AjustesEstoque onFechar={() => setMostrarAjustes(false)} />
        </div>
      )}

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
            try {
              if (produtoParaExcluir?.id) {
                await excluirItem("estoque", produtoParaExcluir.id);
                setProdutos(produtos.filter(p => p.id !== produtoParaExcluir.id));
              }
              window.dispatchEvent(new Event("estoqueAtualizado"));
              setProdutoParaExcluir(null);
            } catch (err) {
              console.error("Erro ao excluir produto:", err);
            }
          }}
        />
      )}
    </div>
  );
}
