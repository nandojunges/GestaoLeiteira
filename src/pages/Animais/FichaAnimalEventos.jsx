import React from "react";

export default function FichaAnimalEventos({ animal }) {
  const eventos = Array.isArray(animal?.historico?.ocorrencias)
    ? animal.historico.ocorrencias
    : Array.isArray(animal.eventos)
    ? animal.eventos
    : [];
  const tratamentos = Array.isArray(animal?.historico?.tratamentos)
    ? animal.historico.tratamentos
    : Array.isArray(animal.tratamentos)
    ? animal.tratamentos
    : [];

  if (eventos.length === 0 && tratamentos.length === 0) {
    return (
      <p style={{ fontStyle: "italic", color: "#777" }}>
        Sem eventos ou tratamentos registrados.
      </p>
    );
  }

  return (
    <>
      {eventos.map((e, i) => (
        <p key={`e-${i}`}>
          📍 <strong>{e.data}</strong> - {e.tipo}: {e.descricao}
        </p>
      ))}
      {tratamentos.map((t, i) => (
        <p key={`t-${i}`}>
          💊 <strong>{t.data}</strong> - {t.nome} ({t.principioAtivo})
        </p>
      ))}
    </>
  );
}
