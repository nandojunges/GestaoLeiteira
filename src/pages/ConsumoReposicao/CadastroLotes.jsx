import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import {
  db,
  buscarTodos,
  adicionarItem,
} from "../../utils/db";

export default function CadastroLotes({ onFechar, onSalvar }) {
  const [dados, setDados] = useState({
    nome: "",
    funcao: "",
    nivelProducao: "",
    tipoTratamento: "",
    motivoDescarte: "",
    descricao: "",
    ativo: true,
  });
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
    const esc = (e) => e.key === "Escape" && onFechar?.();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onFechar]);

  const funcoes = [
    "Lactação",
    "Tratamento",
    "Descarte",
    "Secagem",
    "Pré-parto",
    "Novilhas",
    "Outro",
  ];
  const niveis = ["Alta Produção", "Média Produção", "Baixa Produção"];
  const tratamentos = ["Mastite", "Pós-parto", "Outro"];
  const motivos = ["Produção baixa", "Lesão", "Problemas podais", "Outro"];

  const handleChange = (campo, valor) => {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  };

  const validar = () => {
    if (!dados.nome.trim()) return false;
    if (!dados.funcao) return false;
    if (dados.funcao === "Lactação" && !dados.nivelProducao) return false;
    if (dados.funcao === "Tratamento" && !dados.tipoTratamento) return false;
    if (dados.funcao === "Descarte" && !dados.motivoDescarte) return false;
    return true;
  };

  const salvar = async () => {
    if (!validar()) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    const lista = await buscarTodos("lotes");
    const atualizada = [...(lista || []), dados];
    await adicionarItem("lotes", atualizada);
    window.dispatchEvent(new Event("lotesAtualizados"));
    onSalvar?.(dados);
    onFechar?.();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>➕ Cadastro de Lotes</div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label>Nome</label>
            <input
              ref={(el) => (refs.current[0] = el)}
              value={dados.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              style={input()}
            />
          </div>
          <div>
            <label>Função do Lote *</label>
            <Select
              options={funcoes.map((f) => ({ value: f, label: f }))}
              value={dados.funcao ? { value: dados.funcao, label: dados.funcao } : null}
              onChange={(op) => handleChange("funcao", op?.value || "")}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione..."
            />
          </div>
          {dados.funcao === "Lactação" && (
            <div>
              <label>Nível Produtivo *</label>
              <Select
                options={niveis.map((n) => ({ value: n, label: n }))}
                value={dados.nivelProducao ? { value: dados.nivelProducao, label: dados.nivelProducao } : null}
                onChange={(op) => handleChange("nivelProducao", op?.value || "")}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Selecione..."
              />
            </div>
          )}
          {dados.funcao === "Tratamento" && (
            <div>
              <label>Tipo de Tratamento *</label>
              <Select
                options={tratamentos.map((t) => ({ value: t, label: t }))}
                value={dados.tipoTratamento ? { value: dados.tipoTratamento, label: dados.tipoTratamento } : null}
                onChange={(op) => handleChange("tipoTratamento", op?.value || "")}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Selecione..."
              />
            </div>
          )}
          {dados.funcao === "Descarte" && (
            <div>
              <label>Motivo do Descarte *</label>
              <Select
                options={motivos.map((m) => ({ value: m, label: m }))}
                value={dados.motivoDescarte ? { value: dados.motivoDescarte, label: dados.motivoDescarte } : null}
                onChange={(op) => handleChange("motivoDescarte", op?.value || "")}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Selecione..."
              />
            </div>
          )}
          <div>
            <label>Descrição</label>
            <textarea
              value={dados.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              style={{ ...input(), height: "80px" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "0.5rem" }}>
            <button onClick={onFechar} style={botaoCancelar}>Cancelar</button>
            <button onClick={salvar} style={botaoConfirmar}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  backgroundColor: "#fff",
  borderRadius: "1rem",
  width: "420px",
  maxHeight: "90vh",
  overflowY: "auto",
  fontFamily: "Poppins, sans-serif",
};

const header = {
  background: "#1e40af",
  color: "white",
  padding: "1rem 1.5rem",
  fontWeight: "bold",
  fontSize: "1.1rem",
  borderTopLeftRadius: "1rem",
  borderTopRightRadius: "1rem",
  textAlign: "center",
};

const input = () => ({
  width: "100%",
  padding: "0.6rem",
  fontSize: "0.95rem",
  borderRadius: "0.5rem",
  border: "1px solid #ccc",
});

const botaoCancelar = {
  background: "#f3f4f6",
  border: "1px solid #d1d5db",
  padding: "0.6rem 1.2rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "500",
};

const botaoConfirmar = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "0.6rem 1.4rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "600",
};
