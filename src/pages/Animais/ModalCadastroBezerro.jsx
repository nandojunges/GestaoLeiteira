// ModalCadastroBezerro.jsx COMPLETO COM MENSAGENS EDUCACIONAIS E CORREÇÃO DE ERRO
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import "../../styles/botoes.css";

export default function ModalCadastroBezerro({ vaca, onFechar }) {
  const [tipoNascimento, setTipoNascimento] = useState("Femea");
  const [bezerros, setBezerros] = useState([]);
  const [pelagens, setPelagens] = useState([]);
  const [novaPelagem, setNovaPelagem] = useState("");
  const [mostrarCampoPelagem, setMostrarCampoPelagem] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    const salvas = JSON.parse(localStorage.getItem("pelagens") || "[]");
    setPelagens(salvas);
    const esc = (e) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onFechar]);

  const gerarBezerros = (tipo) => {
    const todosAnimais = JSON.parse(localStorage.getItem("animais") || "[]");
    const todosBezerros = JSON.parse(localStorage.getItem("bezerros") || "[]");
    const todosNumeros = [...todosAnimais, ...todosBezerros].map(a => Number(a.numero) || 0);
    const maiorNumero = todosNumeros.length > 0 ? Math.max(...todosNumeros) : 0;

    const novo = {
      sexo: tipo === "Macho" || tipo === "Femea" ? tipo : "",
      peso: "",
      pelagem: "",
      colostro: "Sim",
      origemColostro: "Mãe",
      brix: "",
      horaParto: "",
      horaColostro: "",
      ocorrencia: "",
      observacoes: ""
    };

    if (tipo === "Gemeos") {
      return [
        { ...novo, numero: maiorNumero + 1 },
        { ...novo, numero: maiorNumero + 2 }
      ];
    } else {
      return [{ ...novo, numero: maiorNumero + 1 }];
    }
  };

  useEffect(() => {
    if (tipoNascimento) {
      setBezerros(gerarBezerros(tipoNascimento));
    }
  }, [tipoNascimento]);

  const salvarPelagem = () => {
    if (!novaPelagem.trim()) return;
    const atualizadas = [...pelagens, novaPelagem];
    setPelagens(atualizadas);
    localStorage.setItem("pelagens", JSON.stringify(atualizadas));
    setNovaPelagem("");
    setMostrarCampoPelagem(false);
  };

  const atualizar = (i, campo, valor) => {
    const copia = [...bezerros];
    copia[i][campo] = valor;
    setBezerros(copia);
  };

  const salvar = () => {
    const salvos = JSON.parse(localStorage.getItem("bezerros") || "[]");
    const novos = bezerros.map((b) => ({
      ...b,
      mae: vaca.numero,
      nascimento: new Date().toLocaleDateString("pt-BR"),
    }));
    localStorage.setItem("bezerros", JSON.stringify([...salvos, ...novos]));
    onFechar();
  };

  const gerarMensagemColostro = (h1, h2) => {
    if (!h1 || !h2 || !h1.includes(":") || !h2.includes(":")) return null;
    const [a, b] = h1.split(":").map(Number);
    const [c, d] = h2.split(":").map(Number);
    if ([a, b, c, d].some(isNaN)) return null;
    const minutos = c * 60 + d - (a * 60 + b);
    if (minutos < 0) return null;
    if (minutos <= 120) {
      return "✅ Excelente! O colostro foi fornecido até 2 horas após o parto. Isso garante alta absorção de imunoglobulinas e proteção ideal contra infecções. Administre cerca de 10% do peso corporal em colostro (ex: 4L para 40kg) preferencialmente em uma ou duas doses nas primeiras 6 horas.";
    }
    if (minutos <= 360) {
      return "⚠️ Atenção: colostro fornecido entre 2h e 6h após o parto. Ainda pode oferecer imunidade, mas a eficiência de absorção já está diminuindo. Garanta um colostro de alta qualidade (BRIX ≥22%) e bom volume.";
    }
    return "❌ Risco de falha de transferência de imunidade! O colostro foi fornecido após 6 horas do parto, quando a capacidade de absorção intestinal do bezerro está praticamente encerrada. Reforce a higiene e considere uso de colostro enriquecido ou substitutos comerciais.";
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = refs.current[index + 1];
      if (next) next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = refs.current[index - 1];
      if (prev) prev.focus();
    }
  };

  const selectPadrao = (options, value, onChange, index) => (
    <Select
      options={options.map((v) => ({ value: v, label: v }))}
      value={value ? { value, label: value } : null}
      onChange={(opt) => onChange(opt?.value || "")}
      styles={{ control: (base) => ({ ...base, height: 44, borderRadius: 10 }) }}
      placeholder="Selecione..."
      onKeyDown={(e) => handleKeyDown(e, index)}
    />
  );

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={topo}>🐮 Cadastrar Bezerro(s) da Vaca {vaca.numero}</div>
        <div style={corpo}>
          <label>Tipo de Nascimento</label>
          {selectPadrao(["Macho", "Femea", "Gemeos"], tipoNascimento, setTipoNascimento, 0)}

          {bezerros.map((b, i) => (
            <div key={i} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "0.5rem", marginTop: "1rem" }}>
              <strong>Bezerro {i + 1} – Número {b.numero}</strong>
              <div style={grid}>
                <div>
                  <label>Sexo</label>
                  {selectPadrao(["Macho", "Femea"], b.sexo, (v) => atualizar(i, "sexo", v), 1)}
                </div>
                <div>
                  <label>Peso ao nascer (kg)</label>
                  <input type="number" value={b.peso} onChange={(e) => atualizar(i, "peso", e.target.value)} style={input} />
                </div>
                <div>
                  <label>Pelagem</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {selectPadrao(pelagens, b.pelagem, (v) => atualizar(i, "pelagem", v), 3)}
                    <button className="botao-acao pequeno" onClick={() => setMostrarCampoPelagem(true)}>＋</button>
                  </div>
                  {mostrarCampoPelagem && (
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                      <input value={novaPelagem} onChange={(e) => setNovaPelagem(e.target.value)} style={input} placeholder="Nova pelagem" />
                      <button onClick={salvarPelagem} className="botao-acao pequeno">Salvar</button>
                    </div>
                  )}
                </div>
                <div>
                  <label>Recebeu colostro?</label>
                  {selectPadrao(["Sim", "Não"], b.colostro, (v) => atualizar(i, "colostro", v), 5)}
                </div>

                {b.colostro === "Sim" && (
                  <>
                    <div>
                      <label>Origem do colostro</label>
                      {selectPadrao(["Mãe", "Banco", "Enriquecido"], b.origemColostro, (v) => atualizar(i, "origemColostro", v), 6)}
                    </div>
                    {b.origemColostro !== "Mãe" && (
                      <div>
                        <label>BRIX do colostro (%)</label>
                        <input type="number" value={b.brix} onChange={(e) => atualizar(i, "brix", e.target.value)} style={input} />
                      </div>
                    )}
                    <div>
                      <label>Horário do parto</label>
                      <input type="time" value={b.horaParto} onChange={(e) => atualizar(i, "horaParto", e.target.value)} style={input} />
                    </div>
                    <div>
                      <label>Horário da colostragem</label>
                      <input type="time" value={b.horaColostro} onChange={(e) => atualizar(i, "horaColostro", e.target.value)} style={input} />
                      {gerarMensagemColostro(b.horaParto, b.horaColostro) && (
                        <div style={{ fontSize: "0.85rem", color: "#4b5563", marginTop: "0.3rem" }}>
                          ⏱ {gerarMensagemColostro(b.horaParto, b.horaColostro)}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div style={{ gridColumn: "1 / -1" }}>
                  <label>Ocorrência ao nascer</label>
                  {selectPadrao(["Sem ocorrência", "Fraco ao nascer", "Não respirava", "Lesão visível", "Problema locomotor", "Outros"], b.ocorrencia, v => atualizar(i, "ocorrencia", v))}
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label>Observações</label>
                  <textarea rows={3} value={b.observacoes} onChange={e => atualizar(i, "observacoes", e.target.value)} style={{ ...input, resize: "none", height: "80px" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem", gap: "1rem" }}>
          <button onClick={onFechar} className="botao-cancelar">Cancelar</button>
          <button onClick={salvar} className="botao-acao">💾 Salvar Bezerro(s)</button>
        </div>
      </div>
    </div>
  );
}

const overlay = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const modal = { background: "#fff", borderRadius: "1rem", width: "880px", maxHeight: "95vh", overflowY: "auto", display: "flex", flexDirection: "column", fontFamily: "Poppins, sans-serif" };
const topo = { background: "#1e40af", color: "white", padding: "1rem 1.5rem", fontWeight: "bold", fontSize: "1.1rem", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" };
const corpo = { padding: "1.5rem" };
const input = { width: "100%", height: "44px", padding: "0.75rem", fontSize: "0.95rem", borderRadius: "0.6rem", border: "1px solid #ccc", boxSizing: "border-box", marginTop: "0.5rem", marginBottom: "0.5rem" };
const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "1.5rem", rowGap: "1.2rem", marginTop: "1rem" };
