import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import ImportarFichaTouro from "./ImportarFichaTouro";
import AbrirFichaTouro from "./AbrirFichaTouro";
import { salvarFichaAnimalSQLite } from '../../utils/apiFuncoes.js';

export default function FichaComplementarAnimal({ numeroAnimal, onFechar, onSalvar }) {
  const [nomeTouro, setNomeTouro] = useState("");
  const [nomeMae, setNomeMae] = useState("");
  const [ultimaIA, setUltimaIA] = useState("");
  const [ultimoParto, setUltimoParto] = useState("");
  const [nLactacoes, setNLactacoes] = useState("");
  const [historico, setHistorico] = useState([]);
  const [modalTipo, setModalTipo] = useState(null);
  const [dataModal, setDataModal] = useState("");
  const [modalImportar, setModalImportar] = useState(false);
  const [modalVerFicha, setModalVerFicha] = useState(false);
  const [tourosDisponiveis, setTourosDisponiveis] = useState([]);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
    const esc = (e) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onFechar]);

  useEffect(() => {
    const carregarTouros = async () => {
      const dados = await buscarTodosTourosSQLite();
      setTourosDisponiveis((dados || []).map((t) => t.nome));
    };
    carregarTouros();
  }, [modalImportar]);

  const formatarData = (valor) => {
    const limpo = valor.replace(/\D/g, "").slice(0, 8);
    const dia = limpo.slice(0, 2);
    const mes = limpo.slice(2, 4);
    const ano = limpo.slice(4, 8);
    const dataFormatada = [dia, mes, ano].filter(Boolean).join("/");

    if (dataFormatada.length === 10) {
      const [d, m, a] = dataFormatada.split("/").map(Number);
      const data = new Date(a, m - 1, d);
      if (data.getDate() !== d || data.getMonth() !== m - 1 || data.getFullYear() !== a) {
        return "";
      }
    }

    return dataFormatada;
  };

  const handleKey = (e, index) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    }
  };

  const salvarCompleta = async () => {
    const dataInvalida = (txt) => {
      if (!txt || txt.length !== 10) return true;
      const [d, m, a] = txt.split("/").map(Number);
      const data = new Date(a, m - 1, d);
      return data.getDate() !== d || data.getMonth() !== m - 1 || data.getFullYear() !== a;
    };

    if (
      dataInvalida(ultimaIA) ||
      dataInvalida(ultimoParto) ||
      historico.some(h => dataInvalida(h.data))
    ) {
      alert("⚠️ Preencha as datas corretamente no formato dd/mm/aaaa.");
      return;
    }

    let ficha = null;
    if (nomeTouro) {
      const todos = await buscarTodosTourosSQLite();
      ficha = todos.find((t) => t.nome === nomeTouro) || null;
    }

    let dataPrevistaParto = "";
    if (ultimaIA && ultimaIA.length === 10) {
      const [dia, mes, ano] = ultimaIA.split("/");
      const dataIA = new Date(ano, mes - 1, dia);
      dataIA.setDate(dataIA.getDate() + 280);
      dataPrevistaParto = dataIA.toLocaleDateString("pt-BR");
    }

    const dados = {
      pai: nomeTouro || "",
      mae: nomeMae || "",
      ultimaIA,
      ultimoParto,
      dataPrevistaParto,
      fichaTouro: ficha,
      nLactacoes: parseInt(nLactacoes || 0),
      historico: {
        inseminacoes: historico
          .filter(h => h.tipo === "IA")
          .map(h => ({
            data: h.data,
            touro: nomeTouro || "—",
            inseminador: "—",
            tipo: "IA"
          })),
        partos: historico
          .filter(h => h.tipo === "Parto")
          .map(h => ({ data: h.data, tipo: "Parto", obs: "—" })),
        secagens: historico
          .filter(h => h.tipo === "Secagem")
          .map(h => ({ data: h.data, tipo: "Secagem", obs: "—" }))
      }
    };

    if (numeroAnimal) {
      await salvarFichaAnimalSQLite(numeroAnimal, dados);
      window.dispatchEvent(new Event("dadosAnimalAtualizados"));
    }

    onSalvar(dados);
    setMensagemSucesso("✅ Ficha complementar salva com sucesso!");
    setTimeout(() => {
      setMensagemSucesso("");
      onFechar();
    }, 2000);
  };

  const adicionarEvento = () => {
    if (!dataModal || !modalTipo) return;

    const [d, m, a] = dataModal.split("/").map(Number);
    const data = new Date(a, m - 1, d);
    if (data.getDate() !== d || data.getMonth() !== m - 1 || data.getFullYear() !== a) return;

    const novo = { tipo: modalTipo, data: dataModal };
    const atualizado = [...historico, novo].sort((a, b) => {
      const [da, ma, ya] = a.data.split("/").map(Number);
      const [db, mb, yb] = b.data.split("/").map(Number);
      return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
    });
    setHistorico(atualizado);
    setDataModal("");
    setModalTipo(null);
  };

  const opcoesTouros = tourosDisponiveis.map(t => ({ value: t, label: t }));

  return (
    <div style={{ padding: '2rem' }}>
      {mensagemSucesso && (
        <div style={{
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #34d399',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ✅ {mensagemSucesso}
        </div>
      )}

      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>📋 Ficha Complementar</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1 }}>
          <Select
            options={opcoesTouros}
            value={opcoesTouros.find(opt => opt.value === nomeTouro) || null}
            onChange={(e) => setNomeTouro(e.value)}
            placeholder="Selecione um touro"
          />
        </div>
        <button onClick={() => setModalVerFicha(true)} style={botaoIcone}>📄</button>
        <button onClick={() => setModalImportar(true)} style={botaoAnexar}>
          <span style={{ fontSize: '1.25rem' }}>📎</span> Anexar Ficha
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
        <div>
          <label>Nome da Mãe</label>
          <input ref={el => refs.current[1] = el} type="text" value={nomeMae} onChange={(e) => setNomeMae(e.target.value)} onKeyDown={(e) => handleKey(e, 1)} style={inputStyle} />
        </div>
        <div>
          <label>Último Parto</label>
          <input ref={el => refs.current[2] = el} type="text" placeholder="dd/mm/aaaa" value={ultimoParto} onChange={(e) => setUltimoParto(formatarData(e.target.value))} onKeyDown={(e) => handleKey(e, 2)} style={inputStyle} />
        </div>
        <div>
          <label>Última IA</label>
          <input ref={el => refs.current[3] = el} type="text" placeholder="dd/mm/aaaa" value={ultimaIA} onChange={(e) => setUltimaIA(formatarData(e.target.value))} onKeyDown={(e) => handleKey(e, 3)} style={inputStyle} />
        </div>
        <div>
          <label>Número de lactações</label>
          <input ref={el => refs.current[4] = el} type="number" min="0" value={nLactacoes} onChange={(e) => setNLactacoes(e.target.value)} onKeyDown={(e) => handleKey(e, 4)} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Histórico Reprodutivo</h4>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button onClick={() => setModalTipo("IA")} style={botaoAcao}>➕ Adicionar IA anterior</button>
          <button onClick={() => setModalTipo("Parto")} style={botaoAcao}>➕ Adicionar Parto anterior</button>
          <button onClick={() => setModalTipo("Secagem")} style={botaoAcao}>➕ Adicionar Secagem anterior</button>
        </div>
        {modalTipo && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input ref={el => refs.current[5] = el} type="text" value={dataModal} placeholder="dd/mm/aaaa" onChange={(e) => setDataModal(formatarData(e.target.value))} onKeyDown={(e) => handleKey(e, 5)} style={inputStyle} />
            <button ref={el => refs.current[6] = el} onClick={adicionarEvento} style={botaoPrincipal}>Salvar {modalTipo}</button>
          </div>
        )}
        <ul style={{ paddingLeft: '1rem', color: '#374151' }}>
          {historico.map((h, i) => (
            <li key={i}>📌 {h.tipo} em {h.data}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
        <button onClick={salvarCompleta} style={botaoPrincipal}>💾 Salvar Tudo</button>
        <button onClick={onFechar} style={botaoCancelar}>✖ Cancelar Ficha Complementar</button>
      </div>

      {modalImportar && <ImportarFichaTouro onFechar={() => setModalImportar(false)} onSalvar={(nome) => setNomeTouro(nome)} />}
      {modalVerFicha && <AbrirFichaTouro nome={nomeTouro} onFechar={() => setModalVerFicha(false)} />}
    </div>
  );
}

// Estilos
const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  fontSize: '1rem'
};

const botaoAnexar = {
  backgroundColor: '#e0f2fe',
  color: '#0369a1',
  padding: '0.6rem 1.2rem',
  borderRadius: '0.5rem',
  border: 'none',
  fontWeight: '600',
  fontSize: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer'
};

const botaoIcone = {
  backgroundColor: '#f3f4f6',
  color: '#111827',
  padding: '0.6rem',
  borderRadius: '0.5rem',
  border: '1px solid #cbd5e1',
  fontSize: '1.1rem',
  fontWeight: '500',
  cursor: 'pointer'
};

const botaoAcao = {
  backgroundColor: '#f3f4f6',
  color: '#111827',
  padding: '0.6rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid #cbd5e1',
  fontSize: '0.95rem',
  fontWeight: '500',
  cursor: 'pointer'
};

const botaoCancelar = {
  backgroundColor: '#fef2f2',
  color: '#991b1b',
  padding: '0.75rem 2rem',
  borderRadius: '0.5rem',
  border: '1px solid #fecaca',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer'
};

const botaoPrincipal = {
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  padding: '0.75rem 2rem',
  borderRadius: '0.5rem',
  fontWeight: '600',
  fontSize: '1rem',
  cursor: 'pointer'
};
