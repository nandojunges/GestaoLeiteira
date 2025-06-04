import React, { useState, useEffect } from "react";
import { adicionarInfoMastite, carregarHistoricoMastite } from "./utilsMastite";

export default function AbaTratamentoMastite({ vaca }) {
  const [dataInicio, setDataInicio] = useState("");
  const [antibiotico, setAntibiotico] = useState("");
  const [via, setVia] = useState("");
  const [duracao, setDuracao] = useState("");
  const [aine, setAine] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    const historico = carregarHistoricoMastite(vaca.numero);
    const ultDx = historico.diagnostico?.slice(-1)[0];

    if (ultDx?.sugestao) {
      setAntibiotico(ultDx.sugestao.antibiotico || "");
      setVia(ultDx.sugestao.via || "");
      setDuracao(ultDx.sugestao.duracao || "");
      setAine(ultDx.sugestao.aine || "");
    }
  }, [vaca]);

  const handleSalvar = () => {
    if (!dataInicio || !antibiotico || !via || !duracao) {
      alert("Preencha todos os campos obrigatórios antes de salvar.");
      return;
    }

    const tratamento = {
      dataInicio,
      antibiotico,
      via,
      duracao,
      aine,
      observacoes
    };

    adicionarInfoMastite(vaca.numero, "tratamento", tratamento);
    alert("💾 Tratamento registrado com sucesso!");
  };

  const input = {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    fontSize: "0.9rem",
    background: "white"
  };

  const label = {
    display: "block",
    fontWeight: 500,
    fontSize: "0.9rem",
    marginBottom: "0.3rem"
  };

  return (
    <div style={{ padding: "1.5rem", fontFamily: "Poppins, sans-serif" }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1.2rem" }}>
        💊 Registro de Tratamento de Mastite
      </h3>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Data de início:</label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={input} />
        </div>

        <div style={{ flex: 1 }}>
          <label style={label}>Antibiótico:</label>
          <input type="text" value={antibiotico} onChange={(e) => setAntibiotico(e.target.value)} style={input} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Via de administração:</label>
          <select value={via} onChange={(e) => setVia(e.target.value)} style={input}>
            <option value="">Selecione</option>
            <option value="IMM">Intra-Mamária (IMM)</option>
            <option value="Sistêmico">Sistêmico</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={label}>Duração (dias):</label>
          <input type="text" value={duracao} onChange={(e) => setDuracao(e.target.value)} style={input} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <label style={label}>AINE utilizado:</label>
          <input type="text" value={aine} onChange={(e) => setAine(e.target.value)} style={input} />
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={label}>Observações:</label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          style={{ ...input, minHeight: "80px" }}
          placeholder="Observações gerais, tetos afetados, resposta clínica etc."
        />
      </div>

      <div style={{ textAlign: "right", marginTop: "1rem" }}>
        <button
          onClick={handleSalvar}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          💾 Salvar Tratamento
        </button>
      </div>
    </div>
  );
}
