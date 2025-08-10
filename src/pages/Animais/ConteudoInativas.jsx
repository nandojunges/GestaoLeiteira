import React, { useState, useEffect } from 'react';
import { salvarAnimais, buscarTodosAnimais } from '../../api';
import { carregarMovimentacoes, excluirMovimentoFinanceiro } from '../../utils/financeiro';
import ModalHistoricoCompleto from './ModalHistoricoCompleto';
import '../../styles/tabelaModerna.css';
import '../../styles/botoes.css';

export default function ConteudoInativas({ animais = [], onAtualizar }) {
  const [lista, setLista] = useState(() =>
    (Array.isArray(animais) ? animais : []).filter(a => a.status === 'inativo')
  );
  const [animalFicha, setAnimalFicha] = useState(null);
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [colunaHover, setColunaHover] = useState(null);

  const carregar = async () => {
    const dados = await buscarTodosAnimais();
    const filtrados = (Array.isArray(dados) ? dados : []).filter(
      a => a.status === 'inativo'
    );
    setLista(filtrados);
  };

  useEffect(() => {
    carregar();
    window.addEventListener('animaisAtualizados', carregar);
    return () => window.removeEventListener('animaisAtualizados', carregar);
  }, []);

  const abrirFicha = (animal) => {
    setAnimalFicha(animal);
    setMostrarFicha(true);
  };

  const reativarAnimal = async (numero) => {
    const todos = await buscarTodosAnimais();
    const atualizadas = (Array.isArray(todos) ? todos : []).map((v) =>
      v.numero === numero
        ? {
            ...v,
            status: 'ativo',
            saida: undefined,
            motivoSaida: undefined,
            dataSaida: undefined,
            valorVenda: undefined,
            observacoesSaida: undefined,
          }
        : v
    );

    await salvarAnimais(atualizadas);

    const movimentos = await carregarMovimentacoes();
    for (const m of movimentos) {
      if (
        String(m.numeroAnimal) === String(numero) &&
        /Venda da vaca/i.test(m.descricao || '')
      ) {
        await excluirMovimentoFinanceiro(m.id);
      }
    }

    onAtualizar?.(atualizadas);
    carregar();
  };

  // Adiciona coluna 'Tipo de Saída' antes de 'Motivo'
  const titulos = [
    'Número',
    'Categoria',
    'Tipo de Saída',
    'Motivo',
    'Data',
    'Valor',
    'Observações',
    'Ações',
  ];

  return (
    <>
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
          {lista.map((animal, index) => {
            const formatarData = (d) => {
              if (!d) return '—';
              if (d.includes('/')) return d;
              const dt = new Date(d);
              return isNaN(dt) ? d : dt.toLocaleDateString('pt-BR');
            };

            const formatarValor = (v) => {
              if (v === null || v === undefined || v === '') return '—';
              const num =
                typeof v === 'number'
                  ? v
                  : parseFloat(String(v).replace(/[^0-9,.-]/g, '').replace(',', '.'));
              return isNaN(num)
                ? v
                : num.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  });
            };

            const dados = [
              animal.numero || animal.brinco || '—',
              animal.categoria || animal.tipo || '—',
              // Exibe o tipo de saída (venda, morte, doação etc.)
              animal.tipoSaida || animal.saida?.tipo || '—',
              animal.motivoSaida || animal.saida?.motivo || '—',
              formatarData(animal.dataSaida || animal.saida?.data),
              formatarValor(
                animal.valorVenda ||
                  animal.valorSaida ||
                  animal.saida?.valor
              ),
              animal.observacoesSaida || animal.saida?.observacao || '—',
            ];

            const acoes = (
              <div className="flex gap-2 justify-center">
                <button
                  className="botao-editar"
                  onClick={() => abrirFicha(animal)}
                  title="Ver Ficha completa do animal"
                >
                  📋 Ver Ficha
                </button>
                <button
                  className="botao-editar"
                  onClick={() => reativarAnimal(animal.numero)}
                  title="Reativar este animal"
                >
                  🔁 Reativar
                </button>
              </div>
            );

            return (
              <tr key={index}>
                {dados.map((conteudo, colIdx) => (
                  <td key={colIdx} className={colunaHover === colIdx ? 'coluna-hover' : ''}>
                    {conteudo}
                  </td>
                ))}
                <td className="coluna-acoes">{acoes}</td>
              </tr>
            );
          })}

          {lista.length === 0 && (
            <tr>
              <td colSpan={titulos.length} className="text-center py-4 text-gray-500">
                Nenhum animal inativo registrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {mostrarFicha && animalFicha && (
      <ModalHistoricoCompleto
        animal={animalFicha}
        onClose={() => {
          setMostrarFicha(false);
          setAnimalFicha(null);
        }}
      />
    )}
    </>
  );
}
