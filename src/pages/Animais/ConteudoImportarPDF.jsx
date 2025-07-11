import React, { useState } from "react";
import * as XLSX from "xlsx";
import { buscarTodosAnimais, salvarAnimais } from "../../sqlite/animais";

export default function ImportarDados() {
  const [dados, setDados] = useState([]);
  const [arquivoNome, setArquivoNome] = useState("");

  const colunasObrigatorias = ["brinco", "nascimento", "raça"];

  const handleArquivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const nome = file.name;
    setArquivoNome(nome);

    const ext = nome.split(".").pop().toLowerCase();

    if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const aba = workbook.SheetNames[0];
        const planilha = workbook.Sheets[aba];
        const json = XLSX.utils.sheet_to_json(planilha, { header: 1 });
        const cabecalho = json[0].map((c) => c.toString().trim().toLowerCase());
        const linhas = json.slice(1);
        const estruturado = linhas.map((linha, i) => {
          const obj = { id: Date.now() + i };
          cabecalho.forEach((col, j) => {
            obj[col] = linha[j];
          });
          return obj;
        });
        setDados(estruturado);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("⚠️ Apenas arquivos .xlsx e .xls são aceitos no momento.");
    }
  };

  const limpar = () => {
    setDados([]);
    setArquivoNome("");
  };

  const salvar = async () => {
    const faltando = dados.some((d) =>
      colunasObrigatorias.some((col) => !d[col] || d[col].toString().trim() === "")
    );
    if (faltando) {
      alert("⚠️ Alguns registros estão incompletos. Corrija antes de salvar.");
      return;
    }
    const antigos = await buscarTodosAnimais();
    const atualizados = [...(antigos || []), ...dados];
    await salvarAnimais(atualizados);
    alert("✅ Dados salvos com sucesso!");
    limpar();
  };

  const editarCelula = (id, campo, valor) => {
    const atualizados = dados.map((d) =>
      d.id === id ? { ...d, [campo]: valor } : d
    );
    setDados(atualizados);
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem", fontFamily: "Poppins, sans-serif" }}>
      <label htmlFor="file" style={botaoImportar()}>📎 Importar Planilha Excel</label>
      <input id="file" type="file" accept=".xlsx,.xls" onChange={handleArquivo} style={{ display: "none" }} />
      {arquivoNome && <div style={{ marginTop: "0.5rem", fontWeight: "500" }}>{arquivoNome}</div>}

      {dados.length > 0 && (
        <>
          <div style={{ marginTop: "2rem", overflowX: "auto", backgroundColor: "#fff", borderRadius: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead style={{ backgroundColor: "#eff6ff" }}>
                <tr>
                  {Object.keys(dados[0]).map((key) =>
                    key !== "id" ? (
                      <th key={key} style={thStyle}>{key.toUpperCase()}</th>
                    ) : null
                  )}
                </tr>
              </thead>
              <tbody>
                {dados.map((linha) => (
                  <tr key={linha.id}>
                    {Object.keys(linha).map((col) =>
                      col !== "id" ? (
                        <td key={col} style={tdStyle}>
                          <input
                            value={linha[col] || ""}
                            onChange={(e) => editarCelula(linha.id, col, e.target.value)}
                            style={inputTabela()}
                          />
                        </td>
                      ) : null
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
            <button onClick={salvar} style={botaoVerde()}>💾 Salvar no sistema</button>
            <button onClick={limpar} style={botaoVermelho()}>🗑️ Limpar</button>
          </div>
        </>
      )}
    </div>
  );
}

// Estilos
const botaoImportar = () => ({
  display: "inline-block",
  backgroundColor: "#e0e7ff",
  color: "#1e3a8a",
  padding: "0.6rem 1.2rem",
  borderRadius: "9999px",
  fontWeight: "600",
  cursor: "pointer",
  border: "1px solid #c7d2fe",
});

const botaoVerde = () => ({
  backgroundColor: "#10b981",
  color: "#fff",
  padding: "0.6rem 1.5rem",
  borderRadius: "0.5rem",
  border: "none",
  fontWeight: "bold",
  fontSize: "1rem",
  cursor: "pointer",
});

const botaoVermelho = () => ({
  backgroundColor: "#ef4444",
  color: "#fff",
  padding: "0.6rem 1.5rem",
  borderRadius: "0.5rem",
  border: "none",
  fontWeight: "bold",
  fontSize: "1rem",
  cursor: "pointer",
});

const thStyle = {
  padding: "0.75rem",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const tdStyle = {
  padding: "0.5rem",
  borderBottom: "1px solid #eee",
};

const inputTabela = () => ({
  width: "100%",
  padding: "0.4rem",
  borderRadius: "0.4rem",
  border: "1px solid #ccc",
  fontSize: "0.85rem",
});
