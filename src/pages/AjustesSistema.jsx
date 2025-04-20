import React, { useEffect, useState } from "react";

function AjustesSistema() {
  const [grupos, setGrupos] = useState([]);
  const [novoGrupo, setNovoGrupo] = useState("");
  const [diasSecar, setDiasSecar] = useState(60);
  const [diasPreParto, setDiasPreParto] = useState(21);
  const [diasValidade, setDiasValidade] = useState(7);
  const [alertasEstoque, setAlertasEstoque] = useState({});
  const [consumoDiario, setConsumoDiario] = useState({});
  const [mostrarTooltip, setMostrarTooltip] = useState(null);

  useEffect(() => {
    const ajustesSalvos = JSON.parse(localStorage.getItem("ajustesSistema"));
    if (ajustesSalvos) {
      setGrupos(ajustesSalvos.grupos || []);
      setDiasSecar(ajustesSalvos.diasSecar || 60);
      setDiasPreParto(ajustesSalvos.diasPreParto || 21);
      setDiasValidade(ajustesSalvos.diasValidade || 7);
      setAlertasEstoque(ajustesSalvos.alertasEstoque || {});
      setConsumoDiario(ajustesSalvos.consumoDiario || {});
    } else {
      const gruposExemplo = ["Pré-parto", "Lote 1", "Vacas Secas"];
      setGrupos(gruposExemplo);
      setAlertasEstoque({
        "Pré-parto::Mineral Mix - kg": 8,
        "Pré-parto::Ácido peracético - L": 5,
        "Lote 1::Concentrado - kg": 20,
        "Lote 1::Cloro líquido - L": 6,
        "Vacas Secas::Proteinados - kg": 15
      });
      setConsumoDiario({
        "Pré-parto::Mineral Mix - kg": 2,
        "Pré-parto::Ácido peracético - L": 0.5,
        "Lote 1::Concentrado - kg": 5,
        "Lote 1::Cloro líquido - L": 1,
        "Vacas Secas::Proteinados - kg": 3
      });
    }
  }, []);

  const salvarAjustes = () => {
    const ajustes = {
      grupos,
      diasSecar,
      diasPreParto,
      diasValidade,
      alertasEstoque,
      consumoDiario
    };
    localStorage.setItem("ajustesSistema", JSON.stringify(ajustes));
    alert("Ajustes salvos com sucesso!");
  };

  const adicionarGrupo = () => {
    if (novoGrupo.trim() && !grupos.includes(novoGrupo.trim())) {
      setGrupos([...grupos, novoGrupo.trim()]);
      setNovoGrupo("");
    }
  };

  const removerGrupo = (index) => {
    const novos = grupos.filter((_, i) => i !== index);
    setGrupos(novos);
  };

  const atualizarAlerta = (chave, valor) => {
    setAlertasEstoque((prev) => ({ ...prev, [chave]: Number(valor) }));
  };

  const atualizarConsumo = (chave, valor) => {
    setConsumoDiario((prev) => ({ ...prev, [chave]: Number(valor) }));
  };

  const removerAlerta = (chave) => {
    const novos = { ...alertasEstoque };
    delete novos[chave];
    setAlertasEstoque(novos);
  };

  const renderTooltip = (id, texto) =>
    mostrarTooltip === id && (
      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1rem' }}>{texto}</p>
    );

  return (
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      paddingTop: '4rem',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
        padding: '2rem',
        width: '100%',
        maxWidth: '900px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', textAlign: 'center', color: '#1e3a8a', marginBottom: '1rem' }}>
          ⚙️ Ajustes do Sistema
        </h2>

        {/* Grupos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <h3 style={{ fontWeight: '700' }}>🐄 Grupos/Lotes de Animais</h3>
          <span style={{ cursor: 'pointer' }} onClick={() => setMostrarTooltip(mostrarTooltip === 'grupos' ? null : 'grupos')}>❓</span>
        </div>
        {renderTooltip('grupos', 'Adicione os nomes dos grupos ou lotes de animais. Isso será usado para organizar os alertas e consumo de insumos.')}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Novo grupo..."
            value={novoGrupo}
            onChange={(e) => setNovoGrupo(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
          />
          <button onClick={adicionarGrupo} style={{ backgroundColor: '#2563eb', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.375rem' }}>
            Adicionar
          </button>
        </div>
        <ul style={{ marginBottom: '1.5rem' }}>
          {grupos.map((g, i) => (
            <li key={i} style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>{g}</span>
              <button onClick={() => removerGrupo(i)} style={{ color: 'red' }}>🗑️</button>
            </li>
          ))}
        </ul>

        {/* Reprodutivos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <h3 style={{ fontWeight: '700' }}>🔔 Alertas Reprodutivos</h3>
          <span style={{ cursor: 'pointer' }} onClick={() => setMostrarTooltip(mostrarTooltip === 'repro' ? null : 'repro')}>❓</span>
        </div>
        {renderTooltip('repro', 'Configure os alertas para ações reprodutivas com base no número de dias antes do parto.')}
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          <label>Secar vaca
            <input type="number" value={diasSecar} onChange={(e) => setDiasSecar(Number(e.target.value))} style={{ marginLeft: '0.5rem', width: '4rem' }} /> dias antes do parto.
          </label>
          <label>Início do pré-parto
            <input type="number" value={diasPreParto} onChange={(e) => setDiasPreParto(Number(e.target.value))} style={{ marginLeft: '0.5rem', width: '4rem' }} /> dias antes do parto.
          </label>
          <label>Alerta de validade
            <input type="number" value={diasValidade} onChange={(e) => setDiasValidade(Number(e.target.value))} style={{ marginLeft: '0.5rem', width: '4rem' }} /> dias antes do vencimento.
          </label>
        </div>

        {/* Estoque por Grupo */}
        {grupos.map((grupo) => (
          <div key={grupo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h3 style={{ fontWeight: '700' }}>📦 Estoque - {grupo}</h3>
              <span style={{ cursor: 'pointer' }} onClick={() => setMostrarTooltip(mostrarTooltip === grupo ? null : grupo)}>❓</span>
            </div>
            {renderTooltip(grupo, `Configure os alertas e consumo médio diário dos produtos utilizados no grupo "${grupo}".`)}
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
              {Object.entries(alertasEstoque).filter(([chave]) => chave.startsWith(`${grupo}::`)).map(([chave, valor]) => (
                <div key={chave} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ flex: 1 }}>{chave.split("::")[1]}</span>
                  <label style={{ fontSize: '0.85rem' }}>Alerta
                    <input
                      type="number"
                      value={valor}
                      onChange={(e) => atualizarAlerta(chave, e.target.value)}
                      style={{ width: '4rem', marginLeft: '0.25rem' }}
                    />
                  </label>
                  <label style={{ fontSize: '0.85rem' }}>Consumo
                    <input
                      type="number"
                      value={consumoDiario[chave] || 0}
                      onChange={(e) => atualizarConsumo(chave, e.target.value)}
                      style={{ width: '4rem', marginLeft: '0.25rem' }}
                    />
                  </label>
                  <button onClick={() => removerAlerta(chave)} style={{ color: 'red' }}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'center' }}>
          <button onClick={salvarAjustes} style={{ backgroundColor: '#10b981', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '700' }}>
            💾 Salvar Ajustes
          </button>
        </div>
      </div>
    </div>
  );
}

export default AjustesSistema;
