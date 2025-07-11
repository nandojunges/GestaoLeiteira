import React, { useEffect, useState } from "react";
import {
  buscarTodos,
  adicionarItem,
} from "../../utils/backendApi";

export default function ModalExamesSanitarios({ onFechar }) {
  const [dados, setDados] = useState({
    tipo: "",
    outroTipo: "",
    abrangencia: "",
    status: "Propriedade Não Certificada",
    validadeCertificado: "",
    certificado: null,
    dataUltimo: "",
    comprovante: null,
    animal: "",
  });
  const [listaAnimais, setListaAnimais] = useState([]);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onFechar?.();
    window.addEventListener("keydown", esc);
    (async () => {
      let animais = [];
      let bezerros = [];
      try {
        animais = await buscarTodos("animais");
      } catch (err) {
        if (err?.status === 404) {
          console.warn(
            "⚠️ Não foi possível carregar animais: rota /animais ainda não criada."
          );
        }
      }
      try {
        bezerros = await buscarTodos("bezerros");
      } catch (err) {
        if (err?.status === 404) {
          console.warn(
            "⚠️ Não foi possível carregar bezerros: rota /bezerros ainda não criada."
          );
        }
      }
      const nums = [...(animais || []), ...(bezerros || [])]
        .map((a) => a.numero)
        .filter((n) => n);
      setListaAnimais(nums);
    })();
    return () => window.removeEventListener("keydown", esc);
  }, [onFechar]);

  const atualizar = (campo, valor) => setDados((p) => ({ ...p, [campo]: valor }));

  const handleFile = (campo, file) => {
    if (!file) {
      atualizar(campo, null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => atualizar(campo, reader.result);
    reader.readAsDataURL(file);
  };

  const precisaStatus = (t) =>
    [
      "Brucelose",
      "Tuberculose",
      "Brucelose e Tuberculose (certificação conjunta)",
    ].includes(t);

  const calcularProxima = () => {
    if (!dados.dataUltimo) return "";
    const d = new Date(dados.dataUltimo);
    switch (dados.tipo) {
      case "Brucelose":
      case "Tuberculose":
        d.setFullYear(d.getFullYear() + 1);
        return d.toISOString().substring(0, 10);
      case "Brucelose e Tuberculose (certificação conjunta)":
        if (dados.validadeCertificado)
          return dados.validadeCertificado;
        d.setFullYear(d.getFullYear() + 1);
        return d.toISOString().substring(0, 10);
      case "Leptospirose":
        d.setMonth(d.getMonth() + 6);
        return d.toISOString().substring(0, 10);
      default:
        return "";
    }
  };

 const salvar = async () => {
    if (!dados.tipo || !dados.dataUltimo) {
      alert("Preencha os campos obrigatórios.");
      return;
    }
    const registro = {
      ...dados,
      nome:
        dados.tipo === "Outros (com campo livre)" && dados.outroTipo
          ? dados.outroTipo
          : dados.tipo,
      proximaObrigatoriedade: calcularProxima(),
    };
    try {
      const lista = await buscarTodos("examesSanitarios");
      const base = Array.isArray(lista) ? lista : [];
      const nova = [...base, registro];
      await adicionarItem("examesSanitarios", nova);
      onFechar?.();
    } catch (err) {
      if (err?.status === 404) {
        console.warn(
          "⚠️ Não foi possível carregar exames sanitários: rota /examesSanitarios ainda não criada."
        );
      }
    }
  };

  const input = () => ({
    padding: "0.6rem",
    border: "1px solid #ccc",
    borderRadius: "0.5rem",
    width: "100%",
    fontSize: "0.95rem",
  });

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>Controle de Exames</div>
        <div style={conteudo}>
          <div>
            <label>Tipo de Exame *</label>
            <select
              value={dados.tipo}
              onChange={(e) => atualizar("tipo", e.target.value)}
              style={input()}
            >
              <option value="">Selecione...</option>
              <option value="Brucelose">Brucelose</option>
              <option value="Tuberculose">Tuberculose</option>
              <option value="Brucelose e Tuberculose (certificação conjunta)">
                Brucelose e Tuberculose (certificação conjunta)
              </option>
              <option value="Leptospirose">Leptospirose</option>
              <option value="Tripanossoma">Tripanossoma</option>
              <option value="Babesiose">Babesiose</option>
              <option value="Outros (com campo livre)">Outros</option>
            </select>
          </div>

          {dados.tipo === "Outros (com campo livre)" && (
            <div>
              <label>Nome do Exame</label>
              <input
                value={dados.outroTipo}
                onChange={(e) => atualizar("outroTipo", e.target.value)}
                style={input()}
              />
            </div>
          )}

          <div>
            <label>Abrangência *</label>
            <select
              value={dados.abrangencia}
              onChange={(e) => atualizar("abrangencia", e.target.value)}
              style={input()}
            >
              <option value="">Selecione...</option>
              <option value="Propriedade inteira">Propriedade inteira</option>
              <option value="Animal específico">Animal específico</option>
              <option value="Animal novo em entrada">Animal novo em entrada</option>
            </select>
          </div>

          {(dados.abrangencia === "Animal específico" ||
            dados.abrangencia === "Animal novo em entrada") && (
            <div>
              <label>Animal vinculado</label>
              <input
                value={dados.animal}
                onChange={(e) => atualizar("animal", e.target.value)}
                list="listaAnimais"
                style={input()}
              />
              <datalist id="listaAnimais">
                {listaAnimais.map((n, i) => (
                  <option key={i} value={n} />
                ))}
              </datalist>
            </div>
          )}

          {precisaStatus(dados.tipo) && (
            <div>
              <label>Status da Propriedade</label>
              <select
                value={dados.status}
                onChange={(e) => atualizar("status", e.target.value)}
                style={input()}
              >
                <option value="Propriedade Não Certificada">Propriedade Não Certificada</option>
                <option value="Propriedade Certificada">Propriedade Certificada</option>
              </select>
            </div>
          )}

          {precisaStatus(dados.tipo) && dados.status === "Propriedade Certificada" && (
            <div>
              <label>Certificado da Propriedade</label>
              <input
                type="file"
                onChange={(e) => handleFile("certificado", e.target.files[0])}
                style={input()}
              />
              <div style={{ marginTop: "0.5rem" }}>
                <label>Validade do Certificado</label>
                <input
                  type="date"
                  value={dados.validadeCertificado}
                  onChange={(e) => atualizar("validadeCertificado", e.target.value)}
                  style={input()}
                />
              </div>
            </div>
          )}

          <div>
            <label>Data do Último Exame *</label>
            <input
              type="date"
              value={dados.dataUltimo}
              onChange={(e) => atualizar("dataUltimo", e.target.value)}
              style={input()}
            />
          </div>

          <div>
            <label>Comprovante do Exame</label>
            <input
              type="file"
              onChange={(e) => handleFile("comprovante", e.target.files[0])}
              style={input()}
            />
          </div>

          {calcularProxima() && (
            <div>
              <label>Próxima obrigatoriedade</label>
              <input type="date" value={calcularProxima()} readOnly style={input()} />
            </div>
          )}

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}
          >
            <button onClick={onFechar} style={botaoCancelar}>
              Cancelar
            </button>
            <button onClick={salvar} style={botaoConfirmar}>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  background: "#fff",
  borderRadius: "1rem",
  width: "480px",
  maxHeight: "90vh",
  overflowY: "auto",
  fontFamily: "Poppins, sans-serif",
  display: "flex",
  flexDirection: "column",
};

const header = {
  background: "#1e40af",
  color: "white",
  padding: "1rem 1.5rem",
  fontWeight: "bold",
  fontSize: "1.1rem",
  borderTopLeftRadius: "1rem",
  borderTopRightRadius: "1rem",
  textAlign: "center",
};

const conteudo = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const botaoCancelar = {
  background: "#f3f4f6",
  border: "1px solid #d1d5db",
  padding: "0.6rem 1.2rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "500",
};

const botaoConfirmar = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "0.6rem 1.4rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: "600",
};
