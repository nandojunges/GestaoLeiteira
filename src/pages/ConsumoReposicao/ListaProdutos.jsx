import React, { useState, useEffect } from "react";
import "../../styles/tabelaModerna.css";
import "../../styles/botoes.css";
import verificarAlertaEstoqueInteligente from "./verificarAlertaEstoque";
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
      let vol = parseFloat(produto.volume);
      if (produto.volumeUnidade && produto.volumeUnidade.toLowerCase().includes("l")) {
        vol *= 1000;
      }
      const totalVolume = produto.quantidade * vol;
      return totalVolume > 0 ? produto.valorTotal / totalVolume : null;
    }
    return null;
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
              if (
                categoriaFiltro !== "Todos" &&
                agrupamento &&
                agrupamento !== categoriaFiltro
              )
                return null;

              const valorUnitario = calcularValorUnitario(p);
              const alerta = verificarAlertaEstoqueInteligente(p);
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
                  <td style={{ color: alerta.status === "ok" ? "green" : alerta.status === "insuficiente" ? "red" : "orange", fontWeight: 600 }}>
                    {alerta.status === "insuficiente" && "🔴 Insuficiente"}
                    {alerta.status === "baixo" && `🟠 Estoque baixo${alerta.mensagem ? ` (${alerta.mensagem})` : ''}`}
                    {alerta.status === "ok" && "🟢 OK"}
                  </td>
                  <td style={{ color: alertaValidade ? "orange" : "green", fontWeight: 600 }}>
                    {alertaValidade ? "⚠️ Vencendo" : "OK"}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
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
