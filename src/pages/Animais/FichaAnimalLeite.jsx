import React from "react";

export default function FichaAnimalLeite({ animal }) {
  const leite = Array.isArray(animal.leite) ? animal.leite : [];

  return leite.length > 0 ? (
    <ul style={{ paddingLeft: "1.2rem" }}>
      {leite.map((l, i) => (
        <li key={i}><strong>{l.data}</strong>: {l.litros} litros</li>
      ))}
    </ul>
  ) : (
    <p style={{ fontStyle: "italic", color: "#777" }}>
      Sem registros de produção de leite.
    </p>
  );
}
