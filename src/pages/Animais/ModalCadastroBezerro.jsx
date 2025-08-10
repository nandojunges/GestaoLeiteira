import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import "../../styles/botoes.css";
import { buscarTodosAnimais, salvarAnimais } from "../../api";
import {
  buscarPelagensSQLite,
  inserirPelagemSQLite,
  buscarTodosBezerrosSQLite,
  salvarBezerrosSQLite,
  registrarPartoSQLite,
} from "../../utils/apiFuncoes.js";


export default function ModalCadastroBezerro({ vaca, dadosMae, onFechar }) {
  const [tipoNascimento, setTipoNascimento] = useState("Femea");
  const [bezerros, setBezerros] = useState([]);
  const [pelagens, setPelagens] = useState([]);
  const [novaPelagem, setNovaPelagem] = useState("");
  const [mostrarCampoPelagem, setMostrarCampoPelagem] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    (async () => {
      try {
        const salvas = await buscarPelagensSQLite();
        setPelagens(salvas || []);
      } catch (err) {
        console.error("Erro ao carregar pelagens:", err);
      }
    })();

    const keyHandler = (e) => {
      if (e.key === "Escape") return onFechar();
      const indexAtual = refs.current.findIndex((el) => el === document.activeElement);
      if (indexAtual !== -1) {
        if (e.key === "Enter" || e.key === "ArrowDown") {
          e.preventDefault();
          refs.current[indexAtual + 1]?.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          refs.current[indexAtual - 1]?.focus();
        }
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [onFechar]);

  const gerarBezerros = async (tipo) => {
    const todosAnimais = await buscarTodosAnimais();
    const todosBezerros = await buscarTodosBezerrosSQLite();
    const todosNumeros = [...(todosAnimais || []), ...(todosBezerros || [])].map(a => Number(a.numero) || 0);
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
    (async () => {
      if (tipoNascimento) setBezerros(await gerarBezerros(tipoNascimento));
    })();
  }, [tipoNascimento]);

  const salvarPelagem = async () => {
    if (!novaPelagem.trim()) return;
    const atualizadas = [...pelagens, novaPelagem];
    setPelagens(atualizadas);
    try {
      await inserirPelagemSQLite(novaPelagem);
    } catch (err) {
      console.error("Erro ao salvar pelagem:", err);
    }
    setNovaPelagem("");
    setMostrarCampoPelagem(false);
  };

  const atualizar = (i, campo, valor) => {
    const copia = [...bezerros];
    copia[i][campo] = valor;
    setBezerros(copia);
  };

  const salvar = async () => {
    try {
      const salvos = await buscarTodosBezerrosSQLite();
      const novos = bezerros.map((b) => ({
        ...b,
        mae: vaca.numero,
        nascimento: dadosMae.dataParto || new Date().toLocaleDateString("pt-BR"),
      }));
      await salvarBezerrosSQLite([...(salvos || []), ...novos]);

       const animais = await buscarTodosAnimais();
      const atualizados = animais.map((a) => {
        if (a.numero === vaca.numero) {
          a.status = "lactacao";
          a.ultimoParto = dadosMae.dataParto;
          if (dadosMae.brix && dadosMae.brix !== "Não medido") {
            a.brix = { valor: parseFloat(dadosMae.brix), data: dadosMae.dataParto };
          }
        }
        return a;
      });
      await salvarAnimais(atualizados);
      await registrarPartoSQLite({ numeroAnimal: vaca.numero, ...dadosMae });
      window.dispatchEvent(new Event("animaisAtualizados"));
      onFechar();
    } catch (err) {
      console.error("Erro ao salvar bezerro:", err);
      alert("Erro ao salvar bezerro");
    }
  };

  const gerarMensagemColostro = (h1, h2) => {
    if (!h1 || !h2 || !h1.includes(":") || !h2.includes(":")) return null;
    const [a, b] = h1.split(":").map(Number);
    const [c, d] = h2.split(":").map(Number);
    if ([a, b, c, d].some(isNaN)) return null;
    const minutos = c * 60 + d - (a * 60 + b);
    if (minutos < 0) return null;

    if (minutos <= 120) return "✅ Excelente! O colostro foi fornecido até 2 horas após o parto, momento em que a capacidade de absorção de anticorpos no intestino do bezerro está no auge. Essa prática garante que o animal receba a máxima quantidade de imunoglobulinas (principalmente IgG), fundamentais para a proteção contra agentes infecciosos nas primeiras semanas de vida. A colostragem precoce é considerada o padrão-ouro na saúde neonatal, pois reduz significativamente a mortalidade e melhora o desempenho futuro do bezerro.";
    if (minutos <= 360) return "⚠️ Atenção: o colostro foi fornecido entre 2 e 6 horas após o parto. Embora a absorção de anticorpos ainda ocorra, ela já está diminuída em comparação com as primeiras duas horas de vida. Esse atraso parcial compromete a eficiência da transferência de imunidade passiva, deixando o bezerro mais suscetível a infecções bacterianas e virais. Sempre que possível, deve-se priorizar a colostragem nas primeiras 2 horas, garantindo maior proteção e melhores taxas de ganho de peso.";
    return "❌ Cuidado! O fornecimento do colostro ocorreu mais de 6 horas após o parto, quando a capacidade intestinal do bezerro de absorver anticorpos está praticamente encerrada. Isso representa alto risco de falha na transferência de imunidade passiva, tornando o animal vulnerável a doenças como diarreia e pneumonia nas primeiras semanas de vida. Para minimizar esses riscos, recomenda-se sempre fornecer o colostro de alta qualidade (acima de 22% Brix) imediatamente após o nascimento, na quantidade correta (10% do peso vivo em até 6h) e preferencialmente nas 2 primeiras horas.";
  };

  const complementoColostro = "💡 A colostragem é o primeiro e mais importante manejo sanitário do bezerro. O fornecimento imediato e em volume adequado é essencial para garantir imunidade, saúde intestinal e bom desenvolvimento. Para resultados ideais, o colostro deve ser de qualidade (Brix acima de 22%), fornecido em no mínimo 4 litros ou 10% do peso vivo total e distribuído em até duas mamadas nas primeiras 6 horas de vida.";

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

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    }
  };

  const overlay = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
  const modal = { background: "#fff", borderRadius: "1rem", width: "880px", maxHeight: "95vh", overflowY: "auto", display: "flex", flexDirection: "column", fontFamily: "Poppins, sans-serif" };
  const topo = { background: "#1e40af", color: "white", padding: "1rem 1.5rem", fontWeight: "bold", fontSize: "1.1rem", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" };
  const corpo = { padding: "1.5rem" };
  const input = { width: "100%", height: "44px", padding: "0.75rem", fontSize: "0.95rem", borderRadius: "0.6rem", border: "1px solid #ccc", margin: "0.5rem 0", boxSizing: "border-box" };
  const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "1.5rem", rowGap: "1.2rem", marginTop: "1rem", alignItems: "center" };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={topo}>🐮 Cadastrar Bezerro(s) da Vaca {vaca.numero}</div>
        <div style={corpo}>
          <label>Tipo de Nascimento</label>
          {selectPadrao(["Macho", "Femea", "Gemeos"], tipoNascimento, setTipoNascimento, 0)}

          {bezerros.map((b, i) => (
            <div key={i} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "0.5rem", marginTop: "1rem" }}>
              <strong>Bezerro {i + 1} – Nº {b.numero}</strong>
              <div style={grid}>
                <div>
                  <label>Sexo</label>
                  {selectPadrao(["Macho", "Femea"], b.sexo, (v) => atualizar(i, "sexo", v), 1)}
                </div>
                <div>
                  <label>Peso ao nascer (kg)</label>
                  <input type="number" value={b.peso} onChange={(e) => atualizar(i, "peso", e.target.value)} style={input} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gridColumn: "1 / 2" }}>
                  <div style={{ flex: 1 }}>
                    <label>Pelagem</label>
                    {selectPadrao(pelagens, b.pelagem, (v) => atualizar(i, "pelagem", v), 3)}
                  </div>
                  <button className="botao-acao pequeno" onClick={() => setMostrarCampoPelagem(true)} style={{ height: "44px", marginLeft: "0.5rem" }}>＋</button>
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
          <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#374151" }}>
            {complementoColostro}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem", gap: "1rem" }}>
          <button onClick={onFechar} className="botao-cancelar">Cancelar</button>
          <button onClick={salvar} className="botao-acao">💾 Salvar Bezerro(s)</button>
        </div>
      </div>
    </div>
  );
}
