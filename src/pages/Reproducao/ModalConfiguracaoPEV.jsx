import React, { useState, useEffect } from "react";
import { buscarAnimais } from '../../utils/apiFuncoes.js'; // ✅ CORRETA
import { buscarTodos, adicionarItem } from '../../utils/backendApi';

export default function ModalConfiguracaoPEV({ onClose, onAplicar }) {
  const [diasPEV, setDiasPEV] = useState('');
  const [permitirPreSincronizacao, setPermitirPreSincronizacao] = useState(false);
  const [permitirSecagem, setPermitirSecagem] = useState(true);

  useEffect(() => {
    (async () => {
      const salvoLocal = localStorage.getItem('criterioDEL');
      if (salvoLocal) setDiasPEV(salvoLocal);
      const lista = await buscarTodos('configPEV');
      const config = lista[0] || {};
      if (config.diasPEV) setDiasPEV(String(config.diasPEV));
      if (typeof config.permitirPreSincronizacao === 'boolean')
        setPermitirPreSincronizacao(config.permitirPreSincronizacao);
      if (typeof config.permitirSecagem === 'boolean')
        setPermitirSecagem(config.permitirSecagem);
    })();
  }, []);

  const salvar = async () => {
    if (!diasPEV || isNaN(diasPEV)) {
      alert('Digite um número válido para DEL.');
      return;
    }
    const config = {
      diasPEV: Number(diasPEV),
      permitirPreSincronizacao,
      permitirSecagem,
    };
    localStorage.setItem('criterioDEL', diasPEV);
    localStorage.setItem('permitirPreSincronizacao', permitirPreSincronizacao);
    localStorage.setItem('permitirSecagem', permitirSecagem);
    await adicionarItem('configPEV', { id: 'cfg', ...config });
    window.dispatchEvent(new Event('configPEVAtualizado'));

    if (onAplicar) onAplicar(config);
    onClose();
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
    zIndex: 9999
  };

  const modal = {
    background: "#fff",
    borderRadius: "1rem",
    width: "400px",
    padding: "1.5rem",
    fontFamily: "Poppins, sans-serif"
  };

  const input = {
    width: "100%",
    margin: "0.5rem 0",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    border: "1px solid #ccc"
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ marginBottom: "1rem" }}>⚙️ Configurar Critérios de PEV</h2>

        <label>Dias para considerar PEV (DEL máximo):</label>
        <input
          type="number"
          value={diasPEV}
          onChange={(e) =>
            setDiasPEV(e.target.value.replace(/^0+/, ''))
          }
          style={input}
        />

        <div style={{ margin: "1rem 0" }}>
          <label>
            <input
              type="checkbox"
              checked={permitirPreSincronizacao}
              onChange={(e) => setPermitirPreSincronizacao(e.target.checked)}
            />{" "}
            Permitir Pré-sincronização
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            <input
              type="checkbox"
              checked={permitirSecagem}
              onChange={(e) => setPermitirSecagem(e.target.checked)}
            />{" "}
            Permitir Registrar Secagem
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button onClick={onClose} className="botao-cancelar">Cancelar</button>
          <button onClick={salvar} className="botao-acao">💾 Salvar</button>
        </div>
      </div>
    </div>
  );
}
