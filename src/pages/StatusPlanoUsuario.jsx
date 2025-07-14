import { useEffect, useState } from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

export default function StatusPlanoUsuario() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const res = await api.get('/usuario/plano-status');
      setInfo(res.data);
    } catch (e) {
      toast.error('Erro ao obter status do plano');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  if (!info) {
    return <div className="p-4 text-center">Nenhuma informação encontrada.</div>;
  }

  const { plano, planoSolicitado, formaPagamento, status, dataLiberado, dataFimLiberacao } = info;

  let estado = 'gratuito';
  if (status === 'pendente') estado = 'pendente';
  else if (plano && plano !== 'gratis') estado = 'ativo';

  const estados = {
    pendente: {
      titulo: 'Solicitação pendente',
      descricao: `Plano solicitado: ${planoSolicitado || ''}`,
      Icon: Clock,
      cor: 'text-yellow-700',
      bg: 'bg-yellow-100',
    },
    ativo: {
      titulo: `Plano ${plano}`,
      descricao: `Pagamento por ${formaPagamento}`,
      Icon: CheckCircle,
      cor: 'text-green-700',
      bg: 'bg-green-100',
    },
    gratuito: {
      titulo: 'Plano gratuito',
      descricao: 'Você está utilizando o plano gratuito.',
      Icon: XCircle,
      cor: 'text-blue-700',
      bg: 'bg-blue-100',
    },
  };

  const cfg = estados[estado];

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold text-center">Status do Plano</h1>
      <p className="text-center text-sm">Acompanhe abaixo a situação do seu plano.</p>

      <div className={`rounded-lg p-6 flex flex-col items-center space-y-2 text-center ${cfg.bg}`}>
        <cfg.Icon size={48} className={cfg.cor} />
        <h2 className={`text-lg font-semibold ${cfg.cor}`}>{cfg.titulo}</h2>
        <p className="text-sm">{cfg.descricao}</p>
        {estado === 'ativo' && (
          <div className="text-xs space-y-1 mt-2">
            <p>Início: {dataLiberado ? new Date(dataLiberado).toLocaleDateString() : '-'}</p>
            <p>Fim: {dataFimLiberacao ? new Date(dataFimLiberacao).toLocaleDateString() : '-'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

