import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import {
  db,
  buscarTodos,
  adicionarItem,
} from "../../utils/db";

export default function ModalCadastroManejoSanitario({ onFechar, onSalvar, manejo = null, indice = null }) {
  const [dados, setDados] = useState({
    categoria: manejo?.categoria || "",
    tipo: manejo?.tipo || "",
    produto: manejo?.produto || null,
    frequencia: manejo?.frequencia || "",
    idade: manejo?.idade || "",
    via: manejo?.via || "",
    dose: manejo?.dose || "",
    dataInicial: manejo?.dataInicial || ""
  });
  const [produtos, setProdutos] = useState([]);
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
    const esc = (e) => e.key === "Escape" && onFechar?.();
    window.addEventListener("keydown", esc);
    (async () => {
      const lista = await buscarTodos("produtos");
      const filtrados = (lista || []).filter(
        (p) => p && p.agrupamento === "Farmácia"
      );
      setProdutos(filtrados.map((p) => ({ value: p.nomeComercial, label: p.nomeComercial })));
    })();
    return () => window.removeEventListener("keydown", esc);
  }, [onFechar]);

  const atualizar = (campo, valor) => setDados(prev => ({ ...prev, [campo]: valor }));

  const salvar = async () => {
    if (!dados.categoria || !dados.tipo || !dados.produto || !dados.dose) {
      alert("Preencha os campos obrigatórios.");
      return;
    }
    const lista = await buscarTodos("manejosSanitarios");
    const registro = { ...dados };
    if (dados.dataInicial) {
      const dias = parseInt(dados.frequencia);
      if (!isNaN(dias)) {
        const d = new Date(dados.dataInicial);
        d.setDate(d.getDate() + dias);
        registro.proximaAplicacao = d.toISOString().substring(0, 10);
      } else {
        registro.proximaAplicacao = dados.dataInicial;
      }
    }
    if (indice != null) {
      lista[indice] = registro;
    } else {
      lista.push(registro);
    }
    await adicionarItem("manejosSanitarios", lista);
    window.dispatchEvent(new Event("manejosSanitariosAtualizados"));
    onSalvar?.(registro, indice);
  };

  const CATEGORIAS = ["Bezerra", "Novilha", "Vaca em lactação", "Vaca seca", "Todo plantel"];
  const TIPOS = ["Vacina", "Vermífugo", "Vitamina", "Antiparasitário", "Preventivo"];
  const VIAS = ["Subcutânea", "Oral", "Intramuscular"];

  const input = () => ({
    padding: "0.6rem",
    border: "1px solid #ccc",
    borderRadius: "0.5rem",
    width: "100%",
    fontSize: "0.95rem"
  });

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>+ Cadastro de Manejo Sanitário</div>
        <div style={conteudo}>
          <div>
            <label>Categoria do Animal *</label>
            <Select
              options={CATEGORIAS.map(c => ({ value: c, label: c }))}
              value={dados.categoria ? { value: dados.categoria, label: dados.categoria } : null}
              onChange={op => atualizar("categoria", op?.value || "")}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione..."
            />
          </div>
          <div>
            <label>Tipo de Manejo *</label>
            <Select
              options={TIPOS.map(t => ({ value: t, label: t }))}
              value={dados.tipo ? { value: dados.tipo, label: dados.tipo } : null}
              onChange={op => atualizar("tipo", op?.value || "")}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione..."
            />
          </div>
          <div>
            <label>Produto / Princípio Ativo *</label>
            <Select
              options={produtos}
              value={dados.produto ? { value: dados.produto, label: dados.produto } : null}
              onChange={op => atualizar("produto", op?.value || null)}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione..."
            />
          </div>
          <div>
            <label>Frequência / Intervalo</label>
            <input
              value={dados.frequencia}
              onChange={e => atualizar("frequencia", e.target.value)}
              style={input()}
            />
          </div>
          <div>
            <label>Idade de Aplicação</label>
            <input
              value={dados.idade}
              onChange={e => atualizar("idade", e.target.value)}
              placeholder="Ex: 60 dias"
              style={input()}
            />
          </div>
          <div>
            <label>Via de Administração</label>
            <Select
              options={VIAS.map(v => ({ value: v, label: v }))}
              value={dados.via ? { value: dados.via, label: dados.via } : null}
              onChange={op => atualizar("via", op?.value || "")}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione..."
            />
          </div>
          <div>
            <label>Dose por animal (mL) *</label>
            <input
              type="number"
              value={dados.dose}
              onChange={e => atualizar("dose", e.target.value)}
              style={{ ...input(), width: "120px" }}
            />
          </div>
          <div>
            <label>Data Inicial</label>
            <input
              type="date"
              value={dados.dataInicial}
              onChange={e => atualizar("dataInicial", e.target.value)}
              style={input()}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
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
  zIndex: 9999
};

const modal = {
  background: "#fff",
  borderRadius: "1rem",
  width: "480px",
  maxHeight: "90vh",
  overflowY: "auto",
  fontFamily: "Poppins, sans-serif",
  display: "flex",
  flexDirection: "column"
};

const header = {
  background: "#1e40af",
  color: "white",
  padding: "1rem 1.5rem",
  fontWeight: "bold",
  fontSize: "1.1rem",
  borderTopLeftRadius: "1rem",
  borderTopRightRadius: "1rem",
  textAlign: "center"
};

const conteudo = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const botaoCancelar = {
  background: "#f3f4f6",
  border: "1px solid #d1d5db",
  padding: "0.6rem 1.2rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "500"
};

const botaoConfirmar = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "0.6rem 1.4rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "600"
};
