import React, { useEffect, useRef, useState } from "react";
import { inserirMedicamentoSecagemSQLite } from "../../utils/apiFuncoes.js";

export default function CadastrarMedicamento({ onFechar, onSalvar }) {
  const [nome, setNome] = useState("");
  const [principio, setPrincipio] = useState("");
  const [leite, setLeite] = useState("");
  const [carne, setCarne] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [erro, setErro] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
    const esc = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onFechar();
      }
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onFechar]);

  const handleEnter = (e, index) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      if (index === 4) return salvar();
      refs.current[index + 1]?.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    }
  };

  const salvar = async () => {
    if (!nome || !principio || !leite || !carne || !quantidade) {
      setErro(true);
      return;
    }
    await inserirMedicamentoSecagemSQLite({ nome, principio, leite, carne, quantidade });
    if (onSalvar) onSalvar(nome);
    onFechar();
  };

  const input = {
    width: "100%", padding: "0.6rem", fontSize: "0.95rem",
    borderRadius: "0.5rem", border: "1px solid #ccc", marginBottom: "0.8rem"
  };

  const botao = {
    padding: "0.5rem 1.2rem", borderRadius: "0.5rem",
    fontWeight: "500", cursor: "pointer", fontSize: "0.95rem"
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000
    }}>
      <div style={{
        background: "#fff", borderRadius: "1rem", width: "420px",
        fontFamily: "Poppins, sans-serif", boxShadow: "0 0 20px rgba(0,0,0,0.25)"
      }}>
        <div style={{
          background: "#1e40af", color: "#fff", padding: "1rem 1.5rem",
          borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem",
          fontSize: "1.1rem", fontWeight: "bold"
        }}>
          💊 Cadastrar Medicamento
        </div>

        <div style={{ padding: "1.5rem" }}>
          <input
            ref={el => refs.current[0] = el}
            placeholder="Nome Comercial"
            value={nome}
            onChange={e => setNome(e.target.value)}
            onKeyDown={e => handleEnter(e, 0)}
            style={input}
          />
          <input
            ref={el => refs.current[1] = el}
            placeholder="Princípio Ativo"
            value={principio}
            onChange={e => setPrincipio(e.target.value)}
            onKeyDown={e => handleEnter(e, 1)}
            style={input}
          />
          <input
            ref={el => refs.current[2] = el}
            placeholder="Carência para Leite"
            value={leite}
            onChange={e => setLeite(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => handleEnter(e, 2)}
            style={input}
          />
          <input
            ref={el => refs.current[3] = el}
            placeholder="Carência para Carne"
            value={carne}
            onChange={e => setCarne(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => handleEnter(e, 3)}
            style={input}
          />
          <input
            ref={el => refs.current[4] = el}
            type="number"
            min="1"
            placeholder="Quantidade de doses"
            value={quantidade}
            onChange={e => setQuantidade(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => handleEnter(e, 4)}
            style={input}
          />

          {erro && <div style={{ color: "red", marginBottom: "0.8rem" }}>⚠️ Preencha todos os campos.</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <button onClick={(e) => { e.stopPropagation(); onFechar(); }} style={{ ...botao, background: "#f3f4f6", border: "1px solid #ccc" }}>Cancelar</button>
            <button onClick={salvar} style={{ ...botao, background: "#10b981", color: "#fff", border: "none" }}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
