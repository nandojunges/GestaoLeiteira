import { useState, useEffect } from 'react';
import CardFinanceiro from './CardFinanceiro';
import '../../styles/painelFinanceiro.css';
import {
  buscarTodos,
  adicionarItem,
  atualizarItem,
  excluirItem,
} from "../../utils/backendApi";

export default function IndicadoresFinanceiros({ movs = [] }) {
  const listaSegura = Array.isArray(movs) ? movs : [];
  const [modal, setModal] = useState(null);
  const [litrosMes, setLitrosMes] = useState(0);
  const [preco, setPreco] = useState(2);

  useEffect(() => {
    async function carregarLitros() {
      const mesAtual = new Date().toISOString().slice(0, 7);
      let litros = 0;
      const medicoes = await buscarTodos('medicaoLeite');
      const medicoesSeguras = Array.isArray(medicoes) ? medicoes : [];
      medicoesSeguras.forEach((m) => {
        const data = (m.data || m.id || '').slice(0, 10);
        if (data.startsWith(mesAtual)) {
          const dados = m.dados || {};
          Object.values(dados).forEach((v) => {
            litros += parseFloat(v.total || 0);
          });
        }
      });
      setLitrosMes(Number(litros.toFixed(1)));
      const configs = await buscarTodos('config');
      const configSegura = Array.isArray(configs) ? configs : [];
      const precoItem = configSegura.find((c) => c.id === 'precoLitroLeite');
      if (precoItem) {
        setPreco(parseFloat(precoItem.valor || precoItem.preco || 2));
      }
    }
    carregarLitros();
  }, []);

  const mesAtual = new Date().toISOString().slice(0,7);
  const receitas = litrosMes * preco;
  const despesas = listaSegura
    .filter(m => m.tipo === 'Saída' && m.data.startsWith(mesAtual))
    .reduce((s,m) => s + m.valor,0);
  const lucro = receitas - despesas;
  const custoLitro = litrosMes > 0 ? despesas / litrosMes : 0;

  const cards = [
    { id:'receita', titulo:'Receita do mês', valor:receitas, emoji:'💵' },
    { id:'despesa', titulo:'Despesas do mês', valor:despesas, emoji:'🪙' },
    { id:'lucro', titulo:'Lucro estimado', valor:lucro, emoji:'📊' },
    { id:'custo', titulo:'Custo por litro', valor:custoLitro, emoji:'📈' }
  ];

  const formatar = v => v.toLocaleString('pt-BR',{ style:'currency', currency:'BRL' });

  return (
    <section className="painel-financeiro">
      {cards.map(c => (
        <CardFinanceiro
          key={c.id}
          titulo={c.titulo}
          icone={c.emoji}
          valor={c.id === 'custo' ? formatar(c.valor) + '/L' : formatar(c.valor)}
          tipo={c.id}
          onClick={() => setModal(c)}
        />
      ))}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={()=>setModal(null)}>
          <div className="bg-white p-4 rounded shadow w-80" onClick={e=>e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-2">{modal.titulo}</h3>
            <p className="mb-4">
              Valor: {modal.id === 'custo' ? formatar(modal.valor) + '/L' : formatar(modal.valor)}
            </p>
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>setModal(null)}>Fechar</button>
          </div>
        </div>
      )}
    </section>
  );
}

