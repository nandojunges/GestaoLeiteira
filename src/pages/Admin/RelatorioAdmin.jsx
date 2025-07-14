import { useEffect, useState } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';

export default function RelatorioAdmin() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await api.get('/admin/relatorio-planos');
      setDados(res.data);
    } catch (e) {
      toast.error('Falha ao carregar relatório');
    } finally {
      setCarregando(false);
    }
  };

  const formatarValor = v =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (!dados) {
    return <div className="p-4">{carregando ? 'Carregando...' : ''}</div>;
  }

  const { quantidadePorPlano, usuariosPorStatus, pagamentosEsteMes, valorTotalArrecadado } = dados;

  const cores = {
    basico: 'bg-green-200',
    intermediario: 'bg-yellow-200',
    completo: 'bg-blue-200',
    teste: 'bg-gray-200'
  };

  const icones = {
    basico: '📄',
    intermediario: '📊',
    completo: '🚀',
    teste: '🧪'
  };

  return (
    <div className="p-4 space-y-6 font-poppins">
      <h1 className="text-xl font-bold">Relatório Administrativo</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(quantidadePorPlano).map(([plano, qtd]) => (
          <div
            key={plano}
            className={`${cores[plano]} p-4 rounded shadow flex items-center justify-between`}
          >
            <span className="text-lg font-semibold flex items-center gap-2">
              <span>{icones[plano]}</span> {plano}
            </span>
            <span className="text-2xl font-bold">{qtd}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-100 p-4 rounded shadow flex justify-between items-center">
          <span className="font-semibold">Usuários ativos</span>
          <span className="text-xl font-bold">{usuariosPorStatus.ativo}</span>
        </div>
        <div className="bg-red-100 p-4 rounded shadow flex justify-between items-center">
          <span className="font-semibold">Bloqueados</span>
          <span className="text-xl font-bold">{usuariosPorStatus.bloqueado}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-indigo-100 p-4 rounded shadow flex justify-between items-center">
          <span className="font-semibold">Pagamentos aprovados no mês</span>
          <span className="text-xl font-bold">{pagamentosEsteMes}</span>
        </div>
        <div className="bg-teal-100 p-4 rounded shadow flex justify-between items-center">
          <span className="font-semibold">Total arrecadado</span>
          <span className="text-xl font-bold">{formatarValor(valorTotalArrecadado)}</span>
        </div>
      </div>
    </div>
  );
}
