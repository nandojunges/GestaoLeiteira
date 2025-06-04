import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Select from "react-select";

export default function ModalEditarProduto({ produto, onFechar, onSalvar }) {
  const [editado, setEditado] = useState(produto);
  const [categorias, setCategorias] = useState([]);
  const camposRef = useRef([]);

  useEffect(() => {
    const escFunction = (e) => {
      if (e.key === "Escape") onFechar();
    };

    const carregarCategorias = () => {
      const listaFixa = [
        "Ração", "Aditivos", "Suplementos", "Detergentes", "Ácido", "Alcalino",
        "Sanitizante", "Antibiótico", "Antiparasitário", "AINE", "AIE", "Hormônio",
        "Vitaminas", "Luvas", "Materiais Diversos"
      ];
      const opcoes = listaFixa.map((cat) => ({ label: cat, value: cat }));
      setCategorias(opcoes);
    };

    window.addEventListener("keydown", escFunction);
    carregarCategorias();
    camposRef.current[0]?.focus();

    return () => window.removeEventListener("keydown", escFunction);
  }, [onFechar]);

  const atualizar = (campo, valor) => {
    setEditado((prev) => ({ ...prev, [campo]: valor }));
  };

  const salvarAlteracoes = () => {
    const lista = JSON.parse(localStorage.getItem("produtos") || "[]");
    const novaLista = lista.map((p) =>
      p.nomeComercial === produto.nomeComercial ? editado : p
    );
    localStorage.setItem("produtos", JSON.stringify(novaLista));
    window.dispatchEvent(new Event("produtosAtualizados"));
    onSalvar();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = camposRef.current[index + 1];
      if (next) next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = camposRef.current[index - 1];
      if (prev) prev.focus();
    }
  };

  return (
    <div style={estilos.overlay}>
      <motion.div
        style={estilos.modal}
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
      >
        <h2 style={estilos.titulo}>✏️ Editar Produto</h2>

        <div>
          <div style={estilos.campo}>
            <label>Nome Comercial</label>
            <input
              ref={(el) => (camposRef.current[0] = el)}
              value={editado.nomeComercial}
              onChange={(e) => atualizar("nomeComercial", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 0)}
              style={estilos.input}
            />
          </div>

          <div style={estilos.campo}>
            <label>Categoria</label>
            <Select
              options={categorias}
              value={categorias.find((c) => c.value === editado.categoria)}
              onChange={(opcao) => atualizar("categoria", opcao?.value || "")}
              placeholder="Selecione a categoria"
              styles={{
                control: (base) => ({
                  ...base,
                  marginTop: "0.3rem",
                  borderRadius: "6px",
                  fontSize: "14px",
                }),
              }}
            />
          </div>

          {[
            ["Quantidade", "quantidade", "number"],
            ["Volume", "volume", "number"],
            ["Valor Total", "valorTotal", "number"],
            ["Validade", "validade", "date"],
          ].map(([label, campo, tipo], i) => (
            <div key={campo} style={estilos.campo}>
              <label>{label}</label>
              <input
                ref={(el) => (camposRef.current[i + 1] = el)}
                type={tipo}
                value={editado[campo] || ""}
                onChange={(e) => atualizar(campo, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, i + 1)}
                style={estilos.input}
              />
            </div>
          ))}
        </div>

        <div style={estilos.botoes}>
          <button onClick={onFechar} style={estilos.btnCancelar}>
            Cancelar
          </button>
          <button onClick={salvarAlteracoes} style={estilos.btnSalvar}>
            Salvar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const estilos = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 5px 25px rgba(0,0,0,0.3)",
  },
  titulo: {
    fontSize: "1.5rem",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  campo: {
    marginBottom: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    marginTop: "0.3rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  botoes: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "2rem",
    gap: "1rem",
  },
  btnCancelar: {
    backgroundColor: "#ccc",
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  btnSalvar: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
