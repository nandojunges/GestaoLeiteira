import React, { useState, useEffect } from 'react';
import { carregarAnimaisDoLocalStorage, calcularDEL } from './utilsAnimais';
import ModalEditarAnimal from './ModalEditarAnimal';
import ModalHistoricoCompleto from './ModalHistoricoCompleto';
import '../../styles/tabelaModerna.css';
import '../../styles/botoes.css';

function calcularPrevisaoParto(dataIA) {
  if (!dataIA || dataIA.length !== 10) return null;
  const [dia, mes, ano] = dataIA.split('/');
  const data = new Date(`${ano}-${mes}-${dia}`);
  data.setDate(data.getDate() + 280);
  return data.toLocaleDateString('pt-BR');
}

export default function ConteudoPlantel() {
  const [vacas, setVacas] = useState([]);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [animalFicha, setAnimalFicha] = useState(null);
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroRaca, setFiltroRaca] = useState('');
  const [filtroMinPartos, setFiltroMinPartos] = useState(0);
  const [colunaHover, setColunaHover] = useState(null);

  useEffect(() => {
    const atualizar = () => {
      const animais = carregarAnimaisDoLocalStorage();
      const bezerros = JSON.parse(localStorage.getItem("bezerros") || "[]");
      const todos = [...animais, ...bezerros];
      setVacas(todos);
    };
    atualizar();
    window.addEventListener("animaisAtualizados", atualizar);
    return () => window.removeEventListener("animaisAtualizados", atualizar);
  }, []);

  const abrirFicha = (vaca) => {
    setAnimalFicha(vaca);
    setMostrarFicha(true);
  };

  const vacasFiltradas = vacas
    .filter(v => !v.status || v.status !== "inativo")
    .filter(v => {
      const atendeCategoria = !filtroCategoria || (v.categoria || '').toLowerCase() === filtroCategoria.toLowerCase();
      const atendeRaca = !filtroRaca || (v.raca || '').toLowerCase().includes(filtroRaca.toLowerCase());
      const atendePartos = !filtroMinPartos || (parseInt(v.numeroPartos || '0') >= filtroMinPartos);
      return atendeCategoria && atendeRaca && atendePartos;
    });

  const titulos = [
    "Número", "Brinco", "Lactações", "DEL", "Categoria", "Idade",
    "Últ. IA", "Parto", "Raça", "Pai", "Mãe", "Previsão Parto", "Ação"
  ];

  return (
    <>
      <div className="w-full px-8 py-6 font-sans">
        {/* Filtros */}
        <div className="flex flex-wrap gap-6 items-end mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoria</label>
            <select
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todas</option>
              <option value="Bezerro(a)">Bezerro(a)</option>
              <option value="bezerro">bezerro</option>
              <option value="Novilho(a)">Novilho(a)</option>
              <option value="Novilha">Novilha</option>
              <option value="Adulto(a)">Adulto(a)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Raça</label>
            <input
              type="text"
              value={filtroRaca}
              onChange={e => setFiltroRaca(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Digite a raça"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mínimo de lactações</label>
            <input
              type="number"
              min="0"
              value={filtroMinPartos}
              onChange={e => setFiltroMinPartos(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 w-24 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Tabela */}
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
            {vacasFiltradas.map((vaca, index) => {
              // 🟡 Buscar último parto: preferir campo direto, mas também procurar no array de partos
              const ultimoParto =
                vaca.ultimoParto ||
                (vaca.partos && vaca.partos.length > 0 ? vaca.partos[vaca.partos.length - 1].data : '—');

              const dados = [
                vaca.numero,
                vaca.brinco,
                vaca.numeroPartos ?? '—',
                calcularDEL(ultimoParto !== '—' ? ultimoParto : null),
                vaca.categoria,
                vaca.idade,
                vaca.ultimaIA || '—',
                ultimoParto,
                vaca.raca,
                vaca.nomeTouro || vaca.pai || '—',
                vaca.nomeMae || vaca.mae || '—',
                calcularPrevisaoParto(vaca.ultimaIA) || '—',
                <div className="flex gap-2 justify-center">
                  <button className="botao-editar" onClick={() => setAnimalSelecionado(vaca)}>Editar</button>
                  <button className="botao-editar" onClick={() => abrirFicha(vaca)}>📁 Ficha</button>
                </div>
              ];

              return (
                <tr key={index} className={vaca.statusGestacao === 'positiva' ? 'tr-prenha' : ''}>
                  {dados.map((conteudo, colIdx) => (
                    <td key={colIdx} className={colunaHover === colIdx ? 'coluna-hover' : ''}>
                      {conteudo}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Modais */}
        {animalSelecionado && (
          <ModalEditarAnimal
            animal={animalSelecionado}
            onFechar={() => setAnimalSelecionado(null)}
            onSalvar={() => {
              setAnimalSelecionado(null);
              const animais = carregarAnimaisDoLocalStorage();
              const bezerros = JSON.parse(localStorage.getItem("bezerros") || "[]");
              setVacas([...animais, ...bezerros]);
            }}
          />
        )}
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
