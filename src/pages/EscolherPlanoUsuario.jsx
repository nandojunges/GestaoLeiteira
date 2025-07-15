import { useState } from 'react';
import { toast } from 'react-toastify';
import { Star, Rocket, Crown } from 'lucide-react';
import api from '../api';
import ModalPlanoSelecionado from '../components/ModalPlanoSelecionado';

export default function EscolherPlanoUsuario() {
  const planos = [
    {
      id: 'basico',
      nome: 'Básico',
      descricao: 'Funcionalidades essenciais',
      Icon: Star,
    },
    {
      id: 'intermediario',
      nome: 'Intermediário',
      descricao: 'Inclui controle de bezerras, reprodução e estoque',
      Icon: Rocket,
    },
    {
      id: 'completo',
      nome: 'Completo',
      descricao: 'Tudo do intermediário + relatórios e gráficos avançados',
      Icon: Crown,
    },
  ];

  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const solicitar = async (formaPagamento) => {
    if (!planoSelecionado) return;
    setEnviando(true);
    try {
      await api.patch('/usuario/solicitar-plano', {
        planoSolicitado: planoSelecionado.id,
        formaPagamento,
      });
      toast.success('Seu pedido foi enviado. Aguarde a aprovação.');
      setPlanoSelecionado(null);
    } catch (err) {
      toast.error(
        err.response?.data?.error || err.message || 'Erro ao solicitar plano'
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold text-center">Escolher Plano</h1>
      <p className="text-center text-sm">
        Escolha o plano desejado e informe a forma de pagamento.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {planos.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg shadow-sm p-4 flex flex-col items-center text-center space-y-2 hover:shadow-md transition cursor-pointer"
            onClick={() => setPlanoSelecionado(p)}
          >
            <p.Icon size={36} className="text-blue-600" />
            <h2 className="text-lg font-semibold">{p.nome}</h2>
            <p className="text-sm flex-1">{p.descricao}</p>
            <span className="text-sm font-medium text-blue-600">Selecionar</span>
          </div>
        ))}
      </div>


      {planoSelecionado && (
        <ModalPlanoSelecionado
          plano={planoSelecionado}
          onFechar={() => setPlanoSelecionado(null)}
          onConfirmar={solicitar}
        />
      )}
    </div>
  );
}
