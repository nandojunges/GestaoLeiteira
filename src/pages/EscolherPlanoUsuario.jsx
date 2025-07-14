import { useState } from 'react';
import { toast } from 'react-toastify';
import { Star, Rocket, Crown } from 'lucide-react';
import api from '../api';

export default function EscolherPlanoUsuario() {
  const [plano, setPlano] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [enviando, setEnviando] = useState(false);

  const solicitar = async () => {
    if (!plano) return;
    setEnviando(true);
    try {
      await api.post('/usuario/solicitar-plano', {
        plano,
        formaPagamento,
      });
      toast.success('Plano solicitado com sucesso. Aguarde aprovação.');
      setPlano('');
      setFormaPagamento('pix');
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
        {[
          {
            id: 'basico',
            nome: 'Básico',
            descricao: 'Funcionalidades essenciais',
            Icon: Star,
          },
          {
            id: 'intermediario',
            nome: 'Intermediário',
            descricao:
              'Inclui controle de bezerras, reprodução e estoque',
            Icon: Rocket,
          },
          {
            id: 'completo',
            nome: 'Completo',
            descricao:
              'Tudo do intermediário + relatórios e gráficos avançados',
            Icon: Crown,
          },
        ].map((p) => (
          <div
            key={p.id}
            onClick={() => setPlano(p.id)}
            className={`cursor-pointer border rounded-lg shadow-sm p-4 flex flex-col items-center text-center space-y-2 transition ${
              plano === p.id
                ? 'border-blue-600 ring-2 ring-blue-500'
                : 'border-gray-300 hover:shadow-md'
            }`}
          >
            <p.Icon size={36} className="text-blue-600" />
            <h2 className="text-lg font-semibold">{p.nome}</h2>
            <p className="text-sm flex-1">{p.descricao}</p>
            <span
              className={`text-sm font-medium ${
                plano === p.id ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {plano === p.id ? 'Selecionado' : 'Selecionar'}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="font-medium">Forma de pagamento</label>
        <div className="flex gap-4">
          {['pix', 'cartao', 'dinheiro'].map((fp) => (
            <label key={fp} className="flex items-center gap-1">
              <input
                type="radio"
                name="formaPagamento"
                value={fp}
                checked={formaPagamento === fp}
                onChange={(e) => setFormaPagamento(e.target.value)}
              />
              {fp.charAt(0).toUpperCase() + fp.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        onClick={solicitar}
        disabled={!plano || enviando}
      >
        {enviando ? 'Enviando...' : 'Solicitar Plano'}
      </button>
    </div>
  );
}
