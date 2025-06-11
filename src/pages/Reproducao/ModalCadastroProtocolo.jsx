import React, { useState, useEffect } from "react";
import Select from "react-select";
import "../../styles/modalPadrao.css";
import { contarEstoqueImplantes } from "./utilsReproducao";

const hormonios = [
  { id: "Benzoato de Estradiol", nome: "Benzoato de Estradiol" },
  { id: "Cipionato de Estradiol", nome: "Cipionato de Estradiol" },
  { id: "PGF2α", nome: "PGF2α" },
  { id: "GnRH", nome: "GnRH" },
  { id: "eCG", nome: "eCG" },
  { id: "hCG", nome: "hCG" },
];

export default function ModalCadastroProtocolo({ onFechar, onSalvar }) {
  const diasIniciais = Array.from({ length: 11 }, (_, i) => i);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dias, setDias] = useState(diasIniciais);
  const [etapas, setEtapas] = useState({});
  const [formDia, setFormDia] = useState(null);
  const [formIndex, setFormIndex] = useState(null);
  const [form, setForm] = useState({
    hormonio: "",
    nomeComercial: "",
    dose: "",
    acaoDispositivo: "",
    tipoDispositivo: "",
  });
  const [estoquePrimeiroUso, setEstoquePrimeiroUso] = useState(0);
  const [produtos, setProdutos] = useState([]);
  const dispositivos = Array.from(new Set(produtos.filter(p => p.nomeHormônio === "Dispositivo de Progesterona").map(p => p.nomeComercial)));

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("produtos") || "[]");
    setProdutos(lista);
    setEstoquePrimeiroUso(contarEstoqueImplantes(1));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "cadastroProtocoloTmp",
      JSON.stringify({ nome, descricao, dias, etapas })
    );
  }, [nome, descricao, dias, etapas]);

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
      // recolhe o formulário se já estiver aberto
      setFormDia(null);
      setFormIndex(null);
    } else {
      setFormDia(dia);
      setFormIndex(null);
    }
    setForm({ hormonio: "", nomeComercial: "", dose: "", acaoDispositivo: "", tipoDispositivo: "" });
  };

  const editarEtapa = (dia, idx) => {
    const etapa = etapas[dia][idx];
    setFormDia(dia);
    setFormIndex(idx);
    setForm({ ...etapa });
  };

  const salvarEtapa = () => {
    if (formDia === null) return;
    if (!form.hormonio && !form.acaoDispositivo) {
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
    setForm({ hormonio: "", nomeComercial: "", dose: "", acaoDispositivo: "", tipoDispositivo: "" });
  };

  const removerEtapa = (dia, idx) => {
    setEtapas((prev) => {
      const arr = prev[dia] ? [...prev[dia]] : [];
      arr.splice(idx, 1);
      return { ...prev, [dia]: arr };
    });
  };

  const salvarProtocolo = () => {
    const etapasList = [];
    Object.entries(etapas).forEach(([d, arr]) => {
      arr.forEach((e) => etapasList.push({ ...e, dia: parseInt(d, 10) }));
    });
    if (!nome || etapasList.length === 0) {
      alert("Preencha o nome e adicione pelo menos uma etapa.");
      return;
    }
    const protocolo = {
      nome,
      descricao,
      etapas: etapasList.sort((a, b) => a.dia - b.dia),
    };
    const salvos = JSON.parse(localStorage.getItem("protocolos") || "[]");
    localStorage.setItem("protocolos", JSON.stringify([...salvos, protocolo]));
    localStorage.removeItem("cadastroProtocoloTmp");
    onSalvar && onSalvar(protocolo);
    onFechar();
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

  const headerInput = {
    width: "100%",
    margin: "0.25rem 0",
    padding: "0.4rem",
    borderRadius: "0.5rem",
    border: "1px solid #ccc",
  };

  return (
    <div style={overlay} onClick={onFechar}>
      <div style={modal} onClick={(e) => e.stopPropagation()} className="modal-content">
        <h2 className="mb-2">📝 Cadastrar Protocolo IATF</h2>
        <div className="sticky top-0 bg-white pb-2">
          <label>Nome do Protocolo:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={headerInput}
          />
          <label>Descrição:</label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={headerInput}
          />
        </div>
        <div className="mt-2" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <div className="space-y-4">
            {dias.map((d) => (
              <div key={d} className="relative pl-4 border-l-2 border-blue-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">🕒 Dia {d}</span>
                  <div className="flex gap-2">
                    <button
                      className="botao-acao pequeno"
                      onClick={() => abrirFormNovo(d)}
                    >
                      {formDia === d ? "-" : "+"}
                    </button>
                    <button
                      className="botao-cancelar pequeno"
                      onClick={() => removerDia(d)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="ml-2 space-y-1">
                  {(etapas[d] || []).map((e, i) => (
                    <div key={i} className="text-sm flex items-center gap-2">
                      <span>
                        {e.hormonio && `🧪 ${e.hormonio} ${e.dose ? `- ${e.dose} mL` : ""}`} {e.nomeComercial}
                      </span>
                      {e.acaoDispositivo && (
                        <span>📎 {e.acaoDispositivo} {e.tipoDispositivo || ''}</span>
                      )}
                      <button className="btn-editar" onClick={() => editarEtapa(d, i)}>✏️</button>
                      <button className="btn-excluir" onClick={() => removerEtapa(d, i)}>🗑️</button>
                    </div>
                  ))}
                </div>
                {formDia === d && (
                  <div className="mt-2 p-2 border rounded bg-gray-50 text-sm space-y-2">
                    <div className="font-semibold">Adicionar Etapa</div>
                    <div>
                      <label>Hormônio:</label>
                      <Select
                        options={[{ value: '', label: 'Nenhum' }, ...hormonios.map(h => ({ value: h.id, label: h.nome }))]}
                        value={form.hormonio ? { value: form.hormonio, label: form.hormonio } : { value: '', label: 'Nenhum' }}
                        onChange={(opt) => setForm({ ...form, hormonio: opt?.value || '' })}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Selecione..."
                      />
                    </div>
                    <div>
                      <label>Nome Comercial:</label>
                      <input
                        list="produtos"
                        value={form.nomeComercial}
                        onChange={(e) => setForm({ ...form, nomeComercial: e.target.value })}
                        style={headerInput}
                      />
                      <datalist id="produtos">
                        {produtos.map((p) => (
                          <option key={p.nomeComercial} value={p.nomeComercial} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label>Dose:</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.dose}
                        onChange={(e) => setForm({ ...form, dose: e.target.value })}
                        style={headerInput}
                      />
                    </div>
                    <div>
                      <label>Ação com Dispositivo:</label>
                      <Select
                        options={[
                          { value: '', label: 'Nenhum' },
                          { value: 'Inserir', label: 'Inserir dispositivo' },
                          { value: 'Retirar', label: 'Retirar dispositivo' },
                        ]}
                        value={form.acaoDispositivo ? { value: form.acaoDispositivo, label: form.acaoDispositivo } : { value: '', label: 'Nenhum' }}
                        onChange={(opt) => setForm({ ...form, acaoDispositivo: opt?.value || '' })}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Selecione..."
                      />
                    </div>
                    {form.acaoDispositivo === 'Inserir' && (
                      <div>
                        <label>Tipo de dispositivo</label>
                        <Select
                          options={dispositivos.map(disp => ({ value: disp, label: disp }))}
                          value={form.tipoDispositivo ? { value: form.tipoDispositivo, label: form.tipoDispositivo } : null}
                          onChange={opt => {
                            setForm({ ...form, tipoDispositivo: opt?.value || '' });
                          }}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Selecione..."
                        />
                        <p className="text-xs text-gray-500">Estoque 1º uso: {estoquePrimeiroUso}</p>
                      </div>
                    )}
                    <button className="botao-acao mt-1" onClick={salvarEtapa}>✔️ Salvar Etapa</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="botao-acao mt-2" onClick={adicionarDia}>Adicionar Dia</button>
        </div>
        <div className="flex justify-end gap-2 mt-4">
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
