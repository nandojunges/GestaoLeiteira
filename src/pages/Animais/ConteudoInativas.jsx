import React, { useEffect, useState } from 'react';
import { carregarAnimaisDoLocalStorage, salvarAnimaisNoLocalStorage } from './utilsAnimais';
import '../../styles/tabelaModerna.css';
import '../../styles/botoes.css';

export default function ConteudoInativas() {
  const [vacasInativas, setVacasInativas] = useState([]);
  const [colunaHover, setColunaHover] = useState(null);

  useEffect(() => {
    const atualizar = () => {
      const todas = carregarAnimaisDoLocalStorage();
      const inativas = todas.filter(v => v.status === 'inativo');
      setVacasInativas(inativas);
    };
    atualizar();
    window.addEventListener("animaisAtualizados", atualizar);
    return () => window.removeEventListener("animaisAtualizados", atualizar);
  }, []);

  const reativarAnimal = (numero) => {
    const todas = carregarAnimaisDoLocalStorage();
    const atualizadas = todas.map((v) =>
      v.numero === numero ? { ...v, status: "ativo", saida: undefined } : v
    );
    salvarAnimaisNoLocalStorage(atualizadas);
    setVacasInativas(atualizadas.filter(v => v.status === 'inativo'));
  };

  const titulos = [
    "Número", "Brinco", "Nascimento", "Raça", "Categoria",
    "Motivo", "Observação", "Data Saída", "Ação"
  ];

  return (
    <div className="w-full px-8 py-6 font-sans">
      <h2 className="text-xl font-bold mb-6">❌ Animais Inativos</h2>

      <table className="tabela-padrao">
        <thead>
          <tr>
            {titulos.map((titulo, index) => (
              <th
                key={index}
                onMouseEnter={() => setColunaHover(index)}
                onMouseLeave={() => setColunaHover(null)}
                className={colunaHover === index ? 'coluna-hover' : ''}
              >
                {titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vacasInativas.map((vaca, index) => {
            const dados = [
              vaca.numero || '—',
              vaca.brinco || '—',
              vaca.nascimento || '—',
              vaca.raca || '—',
              vaca.categoria || '—',
              vaca.saida?.motivo || '—',
              vaca.saida?.observacao || '—',
              vaca.saida?.data || '—',
              <div className="flex justify-center">
                <button
                  className="botao-editar"
                  onClick={() => reativarAnimal(vaca.numero)}
                  title="Reativar"
                >
                  🔁 Reativar
                </button>
              </div>
            ];

            return (
              <tr key={index}>
                {dados.map((conteudo, colIdx) => (
                  <td key={colIdx} className={colunaHover === colIdx ? 'coluna-hover' : ''}>
                    {conteudo}
                  </td>
                ))}
              </tr>
            );
          })}

          {vacasInativas.length === 0 && (
            <tr>
              <td colSpan={titulos.length} className="text-center py-4 text-gray-500">
                Nenhum animal inativo registrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
