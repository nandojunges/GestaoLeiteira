import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import "../../styles/botoes.css";
import ModalCadastroBezerro from "./ModalCadastroBezerro";

export default function AcaoParto({ vaca, onFechar }) {
  const [dataParto, setDataParto] = useState("");
  const [facilidade, setFacilidade] = useState(null);
  const [retencaoPlacenta, setRetencaoPlacenta] = useState(null);
  const [drench, setDrench] = useState(null);
  const [antiInflamatorio, setAntiInflamatorio] = useState(null);
  const [principioAtivo, setPrincipioAtivo] = useState(null);
  const [dose, setDose] = useState("");
  const [temperatura, setTemperatura] = useState("");
  const [brix, setBrix] = useState("");
  const [brixNaoMedido, setBrixNaoMedido] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [principiosDisponiveis, setPrincipiosDisponiveis] = useState([]);
  const [novoPrincipio, setNovoPrincipio] = useState("");
  const [mostrarNovoPrincipio, setMostrarNovoPrincipio] = useState(false);
  const [maeSalva, setMaeSalva] = useState(false);
  const [mostrarBezerro, setMostrarBezerro] = useState(false);
  const [erroFormulario, setErroFormulario] = useState(false);

  const camposRef = useRef([]);
  const addCampoRef = (el) => el && !camposRef.current.includes(el) && camposRef.current.push(el);

  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem("principios") || "[]");
    setPrincipiosDisponiveis(salvos.map((p) => ({ label: p, value: p })));

    const keyHandler = (e) => {
      if (e.key === "Escape") return onFechar();

      const indexAtual = camposRef.current.findIndex((el) => el === document.activeElement);
      if (indexAtual !== -1) {
        if (e.key === "Enter" || e.key === "ArrowDown") {
          e.preventDefault();
          const next = camposRef.current[indexAtual + 1];
          next?.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = camposRef.current[indexAtual - 1];
          prev?.focus();
        }
      }
    };

    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [onFechar]);

  const formatarData = (valor) => {
    const limpo = valor.replace(/\D/g, "").slice(0, 8);
    const dia = limpo.slice(0, 2);
    const mes = limpo.slice(2, 4);
    const ano = limpo.slice(4, 8);
    return [dia, mes, ano].filter(Boolean).join("/");
  };

  const salvarNovoPrincipio = () => {
    if (!novoPrincipio.trim()) return;
    const atualizado = [...principiosDisponiveis, { label: novoPrincipio, value: novoPrincipio }];
    setPrincipiosDisponiveis(atualizado);
    setPrincipioAtivo({ label: novoPrincipio, value: novoPrincipio });
    localStorage.setItem("principios", JSON.stringify(atualizado.map(p => p.value)));
    setNovoPrincipio("");
    setMostrarNovoPrincipio(false);
  };

  const salvarMae = () => {
    if (!dataParto || !facilidade) return setErroFormulario(true);
    const dadosMae = {
      vaca,
      dataParto,
      facilidade: facilidade?.value || "",
      retencaoPlacenta: retencaoPlacenta?.value || "",
      drench: drench?.value || "",
      antiInflamatorio: antiInflamatorio?.value || "",
      principioAtivo: antiInflamatorio?.value === "Sim" ? principioAtivo?.value || "" : "",
      dose: antiInflamatorio?.value === "Sim" ? dose : "",
      temperatura,
      brix: brixNaoMedido ? "Não medido" : brix,
      observacoes,
    };
    localStorage.setItem("parto_" + vaca.numero, JSON.stringify(dadosMae));
    setMaeSalva(true);
    setErroFormulario(false);
  };

  const input = {
    width: "100%",
    height: "44px",
    padding: "0.75rem",
    fontSize: "0.95rem",
    borderRadius: "0.6rem",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
  };

  const customSelectStyle = {
    control: (base) => ({
      ...base,
      height: "44px",
      minHeight: "44px",
      borderRadius: "0.6rem",
      fontSize: "0.95rem",
      borderColor: "#ccc",
      boxShadow: "none",
      display: "flex",
      alignItems: "center",
    }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

  const labelEstilo = { marginBottom: "0.2rem", display: "inline-block" };

  return (
    <>
      <div style={modal}>
        <div style={caixa}>
          <div style={header}>🐄 Registrar Parto — {vaca.numero} / {vaca.brinco}</div>
          <div style={conteudo}>
            <div style={grid}>
              <div>
                <label style={labelEstilo}>Data do Parto *</label>
                <input
                  ref={addCampoRef}
                  value={dataParto}
                  onChange={(e) => setDataParto(formatarData(e.target.value))}
                  style={input}
                  placeholder="dd/mm/aaaa"
                />
              </div>
              <div>
                <label style={labelEstilo}>Facilidade do Parto *</label>
                <Select
                  options={["Sem auxílio", "Auxílio leve", "Auxílio moderado", "Auxílio intenso", "Cesárea", "Distocia grave"].map(v => ({ label: v, value: v }))}
                  value={facilidade}
                  onChange={setFacilidade}
                  styles={customSelectStyle}
                  placeholder="Selecione..."
                />
              </div>
              <div>
                <label style={labelEstilo}>Retenção de Placenta</label>
                <Select
                  options={["Sim", "Não"].map(v => ({ label: v, value: v }))}
                  value={retencaoPlacenta}
                  onChange={setRetencaoPlacenta}
                  styles={customSelectStyle}
                  placeholder="Selecione..."
                />
              </div>
              <div>
                <label style={labelEstilo}>Fornecido Drench?</label>
                <Select
                  options={["Sim", "Não"].map(v => ({ label: v, value: v }))}
                  value={drench}
                  onChange={setDrench}
                  styles={customSelectStyle}
                  placeholder="Selecione..."
                />
              </div>
              <div>
                <label style={labelEstilo}>Anti-inflamatório?</label>
                <Select
                  options={["Sim", "Não"].map(v => ({ label: v, value: v }))}
                  value={antiInflamatorio}
                  onChange={setAntiInflamatorio}
                  styles={customSelectStyle}
                  placeholder="Selecione..."
                />
              </div>
              <div>
                <label style={labelEstilo}>Temperatura (°C)</label>
                <input
                  ref={addCampoRef}
                  value={temperatura}
                  onChange={(e) => setTemperatura(e.target.value)}
                  style={input}
                  placeholder="Ex: 38,9 °C"
                />
              </div>

              {antiInflamatorio?.value === "Sim" && (
                <>
                  <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <Select
                      options={principiosDisponiveis}
                      value={principioAtivo}
                      onChange={setPrincipioAtivo}
                      styles={customSelectStyle}
                      placeholder="Selecione o princípio ativo"
                    />
                    <button
                      ref={addCampoRef}
                      onClick={() => setMostrarNovoPrincipio(!mostrarNovoPrincipio)}
                      className="botao-acao"
                    >＋</button>
                  </div>
                  {mostrarNovoPrincipio && (
                    <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        ref={addCampoRef}
                        value={novoPrincipio}
                        onChange={(e) => setNovoPrincipio(e.target.value)}
                        style={input}
                        placeholder="Novo princípio ativo"
                      />
                      <button ref={addCampoRef} onClick={salvarNovoPrincipio} className="botao-acao">Salvar</button>
                    </div>
                  )}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelEstilo}>Dose (mL)</label>
                    <input
                      ref={addCampoRef}
                      value={dose}
                      onChange={(e) => setDose(e.target.value)}
                      style={input}
                      placeholder="Ex: 10"
                    />
                  </div>
                </>
              )}
              <div>
                <label style={labelEstilo}>Brix do Colostro (%)</label>
                <input
                  ref={addCampoRef}
                  type="number"
                  disabled={brixNaoMedido}
                  value={brixNaoMedido ? "" : brix}
                  onChange={(e) => setBrix(e.target.value)}
                  placeholder="Ex: 22"
                  style={input}
                />
                <label style={{ fontSize: "0.9rem", display: "flex", alignItems: "center", marginTop: "0.3rem" }}>
                  <input
                    type="checkbox"
                    checked={brixNaoMedido}
                    onChange={() => setBrixNaoMedido(!brixNaoMedido)}
                    style={{ marginRight: "0.5rem" }}
                  />Não medido
                </label>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelEstilo}>Observações</label>
                <textarea
                  ref={addCampoRef}
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  style={{ ...input, resize: "none", height: "80px" }}
                />
              </div>

              {erroFormulario && (
                <div style={{ color: "red", fontWeight: 500, gridColumn: "1 / -1" }}>
                  ⚠️ Preencha os campos obrigatórios (data e facilidade do parto).
                </div>
              )}

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "1rem", flexWrap: "wrap" }}>
                <button ref={addCampoRef} onClick={onFechar} className="botao-cancelar">Cancelar</button>
                <button ref={addCampoRef} onClick={salvarMae} className="botao-acao">💾 Salvar Mãe</button>
                {maeSalva && (
                  <button ref={addCampoRef} onClick={() => setMostrarBezerro(true)} className="botao-acao">➕ Adicionar Bezerro</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {mostrarBezerro && <ModalCadastroBezerro vaca={vaca} onFechar={() => setMostrarBezerro(false)} />}
    </>
  );
}

const modal = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const caixa = { background: "#fff", borderRadius: "1rem", width: "880px", maxHeight: "95vh", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "Poppins, sans-serif" };
const header = { background: "#1e40af", color: "white", padding: "1rem 1.5rem", fontWeight: "bold", fontSize: "1.1rem", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" };
const conteudo = { padding: "1.5rem", overflowY: "auto" };
const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "2rem", rowGap: "1.5rem", alignItems: "center" };
