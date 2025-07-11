import React from 'react';

export default function BotaoAcaoReprodutiva({ status, vaca, abrirFicha }) {
  const estiloIcone = {
    width: '36px',
    height: '36px',
    objectFit: 'contain'
  };
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {/* 🔵 Pós-parto (PEV) */}
      {status === '🔵 Pós-parto (PEV)' && (
        <>
          <button className="botao-editar">Registrar CIO</button>
          <button className="botao-editar">Iniciar Pré-sincronização</button>
          <button className="botao-editar">Registrar Ocorrência Clínica</button>
        </>
      )}

      {/* 🟢 Liberada para IA */}
      {status === '🟢 Liberada' && (
        <>
          <button className="botao-editar">Iniciar Protocolo IA</button>
          <button className="botao-editar">Registrar CIO</button>
          <button className="botao-editar">Registrar Ocorrência Clínica</button>
        </>
      )}

      {/* 🟠 Em protocolo */}
      {status === '🟠 Em protocolo' && (
        <>
          <button className="botao-editar">Registrar Etapa do Protocolo</button>
          <button className="botao-editar">Registrar Ocorrência Clínica</button>
        </>
      )}

      {/* 🟡 Aguardando diagnóstico */}
      {status === '🟡 Aguardando diagnóstico' && (
        <>
          <button className="botao-editar">Registrar Diagnóstico</button>
          <button className="botao-editar">Registrar Ocorrência Clínica</button>
        </>
      )}

      {/* ✅ Prenhe confirmada */}
      {status === '✅ Prenhe confirmada' && (
        <>
          <button className="botao-editar">Registrar Perda Embrionária</button>
          <button className="botao-editar">Registrar Ocorrência Clínica</button>
        </>
      )}

      {/* ❌ Vazia após diagnóstico */}
      {status === '❌ Vazia' && (
        <>
          <button className="botao-editar">Nova IA</button>
          <button className="botao-editar">Iniciar Novo Protocolo</button>
          <button className="botao-editar">Registrar Ocorrência Clínica</button>
        </>
      )}

      {/* Botão de ficha sempre presente */}
       <button className="botao-editar" onClick={() => abrirFicha(vaca)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/icones/fichaanimal.png" alt="Ficha Animal" style={estiloIcone} />
          <span>Ficha</span>
        </div>
      </button>
    </div>
  );
}
