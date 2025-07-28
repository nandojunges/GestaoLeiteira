import React, { useEffect, useRef, useState } from "react";
import { Calendar as CalendarIcon } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Select from 'react-select';
import CadastrarMedicamento from "./CadastrarMedicamento";
import RelatorioMedicamentos from "./RelatorioMedicamentos";
import "../../styles/botoes.css";
import {
  inserirResponsavelSecagemSQLite,
  buscarResponsaveisSecagemSQLite,
  buscarMedicamentosSecagemSQLite,
} from "../../utils/apiFuncoes.js";
import { buscarTodosAnimais, salvarAnimais, excluirAnimal } from "../../sqlite/animais";
import { adicionarOcorrenciaFirestore } from "../../utils/registroReproducao";
import { reduzirQuantidadeProduto } from "../../utils/estoque";

const planosTratamento = [
  { value: 'antibiotico', label: 'Antibiótico intramamário' },
  { value: 'antibio_antiinf', label: 'Antibiótico + Antiinflamatório' },
];

function strToDate(str) {
  if (!str) return null;
  const [d, m, y] = str.split('/');
  if (!d || !m || !y) return null;
  return new Date(`${y}-${m}-${d}T00:00:00`);
}

function dateToStr(date) {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function DateInput({ value, onChange }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.95rem',
    borderRadius: '0.6rem',
    border: '1px solid #ccc',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
  };

  useEffect(() => {
    const handle = (e) => {
      if (!ref.current?.contains(e.target)) setShow(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const dateObj = strToDate(value) || new Date();

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <input
        readOnly
        value={value}
        onClick={() => setShow((s) => !s)}
        style={{ ...inputStyle, paddingRight: '2.5rem' }}
      />
      <CalendarIcon
        size={18}
        onClick={() => setShow((s) => !s)}
        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#555', cursor: 'pointer' }}
      />
      {show && (
        <div style={{ position: 'absolute', zIndex: 20, top: '105%', right: 0 }}>
          <Calendar
            onChange={(d) => {
              onChange(dateToStr(d));
              setShow(false);
            }}
            value={dateObj}
          />
        </div>
      )}
    </div>
  );
}

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

  const carregarDados = async () => {
    const r = await buscarResponsaveisSecagemSQLite();
    const m = await buscarMedicamentosSecagemSQLite();
    setResponsaveisSalvos(r || []);
    setMedicamentosSalvos(m || {});
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const salvarNovoResponsavel = async () => {
    if (novoResponsavel && !responsaveisSalvos.includes(novoResponsavel)) {
      const atualizados = [...responsaveisSalvos, novoResponsavel];
      setResponsaveisSalvos(atualizados);
      await inserirResponsavelSecagemSQLite(novoResponsavel);
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

  const aplicar = async () => {
    if (!dataSecagem || !plano || !principioAtivo || !nomeComercial || !carenciaLeite || !carenciaCarne || !responsavel) {
      setErroFormulario(true);
      return;
    }
    setErroFormulario(false);
    const dados = { vaca, dataSecagem, plano, principioAtivo, nomeComercial, carenciaLeite, carenciaCarne, responsavel, observacoes };
    try {
      await adicionarOcorrenciaFirestore(vaca.numero, {
        tipo: "Secagem",
        data: dataSecagem,
        observacoes,
      });

      /// Atualizar status da vaca para "seca" no backend
     const animais = await buscarTodosAnimais();
      const atualizados = (animais || []).map((a) => {
        if (a.numero === vaca.numero) {
          a.status = "seca";
          a.statusReprodutivo = "seca";
        }
        return a;
      });
      await salvarAnimais(atualizados);
      window.dispatchEvent(new Event("animaisAtualizados"));
      window.dispatchEvent(new Event("dadosAnimalAtualizados"));
      await reduzirQuantidadeProduto(nomeComercial, 1);
    } catch (err) {
      console.error("Erro ao registrar secagem:", err);
      alert("Erro ao registrar secagem");
    }

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
              <DateInput value={dataSecagem} onChange={setDataSecagem} />
            </div>
            <div>
              <label>Plano de Tratamento *</label>
              <Select
                options={planosTratamento}
                value={planosTratamento.find(p => p.value === plano) || null}
                onChange={(op) => setPlano(op?.value || '')}
                styles={{ container: (base) => ({ ...base, marginTop: '0.5rem' }) }}
                placeholder="Selecione"
              />
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

        {mostrarCadastroMedicamento && (
          <CadastrarMedicamento
            onFechar={() => setMostrarCadastroMedicamento(false)}
            onSalvar={() => {
              carregarDados();
              setMostrarCadastroMedicamento(false);
            }}
          />
        )}
        {mostrarRelatorioMedicamentos && <RelatorioMedicamentos onFechar={() => setMostrarRelatorioMedicamentos(false)} />}
      </div>
    </div>
  );
}

const overlay = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const modal = { background: "#fff", borderRadius: "1rem", width: "720px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "Poppins, sans-serif" };
const header = { background: "#1e40af", color: "white", padding: "1rem 1.5rem", fontWeight: "bold", fontSize: "1.1rem", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" };
const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "2.5rem", rowGap: "1.5rem" };
const linha = { display: "flex", gap: "0.5rem", alignItems: "center" };
const input = { width: "100%", padding: "0.75rem", fontSize: "0.95rem", borderRadius: "0.6rem", border: "1px solid #ccc", marginTop: "0.5rem", marginBottom: "0.5rem" };
const tabelaSuspensa = { position: "absolute", background: "#fff", border: "1px solid #ccc", borderRadius: "0.5rem", marginTop: "0.25rem", maxHeight: "180px", overflowY: "auto", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", zIndex: 10, fontSize: "0.9rem", width: "100%" };
const linhaTabela = { padding: "0.5rem 1rem", borderBottom: "1px solid #eee", cursor: "pointer", backgroundColor: "#fff" };
