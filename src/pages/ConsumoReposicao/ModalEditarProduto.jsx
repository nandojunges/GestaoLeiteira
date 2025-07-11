import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import {
  db,
  buscarTodos,
  adicionarItem,
} from "../../utils/db";

export default function ModalEditarProduto({ produto, indice, onFechar, onSalvar }) {
  const [editado, setEditado] = useState(produto);
  const [categorias, setCategorias] = useState([]);
  const apresentacoesPorCategoria = {
    "Ração": ["Saco 40kg", "BigBag", "A granel"],
    "Hormônio": ["Frasco", "Ampola", "Dispositivo"],
    "Aditivos": ["Saco", "Pote", "Envelope"],
    "Antibiótico": ["Frasco", "Ampola"],
    "Antiparasitário": ["Frasco", "Ampola"],
    "AINE": ["Frasco", "Ampola"],
    "Vitaminas": ["Frasco", "Ampola"],
  };
  const [opcoesApresentacao, setOpcoesApresentacao] = useState([]);
  const [novaApresentacao, setNovaApresentacao] = useState("");
  const [mostrarNovaApresentacao, setMostrarNovaApresentacao] = useState(false);
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

    const carregarApresentacoes = async (cat) => {
      if (!cat) return;
      const base = apresentacoesPorCategoria[cat] || [];
      const salvas = await buscarTodos(`apresentacoes_${cat}`);
      setOpcoesApresentacao([...new Set([...base, ...salvas])]);
    };

    window.addEventListener("keydown", escFunction);
    carregarCategorias();
    carregarApresentacoes(produto.categoria);
    camposRef.current[0]?.focus();

    return () => window.removeEventListener("keydown", escFunction);
  }, [onFechar, produto.categoria]);

  useEffect(() => {
  const carregarApresentacoes = async () => {
    const cat = editado.categoria;
    if (cat) {
      const base = apresentacoesPorCategoria[cat] || [];
      const salvas = await buscarTodos(`apresentacoes_${cat}`);
      setOpcoesApresentacao([...new Set([...base, ...salvas])]);
    }
  };
  carregarApresentacoes();
}, [editado.categoria]);

  const atualizar = async (campo, valor) => {
    if (campo === "categoria") {
      let agrupamento = "";
      if (["Ração", "Aditivos", "Suplementos"].includes(valor)) agrupamento = "Cozinha";
      else if (["Detergentes", "Ácido", "Alcalino", "Sanitizante"].includes(valor)) agrupamento = "Higiene e Limpeza";
      else if (["Antibiótico", "Antiparasitário", "AINE", "AIE", "Hormônio", "Vitaminas"].includes(valor)) agrupamento = "Farmácia";
      else agrupamento = "Materiais Gerais";
      setEditado((prev) => ({ ...prev, categoria: valor, agrupamento }));
vepyr-codex/criar-aba-de-
o01rv-codex/criar-aba-de-estoque
      const base = apresentacoesPorCategoria[valor] || [];
      const salvas = await buscarTodos(`apresentacoes_${valor}`);
      setOpcoesApresentacao([...new Set([...base, ...salvas])]);
    } else {
      setEditado((prev) => ({ ...prev, [campo]: valor }));
    }
  };

  const salvarAlteracoes = async () => {
    const lista = await buscarTodos("produtos");
    if (indice != null && indice >= 0 && indice < lista.length) {
      const atualizado = { ...editado };
      if (atualizado.categoria === 'Hormônio' && atualizado.nomeHormônio) {
        atualizado.principioAtivo = atualizado.nomeHormônio;
      }
      lista[indice] = atualizado;
    }
    await adicionarItem("produtos", lista);
    window.dispatchEvent(new Event("produtosAtualizados"));
    window.dispatchEvent(new Event("estoqueAtualizado"));
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
        <div style={estilos.cabecalho}>Editar Produto</div>

        <div style={estilos.conteudo}>
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

          <div style={estilos.campo}>
            <label>Apresentação</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Select
                options={opcoesApresentacao.map((a) => ({ value: a, label: a }))}
                value={editado.apresentacao ? { value: editado.apresentacao, label: editado.apresentacao } : null}
                onChange={(op) => atualizar("apresentacao", op?.value || "")}
                placeholder="Selecione..."
                styles={{
                  control: (base) => ({
                    ...base,
                    marginTop: "0.3rem",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }),
                }}
              />
              <button
                onClick={() => setMostrarNovaApresentacao(!mostrarNovaApresentacao)}
                style={{ backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", padding: "0.4rem 0.8rem", fontWeight: "bold", cursor: "pointer" }}
              >
                +
              </button>
            </div>
            {mostrarNovaApresentacao && (
              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Nova apresentação"
                  value={novaApresentacao}
                  onChange={(e) => setNovaApresentacao(e.target.value)}
                  style={estilos.input}
                />
                <button
                  onClick={async () => {
                    if (novaApresentacao.trim() !== "") {
                      const atualizadas = [...opcoesApresentacao, novaApresentacao];
                      setOpcoesApresentacao(atualizadas);
                      await adicionarItem(`apresentacoes_${editado.categoria}`, atualizadas);
                      setEditado((prev) => ({ ...prev, apresentacao: novaApresentacao }));
                      setNovaApresentacao("");
                      setMostrarNovaApresentacao(false);
                    }
                  }}
                  style={{ backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "8px", padding: "0.4rem 0.8rem", fontWeight: "bold", cursor: "pointer" }}
                >
                  Salvar
                </button>
              </div>
            )}
          </div>

          <div style={estilos.campo}>
            <label>Quantidade</label>
            <input
              ref={(el) => (camposRef.current[1] = el)}
              type="number"
              value={editado.quantidade || ""}
              onChange={(e) => atualizar("quantidade", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 1)}
              style={estilos.input}
            />
          </div>
          <div style={estilos.campo}>
            <label>Volume</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                ref={(el) => (camposRef.current[2] = el)}
                type="number"
                value={editado.volume || ""}
                onChange={(e) => atualizar("volume", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                style={{ ...estilos.input, flex: 1 }}
              />
              <select
                value={editado.volumeUnidade || "mL"}
                onChange={(e) => atualizar("volumeUnidade", e.target.value)}
                style={{ ...estilos.input, width: "90px" }}
              >
                <option value="mL">mL</option>
                <option value="litros">litros</option>
              </select>
            </div>
          </div>
          <div style={estilos.campo}>
            <label>Valor Total</label>
            <input
              ref={(el) => (camposRef.current[3] = el)}
              type="number"
              value={editado.valorTotal || ""}
              onChange={(e) => atualizar("valorTotal", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 3)}
              style={estilos.input}
            />
          </div>
          <div style={estilos.campo}>
            <label>Validade</label>
            <input
              ref={(el) => (camposRef.current[4] = el)}
              type="date"
              value={editado.validade || ""}
              onChange={(e) => atualizar("validade", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 4)}
              style={estilos.input}
            />
          </div>
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
    borderRadius: "16px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    boxShadow: "0 5px 25px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  cabecalho: {
    backgroundColor: "#1d4ed8",
    color: "white",
    textAlign: "center",
    padding: "0.75rem 1rem",
    fontSize: "1.25rem",
    fontWeight: "bold",
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
  },
  conteudo: {
    padding: "2rem",
    flex: "1 1 auto",
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
