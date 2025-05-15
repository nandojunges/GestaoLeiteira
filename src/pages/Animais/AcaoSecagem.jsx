import React, { useEffect, useRef, useState } from "react";
import CadastrarMedicamento from "./CadastrarMedicamento";
import RelatorioMedicamentos from "./RelatorioMedicamentos";
import { formatarDataDigitada } from "./utilsAnimais";
import "../../styles/botoes.css";

export default function AcaoSecagem({ vaca, onFechar, onAplicar }) {
  const [dataSecagem, setDataSecagem] = useState("");
  const [plano, setPlano] = useState("");
  const [principioAtivo, setPrincipioAtivo] = useState("");
  const [nomeComercial, setNomeComercial] = useState("");
  const [carenciaLeite, setCarenciaLeite] = useState("");
  const [carenciaCarne, setCarenciaCarne] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [responsaveisSalvos, setResponsaveisSalvos] = useState([]);
  const [mostrarCadastroResponsavel, setMostrarCadastroResponsavel] = useState(false);
  const [novoResponsavel, setNovoResponsavel] = useState("");

  const [medicamentosSalvos, setMedicamentosSalvos] = useState({});
  const [mostrarCadastroMedicamento, setMostrarCadastroMedicamento] = useState(false);
  const [mostrarRelatorioMedicamentos, setMostrarRelatorioMedicamentos] = useState(false);

  const [mostrarTabelaMedicamentos, setMostrarTabelaMedicamentos] = useState(false);
  const [mostrarTabelaResponsaveis, setMostrarTabelaResponsaveis] = useState(false);
  const [erroFormulario, setErroFormulario] = useState(false);

  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
    const esc = (e) => { if (e.key === "Escape") onFechar(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onFechar]);

  useEffect(() => {
    const r = JSON.parse(localStorage.getItem("responsaveisSecagem") || "[]");
    const m = JSON.parse(localStorage.getItem("medicamentosSecagem") || "{}");
    setResponsaveisSalvos(r);
    setMedicamentosSalvos(m);
  }, []);

  const salvarNovoResponsavel = () => {
    if (novoResponsavel && !responsaveisSalvos.includes(novoResponsavel)) {
      const atualizados = [...responsaveisSalvos, novoResponsavel];
      setResponsaveisSalvos(atualizados);
      localStorage.setItem("responsaveisSecagem", JSON.stringify(atualizados));
      setResponsavel(novoResponsavel);
    }
    setNovoResponsavel("");
    setMostrarCadastroResponsavel(false);
  };

  const selecionarMedicamento = (nome) => {
    setNomeComercial(nome);
    const med = medicamentosSalvos[nome];
    if (med) {
      setPrincipioAtivo(med.principio);
      setCarenciaLeite(med.leite);
      setCarenciaCarne(med.carne);
    }
    setMostrarTabelaMedicamentos(false);
  };

  const aplicar = () => {
    if (!dataSecagem || !plano || !principioAtivo || !nomeComercial || !carenciaLeite || !carenciaCarne || !responsavel) {
      setErroFormulario(true);
      return;
    }
    setErroFormulario(false);
    const dados = { vaca, dataSecagem, plano, principioAtivo, nomeComercial, carenciaLeite, carenciaCarne, responsavel, observacoes };
    localStorage.setItem("secagem_" + vaca.numero, JSON.stringify(dados));
    onAplicar(dados);
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>🐄 Aplicar Secagem — {vaca.numero} / {vaca.brinco}</div>
        <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={grid}>
            <div>
              <label>Data da Secagem *</label>
              <input
                value={dataSecagem}
                onChange={e => setDataSecagem(formatarDataDigitada(e.target.value))}
                style={input}
              />
            </div>
            <div>
              <label>Plano de Tratamento *</label>
              <input value={plano} onChange={e => setPlano(e.target.value)} style={input} />
            </div>

            <div style={{ gridColumn: "1 / -1", position: "relative" }}>
              <label>Nome Comercial *</label>
              <div style={linha}>
                <input
                  value={nomeComercial}
                  onChange={e => setNomeComercial(e.target.value)}
                  onFocus={() => setMostrarTabelaMedicamentos(true)}
                  onBlur={() => setTimeout(() => setMostrarTabelaMedicamentos(false), 200)}
                  style={{ ...input, flex: 1 }}
                />
                <button onClick={() => setMostrarCadastroMedicamento(true)} className="botao-acao">＋</button>
                <button onClick={() => setMostrarRelatorioMedicamentos(true)} className="botao-acao">🧾</button>
              </div>
              {mostrarTabelaMedicamentos && (
                <div style={tabelaSuspensa}>
                  {Object.keys(medicamentosSalvos)
                    .filter(nome => nome.toLowerCase().includes(nomeComercial.toLowerCase()))
                    .map((nome, i) => (
                      <div key={i} onMouseDown={() => selecionarMedicamento(nome)} style={linhaTabela}>{nome}</div>
                    ))}
                </div>
              )}
            </div>

            <div><label>Princípio Ativo *</label><input value={principioAtivo} onChange={e => setPrincipioAtivo(e.target.value)} style={input} /></div>
            <div><label>Carência Leite *</label><input value={carenciaLeite} onChange={e => setCarenciaLeite(e.target.value)} style={input} /></div>
            <div><label>Carência Carne *</label><input value={carenciaCarne} onChange={e => setCarenciaCarne(e.target.value)} style={input} /></div>

            <div style={{ gridColumn: "1 / -1", position: "relative" }}>
              <label>Responsável *</label>
              <div style={linha}>
                <input
                  value={responsavel}
                  onChange={e => setResponsavel(e.target.value)}
                  onFocus={() => setMostrarTabelaResponsaveis(true)}
                  onBlur={() => setTimeout(() => setMostrarTabelaResponsaveis(false), 200)}
                  style={{ ...input, flex: 1 }}
                />
                <button onClick={() => setMostrarCadastroResponsavel(true)} className="botao-acao">＋</button>
              </div>
              {mostrarTabelaResponsaveis && (
                <div style={tabelaSuspensa}>
                  {responsaveisSalvos
                    .filter(r => r.toLowerCase().includes(responsavel.toLowerCase()))
                    .map((r, i) => (
                      <div key={i} onMouseDown={() => setResponsavel(r)} style={linhaTabela}>{r}</div>
                    ))}
                </div>
              )}
              {mostrarCadastroResponsavel && (
                <div style={{ ...linha, marginTop: "0.5rem" }}>
                  <input value={novoResponsavel} onChange={e => setNovoResponsavel(e.target.value)} style={{ ...input, flex: 1 }} placeholder="Novo responsável" />
                  <button onClick={salvarNovoResponsavel} className="botao-acao">Salvar</button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label>Observações</label>
            <textarea rows="3" value={observacoes} onChange={e => setObservacoes(e.target.value)} style={{ ...input, resize: "none" }} />
          </div>
          {erroFormulario && <div style={{ color: "red", fontWeight: "500" }}>⚠️ Preencha todos os campos obrigatórios antes de aplicar.</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button onClick={onFechar} className="botao-cancelar">Cancelar</button>
            <button onClick={aplicar} className="botao-acao">Aplicar Secagem</button>
          </div>
        </div>

        {mostrarCadastroMedicamento && <CadastrarMedicamento onFechar={() => setMostrarCadastroMedicamento(false)} />}
        {mostrarRelatorioMedicamentos && <RelatorioMedicamentos onFechar={() => setMostrarRelatorioMedicamentos(false)} />}
      </div>
    </div>
  );
}

// estilos
const overlay = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const modal = { background: "#fff", borderRadius: "1rem", width: "720px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "Poppins, sans-serif" };
const header = { background: "#1e40af", color: "white", padding: "1rem 1.5rem", fontWeight: "bold", fontSize: "1.1rem", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" };
const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "2.5rem", rowGap: "1.5rem" };
const linha = { display: "flex", gap: "0.5rem", alignItems: "center" };
const input = { width: "100%", padding: "0.75rem", fontSize: "0.95rem", borderRadius: "0.6rem", border: "1px solid #ccc", marginTop: "0.5rem", marginBottom: "0.5rem" };
const tabelaSuspensa = { position: "absolute", background: "#fff", border: "1px solid #ccc", borderRadius: "0.5rem", marginTop: "0.25rem", maxHeight: "180px", overflowY: "auto", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", zIndex: 10, fontSize: "0.9rem", width: "100%" };
const linhaTabela = { padding: "0.5rem 1rem", borderBottom: "1px solid #eee", cursor: "pointer", backgroundColor: "#fff" };
