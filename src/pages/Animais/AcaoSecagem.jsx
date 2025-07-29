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
  aplicarSecagem as aplicarSecagemAPI
} from "../../utils/apiFuncoes.js";
import { toast } from 'react-toastify';

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
  const [carenciaLeite, setCarenciaLeite] = useState("");
  const [carenciaCarne, setCarenciaCarne] = useState("");
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState(null);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState(null);
  const [observacoes, setObservacoes] = useState("");

  const [responsaveisSalvos, setResponsaveisSalvos] = useState([]);
  const [mostrarCadastroResponsavel, setMostrarCadastroResponsavel] = useState(false);
  const [novoResponsavel, setNovoResponsavel] = useState("");

  const [medicamentosSalvos, setMedicamentosSalvos] = useState({});
  const [mostrarCadastroMedicamento, setMostrarCadastroMedicamento] = useState(false);
  const [mostrarRelatorioMedicamentos, setMostrarRelatorioMedicamentos] = useState(false);

  const [erroFormulario, setErroFormulario] = useState(false);

  const refs = useRef([]);

  const nomeComercial = medicamentoSelecionado?.label || "";
  const responsavel = responsavelSelecionado?.label || "";

  const opcoesMedicamentos = Object.entries(medicamentosSalvos).map(([nome, med]) => ({
    value: med.id,
    label: nome,
    principioAtivo: med.principio,
    carenciaLeite: med.leite,
    carenciaCarne: med.carne,
  }));

  const opcoesResponsaveis = responsaveisSalvos.map(r => ({ value: r, label: r }));

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
      setResponsavelSelecionado({ value: novoResponsavel, label: novoResponsavel });
    }
    setNovoResponsavel("");
    setMostrarCadastroResponsavel(false);
  };


  const aplicar = async () => {
    if (!dataSecagem || !plano) {
      setErroFormulario(true);
      return;
    }
    setErroFormulario(false);
    try {
      await aplicarSecagemAPI(vaca.id, dataSecagem, plano);
      toast.success('Secagem aplicada com sucesso');
      onAplicar && onAplicar();
    } catch (err) {
      console.error('Erro ao aplicar secagem:', err);
      toast.error('Erro ao aplicar secagem');
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>🐄 Aplicar Secagem — {vaca.numero} / {vaca.brinco}</div>
        <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="grid grid-cols-2 gap-4">
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
                classNamePrefix="react-select"
              />
            </div>
          </div>

          <div style={grid}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Nome Comercial *</label>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    options={opcoesMedicamentos}
                    value={medicamentoSelecionado}
                    onChange={(opcao) => {
                      setMedicamentoSelecionado(opcao);
                      if (opcao) {
                        setPrincipioAtivo(opcao.principioAtivo);
                        setCarenciaLeite(opcao.carenciaLeite);
                        setCarenciaCarne(opcao.carenciaCarne);
                      } else {
                        setPrincipioAtivo('');
                        setCarenciaLeite('');
                        setCarenciaCarne('');
                      }
                    }}
                    placeholder="Selecione o medicamento"
                    classNamePrefix="react-select"
                  />
                </div>
                <button type="button" onClick={() => setMostrarCadastroMedicamento(true)} className="botao-acao">＋</button>
                <button type="button" onClick={() => setMostrarRelatorioMedicamentos(true)} className="botao-acao">🧾</button>
              </div>
            </div>

            <div><label>Princípio Ativo *</label><input value={principioAtivo} onChange={e => setPrincipioAtivo(e.target.value)} style={input} /></div>
            <div><label>Carência Leite *</label><input value={carenciaLeite} onChange={e => setCarenciaLeite(e.target.value)} style={input} /></div>
            <div><label>Carência Carne *</label><input value={carenciaCarne} onChange={e => setCarenciaCarne(e.target.value)} style={input} /></div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label>Responsável *</label>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    options={opcoesResponsaveis}
                    value={responsavelSelecionado}
                    onChange={(opcao) => setResponsavelSelecionado(opcao)}
                    placeholder="Selecione o responsável"
                    classNamePrefix="react-select"
                  />
                </div>
                <button type="button" onClick={() => setMostrarCadastroResponsavel(true)} className="botao-acao">＋</button>
              </div>
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
