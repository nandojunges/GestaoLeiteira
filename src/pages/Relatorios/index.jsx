import { useState } from 'react';
import SubAbasRelatorios from './SubAbasRelatorios';
import RelatorioFinanceiro from './RelatorioFinanceiro';
import RelatorioProducaoLeite from './RelatorioProducaoLeite';
import RelatorioReprodutivo from './RelatorioReprodutivo';
import RelatorioSanitario from './RelatorioSanitario';
import RelatorioMovimentacaoAnimais from './RelatorioMovimentacaoAnimais';
import RelatorioEstoqueConsumo from './RelatorioEstoqueConsumo';

export default function Relatorios() {
  const [aba, setAba] = useState('financeiro');

  const renderizar = () => {
    switch (aba) {
      case 'financeiro':
        return <RelatorioFinanceiro />;
      case 'leite':
        return <RelatorioProducaoLeite />;
      case 'reprodutivo':
        return <RelatorioReprodutivo />;
      case 'sanitario':
        return <RelatorioSanitario />;
      case 'movAnimais':
        return <RelatorioMovimentacaoAnimais />;
      case 'estoque':
        return <RelatorioEstoqueConsumo />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full px-4 py-2 font-poppins">
      <SubAbasRelatorios abaAtiva={aba} setAbaAtiva={setAba} />
      <div className="mt-4">{renderizar()}</div>
    </div>
  );
}