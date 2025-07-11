import React, { useState, useRef, useEffect } from 'react';

export default function OverflowInfo({ texto, infoTexto }) {
  const spanRef = useRef(null);
  const containerRef = useRef(null);
  const [overflow, setOverflow] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const verificar = () => {
      setOverflow(el.scrollWidth > el.clientWidth);
    };
    verificar();
    window.addEventListener('resize', verificar);
    return () => window.removeEventListener('resize', verificar);
  }, [texto]);

  useEffect(() => {
    const fechar = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false);
      }
    };
    document.addEventListener('click', fechar);
    return () => document.removeEventListener('click', fechar);
  }, []);

  const toggle = (ev) => {
    ev.stopPropagation();
    if (overflow || infoTexto) setAberto((o) => !o);
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        maxWidth: '100%',
        position: 'relative',
      }}
    >
      <span
        ref={spanRef}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {texto}
      </span>
      {(infoTexto || overflow) && (
        <img
          src="/icones/informacoes.png"
          alt="Informações"
          style={{
            width: 28,
            height: 28,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            boxShadow: 'none',
            marginLeft: 8,
          }}
          onClick={toggle}
        />
      )}
      {aberto && (infoTexto || overflow) && (
        <div
          style={{
            position: 'absolute',
            top: '-100%',
            left: 0,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: 6,
            padding: '8px 12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            minWidth: '240px',
            whiteSpace: 'normal',
          }}
        >
          {infoTexto || texto}
        </div>
      )}
    </div>
  );
}
