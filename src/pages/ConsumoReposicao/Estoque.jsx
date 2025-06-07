import React, { useState, useEffect } from "react";
import CadastroProduto from "./CadastroProduto";
import AjustesEstoque from "./AjustesEstoque";
import ModalEditarProduto from "./ModalEditarProduto";
import Select from "react-select";
import ModalConfirmarExclusao from "../../components/ModalConfirmarExclusao";
import "../../styles/botoes.css";
import "../../styles/tabelaModerna.css";

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
    const atualizar = () => {
      const armazenados = JSON.parse(localStorage.getItem("produtos") || "[]");
      const limpos = armazenados.filter(p => p && typeof p === "object");
      setProdutos(limpos);
    };

    atualizar();
    window.addEventListener("produtosAtualizados", atualizar);
    return () => window.removeEventListener("produtosAtualizados", atualizar);
  }, []);

  const handleSalvarProduto = (novoProduto) => {
    const atualizados = [...produtos, novoProduto];
    localStorage.setItem("produtos", JSON.stringify(atualizados));
    setProdutos(atualizados);
    setMostrarCadastro(false);
    window.dispatchEvent(new Event("produtosAtualizados"));
  };

  const calcularValorUnitario = (produto) => {
    if (!produto) return null;
    if (produto.valorTotal && produto.quantidade && produto.volume) {
      let vol = parseFloat(produto.volume);
      if (produto.volumeUnidade && produto.volumeUnidade.toLowerCase().includes("l")) {
        vol *= 1000;
      }
      const totalVolume = produto.quantidade * vol;
      return totalVolume > 0 ? produto.valorTotal / totalVolume : null;
    }
    return null;
  };

  const verificarAlertaEstoque = (produto) => {
    const ajustes = JSON.parse(localStorage.getItem("ajustesEstoque") || "{}");
    const minimo = ajustes[produto?.categoria] || 0;
    return produto?.quantidade < minimo;
  };

  const verificarAlertaValidade = (validade) => {
    if (!validade) return false;
    const diasAlerta = 30;
    const hoje = new Date();
    const dataVal = new Date(validade);
    const diff = (dataVal - hoje) / (1000 * 60 * 60 * 24);
    return diff <= diasAlerta;
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

      <table className="tabela-padrao" style={{ tableLayout: "auto", width: "100%" }}>
        <thead>
          <tr>
            {[
              "Nome Comercial", "Categoria", "Quantidade", "Valor Total", "Apresentação", "Volume",
              "Valor Unitário", "Validade", "Alerta Estoque", "Alerta Validade", "Ação"
            ].map((titulo, index) => (
              <th key={index} style={{ textAlign: "left", whiteSpace: "nowrap" }}>{titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {produtosFiltrados.length === 0 ? (
            <tr>
              <td colSpan={11} style={{ textAlign: "center", padding: "20px" }}>
                Nenhum produto cadastrado.
              </td>
            </tr>
          ) : (
            produtosFiltrados.map((p, index) => {
              if (!p || typeof p !== "object") return null;
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
                  <td>{p.volume ? `${p.volume} ${p.volumeUnidade || ""}` : "—"}</td>
                  <td>{valorUnitario ? `R$ ${valorUnitario.toFixed(2)} / ${p.unidade}` : "—"}</td>
                  <td>{p.validade || "—"}</td>
                  <td style={{ color: alertaEstoque ? "red" : "green", fontWeight: 600 }}>
                    {alertaEstoque ? "⚠️ Baixo" : "OK"}
                  </td>
                  <td style={{ color: alertaValidade ? "orange" : "green", fontWeight: 600 }}>
                    {alertaValidade ? "⚠️ Vencendo" : "OK"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        onClick={() => abrirModalEdicao(p, index)}
                        style={{
                          backgroundColor: "#007bff", color: "#fff", border: "none",
                          borderRadius: "8px", padding: "0.4rem 0.8rem", fontWeight: "bold"
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => confirmarExclusao(p)}
                        style={{
                          backgroundColor: "#dc3545", color: "#fff", border: "none",
                          borderRadius: "8px", padding: "0.4rem 0.8rem", fontWeight: "bold"
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
        <ModalConfirmarExclusao
          mensagem={`Deseja realmente excluir o produto \u201c${
            produtoParaExcluir.nomeComercial || "sem nome"
          }\u201d?`}
          onCancelar={() => setProdutoParaExcluir(null)}
          onConfirmar={() => {
            const lista = JSON.parse(localStorage.getItem("produtos") || "[]");
            const novaLista = lista.filter(
              (p) => JSON.stringify(p) !== JSON.stringify(produtoParaExcluir)
            );
            localStorage.setItem("produtos", JSON.stringify(novaLista));
            window.dispatchEvent(new Event("produtosAtualizados"));
            setProdutoParaExcluir(null);
          }}
        />
      )}
    </div>
  );
}
