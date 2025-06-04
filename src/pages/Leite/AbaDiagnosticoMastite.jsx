import React, { useState } from "react";
import Select from "react-select";
import { adicionarInfoMastite } from "./utilsMastite";
import GuiaMastite from "./GuiaMastite"; // ✅ novo modal explicativo

const agentesMastite = [
  "Staphylococcus aureus", "Streptococcus agalactiae", "Escherichia coli",
  "Klebsiella spp.", "Candida spp.", "Prototheca spp.", "Streptococcus uberis",
  "Streptococcus dysgalactiae", "Corynebacterium bovis", "Pseudomonas aeruginosa",
  "Mycoplasma spp.", "Serratia spp.", "Nocardia spp.", "Aspergillus spp."
];

const baseAntibioticos = [
  { nome: "Amoxicilina", classe: "Penicilina", via: "IMM" },
  { nome: "Cloxacilina", classe: "Penicilina resistente", via: "IMM" },
  { nome: "Cefquinoma", classe: "Cefalosporina 4ªG", via: "IMM" },
  { nome: "Ceftiofur", classe: "Cefalosporina 3ªG", via: "Sistêmico" },
  { nome: "Enrofloxacina", classe: "Fluoroquinolona", via: "Sistêmico" },
  { nome: "Tylosina", classe: "Macrolídeo", via: "Sistêmico" },
  { nome: "Florfenicol", classe: "Fenicol", via: "Sistêmico" },
  { nome: "Gentamicina", classe: "Aminoglicosídeo", via: "IMM" }
];

export default function AbaDiagnosticoMastite({ vaca }) {
  const [data, setData] = useState("");
  const [agentes, setAgentes] = useState([]);
  const [sensibilidade, setSensibilidade] = useState({});
  const [sugestao, setSugestao] = useState(null);
  const [mostrarGuia, setMostrarGuia] = useState(false); // ✅ controle do modal

  const toggleResultado = (nome) => {
    setSensibilidade((prev) => ({
      ...prev,
      [nome]:
        prev[nome] === "Sensível"
          ? "Resistente"
          : prev[nome] === "Resistente"
          ? ""
          : "Sensível"
    }));
  };

  const gerarSugestao = () => {
    const sensiveis = baseAntibioticos.filter(
      (ab) => sensibilidade[ab.nome] === "Sensível"
    );

    if (agentes.some((a) => a.includes("Candida") || a.includes("Prototheca") || a.includes("Aspergillus"))) {
      setSugestao({ erro: "⚠️ Tratamento antibiótico ineficaz para agentes fúngicos ou algais." });
      return;
    }

    const sugerido = sensiveis.length
      ? sensiveis.length === 1
        ? sensiveis[0]
        : {
            nome: sensiveis[0].nome + " + " + sensiveis[1].nome,
            classe: "Associação",
            via: "Sistêmico + IMM"
          }
      : null;

    setSugestao(
      sugerido
        ? {
            antibiotico: sugerido.nome,
            classe: sugerido.classe,
            via: sugerido.via,
            duracao: "5-7 dias",
            aine: "Meloxicam ou Flunixin"
          }
        : {
            erro: "Nenhum antibiótico sensível encontrado. Verifique os dados."
          }
    );
  };

  const salvarDiagnostico = () => {
    if (!data || agentes.length === 0) {
      alert("Preencha todos os campos antes de salvar.");
      return;
    }

    adicionarInfoMastite(vaca.numero, "diagnostico", {
      data,
      agentes,
      sensibilidade,
      sugestao
    });

    alert("✅ Diagnóstico salvo com sucesso para a vaca " + vaca.numero);
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
        🔬 Diagnóstico de Mastite
        <button
          title="Guia dos Agentes"
          onClick={() => setMostrarGuia(true)}
          style={{
            float: "right",
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer"
          }}
        >
          📖
        </button>
      </h3>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Data:</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            style={input}
          />
        </div>

        <div style={{ flex: 2 }}>
          <label style={label}>Agente(s) Identificado(s):</label>
          <Select
            isMulti
            options={agentesMastite.map((a) => ({ label: a, value: a }))}
            onChange={(selected) => setAgentes(selected.map((s) => s.value))}
            placeholder="Selecione um ou mais agentes..."
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                borderColor: "#ccc",
                padding: "2px"
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999
              })
            }}
          />
        </div>
      </div>

      <label style={{ ...label, marginTop: "1.2rem" }}>Teste de Sensibilidade:</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.8rem",
          marginBottom: "1.2rem"
        }}
      >
        {baseAntibioticos.map((ab) => (
          <button
            key={ab.nome}
            onClick={() => toggleResultado(ab.nome)}
            style={{
              padding: "0.6rem",
              borderRadius: "0.5rem",
              fontSize: "0.85rem",
              textAlign: "left",
              border: "1px solid",
              background:
                sensibilidade[ab.nome] === "Sensível"
                  ? "#dcfce7"
                  : sensibilidade[ab.nome] === "Resistente"
                  ? "#fee2e2"
                  : "#f1f5f9",
              borderColor:
                sensibilidade[ab.nome] === "Sensível"
                  ? "#16a34a"
                  : sensibilidade[ab.nome] === "Resistente"
                  ? "#ef4444"
                  : "#cbd5e1",
              transition: "0.2s ease",
              cursor: "pointer"
            }}
          >
            {ab.nome} — {sensibilidade[ab.nome] || "Sem resultado"}
          </button>
        ))}
      </div>

      <div style={{ textAlign: "left", marginTop: "1rem", marginBottom: "1rem" }}>
        <button
          onClick={gerarSugestao}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "0.8rem 2rem",
            borderRadius: "999px",
            fontSize: "1rem",
            fontWeight: "500",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
          }}
        >
          💡 Gerar Sugestão Inteligente
        </button>
      </div>

      {sugestao && (
        <div
          style={{
            marginTop: "1.5rem",
            background: "#f9fafb",
            padding: "1rem",
            borderRadius: "0.75rem",
            border: "1px solid #e5e7eb"
          }}
        >
          {sugestao.erro ? (
            <p style={{ color: "#dc2626", fontWeight: 600 }}>{sugestao.erro}</p>
          ) : (
            <>
              <p><strong>Antibiótico:</strong> {sugestao.antibiotico}</p>
              <p><strong>Classe:</strong> {sugestao.classe}</p>
              <p><strong>Via:</strong> {sugestao.via}</p>
              <p><strong>Duração:</strong> {sugestao.duracao}</p>
              <p><strong>AINE Recomendado:</strong> {sugestao.aine}</p>

              <button
                onClick={salvarDiagnostico}
                style={{
                  marginTop: "1rem",
                  backgroundColor: "#16a34a",
                  color: "white",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.95rem",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                💾 Salvar Diagnóstico
              </button>
            </>
          )}
        </div>
      )}

      {mostrarGuia && <GuiaMastite onFechar={() => setMostrarGuia(false)} />}
    </div>
  );
}
