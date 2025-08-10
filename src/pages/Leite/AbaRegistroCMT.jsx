import React, { useEffect, useState } from "react";
import "../../styles/botoes.css";
import { buscarTodosAnimais, salvarAnimais } from "../../api";
import { buscarTodos, adicionarItem } from"../../utils/apiFuncoes.js";

export default function AbaRegistroCMT({ vaca }) {
  if (!vaca) return <div style={{ padding: "1rem", color: "red" }}>Vaca não encontrada.</div>;

  const [dados, setDados] = useState({
    data: new Date().toISOString().substring(0, 10),
    operador: "",
    novoResponsavel: "",
    cmt: {
      TE: { resultado: "", observacao: "" },
      TD: { resultado: "", observacao: "" },
      PE: { resultado: "", observacao: "" },
      PD: { resultado: "", observacao: "" },
    },
  });

  const [responsaveisSalvos, setResponsaveisSalvos] = useState([]);
  const [mostrarNovoResp, setMostrarNovoResp] = useState(false);

  const coresResultado = {
    "0": "#10b981",
    "+": "#facc15",
    "++": "#f97316",
    "+++": "#ef4444"
  };

  useEffect(() => {
    (async () => {
      const r = await buscarTodos("responsaveisCMT");
      setResponsaveisSalvos(r.map((i) => i.nome || ""));
    })();
  }, []);

  // ⚠️ Carrega dados do CMT salvos ao mudar a data
  useEffect(() => {
   (async () => {
      const animais = await buscarTodosAnimais();
      const animal = animais.find((a) => a.numero === vaca.numero);
      if (!animal || !animal.cmt) return;

      const existente = animal.cmt.find((reg) => reg.data === dados.data);
      if (existente) {
        setDados((prev) => ({
          ...prev,
          operador: existente.operador || "",
          cmt: existente.cmt || prev.cmt,
        }));
      } else {
        setDados((prev) => ({
          ...prev,
          operador: "",
          cmt: {
            TE: { resultado: "", observacao: "" },
            TD: { resultado: "", observacao: "" },
            PE: { resultado: "", observacao: "" },
            PD: { resultado: "", observacao: "" },
          },
        }));
      }
    })();
  }, [dados.data, vaca.numero]);

  const handleChange = (quarto, campo, valor) => {
    setDados((prev) => ({
      ...prev,
      cmt: {
        ...prev.cmt,
        [quarto]: {
          ...prev.cmt[quarto],
          [campo]: valor,
        },
      },
    }));
  };

  const salvarNovoResponsavel = async () => {
    if (dados.novoResponsavel.trim()) {
      const atualizados = [...responsaveisSalvos, dados.novoResponsavel.trim()];
      setResponsaveisSalvos(atualizados);
      await adicionarItem(
        "responsaveisCMT",
        atualizados.map((nome, i) => ({ id: String(i), nome }))
      );
      setDados({
        ...dados,
        operador: dados.novoResponsavel.trim(),
        novoResponsavel: "",
      });
      setMostrarNovoResp(false);
    }
  };

  const salvar = async () => {
    const animais = await buscarTodosAnimais();
    const atualizados = animais.map((a) => {
      if (a.numero !== vaca.numero) return a;

      if (!a.cmt) a.cmt = [];

      const index = a.cmt.findIndex(r => r.data === dados.data);
      const registro = {
        data: dados.data,
        operador: dados.operador,
        cmt: dados.cmt
      };

      if (index !== -1) {
        a.cmt[index] = registro; // substitui o existente
      } else {
        a.cmt.push(registro); // adiciona novo
      }

      return a;
    });

     await salvarAnimais(atualizados);
    window.dispatchEvent(new Event("animaisAtualizados"));
    alert("💾 Registro de CMT salvo para a vaca " + vaca.numero);
  };

  const Quarto = ({ sigla, nome }) => (
    <div style={box}>
      <div
        style={{
          width: 24,
          height: 24,
          margin: "0 auto 0.75rem",
          borderRadius: "50%",
          backgroundColor: coresResultado[dados.cmt[sigla].resultado] || "#e2e8f0",
        }}
      ></div>
      <strong style={{ marginBottom: "0.5rem", display: "block" }}>{nome} ({sigla})</strong>
      <select
        value={dados.cmt[sigla].resultado}
        onChange={(e) => handleChange(sigla, "resultado", e.target.value)}
        style={{ ...input, marginBottom: "0.5rem" }}
      >
        <option value="">Selecione</option>
        <option value="0">Negativo</option>
        <option value="+">+</option>
        <option value="++">++</option>
        <option value="+++">+++</option>
      </select>
      <input
        placeholder="Observações"
        value={dados.cmt[sigla].observacao}
        onChange={(e) => handleChange(sigla, "observacao", e.target.value)}
        style={input}
      />
    </div>
  );

  return (
    <div style={{ padding: "1.5rem", fontFamily: "Poppins, sans-serif" }}>
      <h3 className="text-lg font-bold mb-4">
        📋 Registro CMT — {vaca.numero} / {vaca.brinco}
      </h3>

      <div style={linha}>
        <div style={{ flex: 1 }}>
          <label style={label}>Data do Teste</label>
          <input
            type="date"
            value={dados.data}
            onChange={(e) => setDados({ ...dados, data: e.target.value })}
            style={input}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={label}>Responsável</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              list="responsaveis"
              value={dados.operador}
              onChange={(e) => setDados({ ...dados, operador: e.target.value })}
              style={input}
            />
            <button
              onClick={() => setMostrarNovoResp(!mostrarNovoResp)}
              className="botao-acao"
            >
              ＋
            </button>
            <datalist id="responsaveis">
              {responsaveisSalvos.map((r, i) => (
                <option key={i} value={r} />
              ))}
            </datalist>
          </div>

          {mostrarNovoResp && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <input
                value={dados.novoResponsavel}
                onChange={(e) => setDados({ ...dados, novoResponsavel: e.target.value })}
                style={input}
                placeholder="Novo nome"
              />
              <button onClick={salvarNovoResponsavel} className="botao-acao">Salvar</button>
            </div>
          )}
        </div>
      </div>

      <div style={grid4}>
        <Quarto sigla="PE" nome="Posterior Esquerdo" />
        <Quarto sigla="PD" nome="Posterior Direito" />
        <Quarto sigla="TE" nome="Anterior Esquerdo" />
        <Quarto sigla="TD" nome="Anterior Direito" />
      </div>

      <div style={{ textAlign: "right", marginTop: "1rem" }}>
        <button onClick={salvar} className="botao-acao">💾 Salvar</button>
      </div>
    </div>
  );
}

// Estilos
const input = {
  width: "100%",
  padding: "0.5rem",
  borderRadius: "0.5rem",
  border: "1px solid #ccc",
  boxSizing: "border-box",
  display: "block",
  fontSize: "0.9rem"
};

const label = { display: "block", fontSize: "0.9rem", marginBottom: "0.25rem", fontWeight: 500 };

const grid4 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "1.5rem",
  marginTop: "1.5rem"
};

const box = {
  border: "1px solid #ddd",
  borderRadius: "1rem",
  padding: "1.2rem",
  textAlign: "center",
  boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  backgroundColor: "#f9f9f9"
};

const linha = {
  display: "flex",
  gap: "1.5rem",
  marginTop: "1rem",
  flexWrap: "wrap"
};
