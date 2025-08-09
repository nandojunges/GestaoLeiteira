import { useState } from 'react';
import { Star, Rocket, Crown, Gift } from 'lucide-react';
import api from '../../api';
import ModalPlanoSelecionado from '../ModalPlanoSelecionado';
import { useNavigate } from 'react-router-dom';

export default function EscolherPlanoCadastro() {
  const planos = [
    {
      id: 'teste_gratis',
      nome: 'Teste Grátis',
      descricao: 'Aproveite 7 dias gratuitamente',
      Icon: Gift,
    },
    { id: 'basico', nome: 'Básico', descricao: 'Funcionalidades essenciais', Icon: Star },
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
  const navigate = useNavigate();

  const finalizar = async (formaPagamento) => {
    if (!planoSelecionado) return;
    setEnviando(true);
    try {
      const token = localStorage.getItem('tokenCadastro');
      await api.post('/auth/finalizar-cadastro', {
        token,
        plano: planoSelecionado.id,
        formaPagamento,
      });
      alert('Cadastro finalizado. Aguarde aprovação.');
      localStorage.removeItem('tokenCadastro');
      localStorage.removeItem('emailCadastro');
      localStorage.removeItem('dadosCadastro');
      navigate('/login');
    } catch (err) {
      alert(
        err.response?.data?.erro || err.response?.data?.error || 'Erro ao finalizar cadastro'
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold text-center">Escolha seu Plano</h1>
      <p className="text-center text-sm">Selecione o plano desejado para concluir o cadastro.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {planoSelecionado && planoSelecionado.id !== 'teste_gratis' && (
        <ModalPlanoSelecionado
          plano={planoSelecionado}
          onFechar={() => setPlanoSelecionado(null)}
          onConfirmar={finalizar}
        />
      )}

      {planoSelecionado && planoSelecionado.id === 'teste_gratis' && (
        <div className="text-center space-y-4">
          <p>Você selecionou o teste grátis por 7 dias.</p>
          <button
            className="botao-acao"
            disabled={enviando}
            onClick={() => finalizar(null)}
          >
            Confirmar
          </button>
          <button className="botao-cancelar" onClick={() => setPlanoSelecionado(null)}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
