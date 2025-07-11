import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import {
  buscarProtocolos,
  registrarProtocolo,
  atualizarProtocolo,
  excluirProtocolo,
} from "../../utils/apiFuncoes.js";
import "../../styles/modalPadrao.css";

const hormonios = [
  { id: "Benzoato de Estradiol", nome: "Benzoato de Estradiol" },
  { id: "Cipionato de Estradiol", nome: "Cipionato de Estradiol" },
  { id: "PGF2α", nome: "PGF2α" },
  { id: "GnRH", nome: "GnRH" },
  { id: "eCG", nome: "eCG" },
  { id: "hCG", nome: "hCG" },
];

export default function ModalCadastroProtocolo({ onFechar, onSalvar, protocoloInicial = null, indiceEdicao = null }) {
  const diasIniciais = Array.from({ length: 11 }, (_, i) => i);
  const [nome, setNome] = useState(protocoloInicial?.nome || "");
  const [descricao, setDescricao] = useState(protocoloInicial?.descricao || "");
  const [tipo, setTipo] = useState(
    protocoloInicial?.tipo?.toUpperCase() || "IATF"
  );
  const [dias, setDias] = useState(
    protocoloInicial
      ? Array.from(new Set(protocoloInicial.etapas.map((e) => e.dia))).sort((a, b) => a - b)
      : diasIniciais
  );
  const [etapas, setEtapas] = useState(
    protocoloInicial
      ? protocoloInicial.etapas.reduce((acc, e) => {
          const { hormonio = "", acao = "", dia } = e;
          if (!acc[dia]) acc[dia] = [];
          acc[dia].push({ hormonio, acao });
          return acc;
        }, {})
      : {}
  );
  const [formDia, setFormDia] = useState(null);
  const [formIndex, setFormIndex] = useState(null);
  const [form, setForm] = useState({
    hormonio: "",
    acao: "",
  });
  const camposRef = useRef([]);

  const handleEnter = (index) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const prox = camposRef.current[index + 1];
      prox && prox.focus();
    }
  };


  const adicionarDia = () => {
    const proximo = dias.length ? Math.max(...dias) + 1 : 0;
    setDias([...dias, proximo]);
  };

  const removerDia = (dia) => {
    setDias(dias.filter((d) => d !== dia));
    setEtapas((prev) => {
      const novo = { ...prev };
      delete novo[dia];
      return novo;
    });
  };

  const abrirFormNovo = (dia) => {
    if (formDia === dia) {
      setFormDia(null);
      setFormIndex(null);
    } else {
      setFormDia(dia);
      setFormIndex(null);
    }
    setForm({ hormonio: "", acao: "" });
  };

  const editarEtapa = (dia, idx) => {
    const etapa = etapas[dia][idx];
    setFormDia(dia);
    setFormIndex(idx);
    setForm({ ...etapa });
  };

  useEffect(() => {
    const esc = (e) => {
      if (e.key === "Escape") {
        if (formDia !== null) {
          setFormDia(null);
          setFormIndex(null);
        } else onFechar();
      }
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [formDia, onFechar]);

  const salvarEtapa = () => {
    if (formDia === null) return;
    if (!form.hormonio && !form.acao) {
      alert("Selecione um hormônio ou dispositivo.");
      return;
    }
    setEtapas((prev) => {
      const arr = prev[formDia] ? [...prev[formDia]] : [];
      const etapa = { ...form };
      if (formIndex !== null) arr[formIndex] = etapa;
      else arr.push(etapa);
      return { ...prev, [formDia]: arr };
    });
    setFormIndex(null);
    setForm({ hormonio: "", acao: "" });
  };

  const removerEtapa = (dia, idx) => {
    setEtapas((prev) => {
      const arr = prev[dia] ? [...prev[dia]] : [];
      arr.splice(idx, 1);
      return { ...prev, [dia]: arr };
    });
  };

  const salvarProtocolo = async () => {
    const etapasList = [];
    Object.entries(etapas).forEach(([d, arr]) => {
      arr.forEach((e) => etapasList.push({ ...e, dia: parseInt(d, 10) }));
    });

    if (!nome || etapasList.length === 0 || !tipo) {
      alert("Preencha o nome, o tipo e adicione pelo menos uma etapa.");
      return;
    }

    const protocolo = {
      nome,
      descricao,
      tipo,
      etapas: etapasList.sort((a, b) => a.dia - b.dia),
    };

    try {
      const salvos = await buscarProtocolos();
      if (indiceEdicao !== null) {
        const id = salvos[indiceEdicao]?.id;
        if (id) {
          await atualizarProtocolo(id, protocolo);
        }
      } else {
        await registrarProtocolo(protocolo);
      }

      window.dispatchEvent(new Event("protocolosAtualizados"));
      onSalvar && onSalvar(protocolo);
      toast.success("✅ Protocolo salvo com sucesso!");
      onFechar();
    } catch (error) {
      toast.error("Erro ao salvar protocolo: " + error.message);
    }
  };

  const overlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  };

  const modal = {
    background: "#fff",
    borderRadius: "1rem",
    width: "640px",
    maxWidth: "95vw",
    padding: "1rem",
    fontFamily: "Poppins, sans-serif",
  };

  const headerStyle = {
    backgroundColor: "#1F3FB6",
    color: "white",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: 600,
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const headerInput = {
    width: "100%",
    marginBottom: "10px",
    padding: "0.4rem",
    borderRadius: "0.5rem",
    border: "1px solid #ccc",
  };

  const diaBlock = {
    marginBottom: "20px",
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  };

  return (
    <div style={overlay} onClick={onFechar}>
      <div style={modal} onClick={(e) => e.stopPropagation()} className="modal-content">
        <div style={headerStyle}>
          <span>🧬</span>
          <span>Cadastrar Protocolo</span>
        </div>
        <div className="sticky top-0 bg-white pb-2">
          <label>Tipo do Protocolo:</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value.toUpperCase())}
            style={headerInput}
          >
            <option value="IATF">IATF</option>
            <option value="PRÉ-SINCRONIZAÇÃO">Pré-sincronização</option>
          </select>
          <label>Nome do Protocolo:</label>
          <input
            type="text"
            ref={(el) => (camposRef.current[0] = el)}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={handleEnter(0)}
            style={headerInput}
          />
          <label>Descrição:</label>
          <input
            type="text"
            ref={(el) => (camposRef.current[1] = el)}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            onKeyDown={handleEnter(1)}
            style={headerInput}
          />
        </div>
        <div className="modal-body mt-2">
          <div className="space-y-4">
            {dias.map((d) => (
              <div key={d} style={diaBlock} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">🕒 Dia {d}</span>
                  <div className="flex gap-2">
                    <button
                      className="botao-acao pequeno mt-2"
                      onClick={() => abrirFormNovo(d)}
                    >
                      {formDia === d ? "-" : "+ Nova Etapa"}
                    </button>
                    <button
                      className="botao-cancelar pequeno"
                      onClick={() => removerDia(d)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  {(etapas[d] || []).map((e, i) => (
                    <div key={i} className="text-sm flex items-center gap-2">
                      <span>
                        {e.hormonio && `🧪 ${e.hormonio}`}
                      </span>
                      {e.acao && <span>📎 {e.acao}</span>}
                      <button className="btn-editar" onClick={() => editarEtapa(d, i)}>✏️</button>
                      <button className="btn-excluir" onClick={() => removerEtapa(d, i)}>🗑️</button>
                    </div>
                  ))}
                </div>
                {formDia === d && (
                  <div className="form-etapa mt-2 p-3 border rounded bg-gray-50 text-sm space-y-2 mb-3">
                    <div className="font-semibold">Adicionar Etapa</div>
                    <div>
                      <label>Hormônio:</label>
                      <Select
                        ref={(el) => (camposRef.current[2] = el)}
                        onKeyDown={handleEnter(2)}
                        options={[{ value: '', label: 'Nenhum' }, ...hormonios.map(h => ({ value: h.id, label: h.nome }))]}
                        value={form.hormonio ? { value: form.hormonio, label: form.hormonio } : { value: '', label: 'Nenhum' }}
                        onChange={(opt) => setForm({ ...form, hormonio: opt?.value || '' })}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Selecione..."
                      />
                    </div>
                    <div>
                      <label>Ação:</label>
                      <Select
                        ref={(el) => (camposRef.current[3] = el)}
                        onKeyDown={handleEnter(3)}
                        options={[
                          { value: '', label: 'Nenhuma' },
                          { value: 'Inserir Dispositivo', label: 'Inserir Dispositivo' },
                          { value: 'Retirar Dispositivo', label: 'Retirar Dispositivo' },
                          { value: 'Inseminação', label: 'Inseminação' },
                        ]}
                        value={form.acao ? { value: form.acao, label: form.acao } : { value: '', label: 'Nenhuma' }}
                        onChange={(opt) => setForm({ ...form, acao: opt?.value || '' })}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Selecione..."
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="botao-acao pequeno"
                        onClick={() => {
                          salvarEtapa();
                          camposRef.current[2]?.focus();
                        }}
                      >
                        ➕ Adicionar outro hormônio
                      </button>
                      <button
                        className="botao-acao pequeno"
                        onClick={() => {
                          salvarEtapa();
                          setFormDia(null);
                          setFormIndex(null);
                        }}
                      >
                        ✔ Finalizar Dia
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="botao-novo-dia">
            <button className="botao-acao mt-2" onClick={adicionarDia}>
              ➕ Adicionar Novo Dia
            </button>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white pt-3 mt-4 flex justify-end gap-2">
          <button onClick={onFechar} className="botao-cancelar">
            Cancelar
          </button>
          <button onClick={salvarProtocolo} className="botao-acao">
            💾 Salvar Protocolo
          </button>
        </div>
      </div>
    </div>
  );
}
