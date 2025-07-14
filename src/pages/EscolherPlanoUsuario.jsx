import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import '../styles/botoes.css';

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
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold text-center">Escolher Plano</h1>
      <p className="text-center text-sm">
        Escolha o plano desejado e informe a forma de pagamento.
      </p>

      <div className="flex flex-col gap-2">
        <label className="font-medium">Plano</label>
        <select
          value={plano}
          onChange={(e) => setPlano(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Selecione...</option>
          <option value="basico">Básico</option>
          <option value="intermediario">Intermediário</option>
          <option value="completo">Completo</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-medium">Forma de pagamento</label>
        <select
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value)}
          className="border rounded p-2"
        >
          <option value="pix">Pix</option>
          <option value="cartao">Cartão</option>
          <option value="dinheiro">Dinheiro</option>
        </select>
      </div>

      <button
        className="botao-acao w-full"
        onClick={solicitar}
        disabled={!plano || enviando}
      >
        {enviando ? 'Enviando...' : 'Solicitar Plano'}
      </button>
    </div>
  );
}
