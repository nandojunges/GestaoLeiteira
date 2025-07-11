// src/pages/Animais/ImportarFichaTouro.jsx
import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { inserirTouroSQLite } from "../../utils/apiFuncoes.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ImportarFichaTouro({ onFechar, onSalvar }) {
  const [nomeTouro, setNomeTouro] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [previewTexto, setPreviewTexto] = useState("");
  const inputFileRef = useRef();
  const nomeRef = useRef();

  useEffect(() => {
    nomeRef.current?.focus();
    const handleTecla = (e) => {
      if (e.key === "Escape") onFechar();
      if (e.key === "Enter") salvarFicha();
    };
    window.addEventListener("keydown", handleTecla);
    return () => window.removeEventListener("keydown", handleTecla);
  }, []);

  const salvarFicha = async () => {
    if (!nomeTouro || !arquivo) {
      alert("Preencha o nome do touro e selecione o PDF.");
      return;
    }

    const readerArray = new FileReader();
    readerArray.onload = async function (e) {
      const typedarray = new Uint8Array(e.target.result);
      let textoExtraido = "";

      try {
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const textos = content.items.map(item => item.str).join(" ");
          textoExtraido += textos + "\n";
        }
      } catch (err) {
        console.warn("Não foi possível extrair texto do PDF, mas o arquivo será salvo.");
        textoExtraido = "(Texto não extraído, apenas PDF salvo.)";
      }

      const readerB64 = new FileReader();
      readerB64.onloadend = async function () {
        const base64data = readerB64.result;
        const dados = {
          nome: nomeTouro,
          texto: textoExtraido,
          arquivoBase64: base64data,
          dataUpload: new Date().toISOString(),
        };

        await inserirTouroSQLite(dados);
        onSalvar(nomeTouro);
        onFechar();
        window.dispatchEvent(new Event("dadosAnimalAtualizados"));
      };

      readerB64.readAsDataURL(arquivo);
    };

    readerArray.readAsArrayBuffer(arquivo);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>📎 Anexar Ficha do Touro</h2>

        <div style={{ marginTop: '1rem' }}>
          <label>Nome do Touro</label>
          <input
            ref={nomeRef}
            type="text"
            value={nomeTouro}
            onChange={(e) => setNomeTouro(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label>Selecione o arquivo PDF</label>
          <input
            ref={inputFileRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setArquivo(e.target.files[0])}
            style={inputStyle}
          />
        </div>

        {previewTexto && (
          <div style={{ marginTop: '1.5rem' }}>
            <label>Pré-visualização:</label>
            <div style={previewBox}>{previewTexto.slice(0, 1000)}...</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '1rem' }}>
          <button onClick={salvarFicha} style={botaoPrincipal}>💾 Anexar Ficha</button>
          <button onClick={onFechar} style={botaoCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '0.75rem',
  width: '100%',
  maxWidth: '500px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
};

const inputStyle = {
  width: '100%',
  marginTop: '0.3rem',
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  fontSize: '1rem'
};

const previewBox = {
  marginTop: '0.5rem',
  backgroundColor: '#f9fafb',
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  padding: '1rem',
  height: '150px',
  overflowY: 'auto',
  fontSize: '0.9rem',
  whiteSpace: 'pre-wrap'
};

const botaoPrincipal = {
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  padding: '0.6rem 1.5rem',
  borderRadius: '0.5rem',
  fontWeight: '600',
  fontSize: '1rem',
  cursor: 'pointer'
};

const botaoCancelar = {
  backgroundColor: '#fef2f2',
  color: '#991b1b',
  padding: '0.6rem 1.5rem',
  borderRadius: '0.5rem',
  border: '1px solid #fecaca',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer'
};
