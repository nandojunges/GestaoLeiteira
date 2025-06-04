import React, { useState } from "react";
import Select from "react-select"; // ✅ react-select para visual moderno
import ListaProdutos from "./ListaProdutos";
import CadastroProduto from "./CadastroProduto";
import AjustesEstoque from "./AjustesEstoque";
import "../../styles/botoes.css";

export default function IndexEstoque() {
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");

  const categorias = [
    "Todos",
    "Cozinha",
    "Higiene e Limpeza",
    "Farmácia",
    "Materiais Gerais"
  ];

  const handleSalvarProduto = (novoProduto) => {
    const produtosExistentes = JSON.parse(localStorage.getItem("produtos") || "[]");
    const atualizados = [...produtosExistentes, novoProduto];
    localStorage.setItem("produtos", JSON.stringify(atualizados));
    window.dispatchEvent(new Event("produtosAtualizados"));
    setMostrarCadastro(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestão de Estoque</h1>

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
            placeholder="Selecione..."
            isSearchable={false}
            menuPortalTarget={document.body} // ✅ resolve sobreposição
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // ✅ mantém sobre todos
          />
        </div>
      </div>

      <ListaProdutos categoriaFiltro={categoriaSelecionada} />

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
    </div>
  );
}
