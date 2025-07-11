import React, { useEffect, useState } from "react";
import GraficoCurvaLactacao from "./GraficoCurvaLactacao";
import SecaoCMT from "./SecaoCMT";
import SecaoCCS from "./SecaoCCS";
import CardBrixColostro from "./CardBrixColostro";

export default function FichaAnimalLeite({ animal }) {
  const [dadosLactacao, setDadosLactacao] = useState([]);
  const [ccs, setCCS] = useState([]);
  const [cmt, setCMT] = useState([]);
  const [brix, setBrix] = useState(null);

  useEffect(() => {
    const leite = Array.isArray(animal.leite) ? animal.leite : [];

    const ordenado = [...leite].sort((a, b) => new Date(a.data) - new Date(b.data));

    const comDEL = ordenado.map((dado) => {
      const dataParto = new Date(animal.ultimoParto);
      const dataMed = new Date(dado.data);
      const DEL = Math.floor((dataMed - dataParto) / (1000 * 60 * 60 * 24));
      return {
        ...dado,
        DEL,
        dataFormatada: new Date(dado.data).toLocaleDateString("pt-BR"),
        lactacao: dado.lactacao || 1, // Adiciona o campo lactacao, padrão 1 se não existir
      };
    });

    setDadosLactacao(comDEL);
    setCMT(animal?.cmt || []);
    setCCS(animal?.ccs || []);
    setBrix(animal?.brix || null);
  }, [animal]);

  return (
    <div className="p-4 space-y-10">

      {/* CURVA DE LACTAÇÃO */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Curva de Lactação</h2>
        <GraficoCurvaLactacao
          dadosLactacao={dadosLactacao}
          dataParto={animal.ultimoParto}
        />
      </section>

      {/* CMT */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Teste CMT</h2>
        <SecaoCMT cmt={cmt} />
      </section>

      {/* CCS */}
      <section>
        <h2 className="text-lg font-semibold mb-3">CCS Individual</h2>
        <SecaoCCS ccs={ccs} />
      </section>

      {/* BRIX */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Brix do Colostro</h2>
        <CardBrixColostro brix={brix} />
      </section>

    </div>
  );
}
