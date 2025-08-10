import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Rocket, Crown, Gift } from 'lucide-react';
import api from '../../api';
import ModalPlanoSelecionado from '../ModalPlanoSelecionado';
import { toast } from 'react-toastify';
import jwtDecode from 'jwt-decode';
import './EscolherPlano.css';

export default function EscolherPlanoUnified({ mode, title, subtitle, admin = false }) {
  const navigate = useNavigate();
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const planosCadastro = [
    { id: 'teste_gratis', nome: 'Teste Grátis', descricao: 'Aproveite 7 dias gratuitamente', Icon: Gift },
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

  const planosInicio = [
    {
      id: 'teste_gratis',
      nome: 'Teste Grátis',
      preco: 'R$0',
      cor: '#10b981',
      recursos: ['Acesso por 7 dias'],
    },
    {
      id: 'basico',
      nome: 'Básico',
      preco: 'R$29',
      cor: '#3b82f6',
      recursos: ['Suporte simples', 'Até 2 usuários'],
    },
    {
      id: 'intermediario',
      nome: 'Intermediário',
      preco: 'R$59',
      cor: '#f59e0b',
      recursos: ['Suporte completo', '5 usuários', 'Controle de bezerras'],
    },
    {
      id: 'completo',
      nome: 'Completo',
      preco: 'R$89',
      cor: '#8b5cf6',
      recursos: ['Todos os recursos disponíveis'],
    },
  ];

  const planos = mode === 'inicio'
    ? planosInicio
    : mode === 'usuario'
    ? planosCadastro.filter((p) => p.id !== 'teste_gratis')
    : planosCadastro;

  const handleSelect = (p) => {
    if (mode === 'inicio') {
      navigate(`/cadastro?plano=${p.id}`);
    } else {
      setPlanoSelecionado(p);
    }
  };

  const finalizar = async (formaPagamento) => {
    if (!planoSelecionado) return;
    setEnviando(true);
    try {
      if (mode === 'cadastro') {
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
      } else {
        if (admin) {
          const token = localStorage.getItem('token');
          const { idProdutor } = jwtDecode(token);
          await api.patch(`/admin/alterar-plano/${idProdutor}`, {
            planoSolicitado: planoSelecionado.id,
            formaPagamento,
          });
          alert('Solicitação enviada');
        } else {
          await api.patch('/usuario/solicitar-plano', {
            planoSolicitado: planoSelecionado.id,
            formaPagamento,
          });
          toast.success('Seu pedido foi enviado. Aguarde a aprovação.');
        }
        setPlanoSelecionado(null);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.erro || err.message || 'Erro ao solicitar plano';
      if (mode === 'usuario' && !admin) toast.error(msg);
      else alert(msg);
    } finally {
      setEnviando(false);
    }
  };

  if (mode === 'inicio') {
    return (
      <div className="pagina-escolher-plano">
        <div className="painel-planos">
          <h1 className="titulo">{title || 'Escolha seu Plano'}</h1>
          <div className="grid-planos">
            {planos.map((p) => (
              <div key={p.id} className="card-plano-modern">
                <div className="faixa-superior" style={{ backgroundColor: p.cor }} />
                <h2>{p.nome}</h2>
                <div className="preco">{p.preco}</div>
                <ul className="lista-beneficios">
                  {p.recursos.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <button
                  className="btn-escolher-moderno"
                  style={{ backgroundColor: p.cor }}
                  onClick={() => handleSelect(p)}
                >
                  Selecionar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold text-center">{title || 'Escolher Plano'}</h1>
      {subtitle && <p className="text-center text-sm">{subtitle}</p>}

      <div className={`grid grid-cols-1 md:grid-cols-${mode === 'usuario' ? 3 : 4} gap-4`}>
        {planos.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg shadow-sm p-4 flex flex-col items-center text-center space-y-2 hover:shadow-md transition cursor-pointer"
            onClick={() => handleSelect(p)}
          >
            {p.Icon && <p.Icon size={36} className="text-blue-600" />}
            <h2 className="text-lg font-semibold">{p.nome}</h2>
            <p className="text-sm flex-1">{p.descricao}</p>
            <span className="text-sm font-medium text-blue-600">Selecionar</span>
          </div>
        ))}
      </div>

      {planoSelecionado && planoSelecionado.id === 'teste_gratis' && mode === 'cadastro' && (
        <div className="text-center space-y-4">
          <p>Você selecionou o teste grátis por 7 dias.</p>
          <button className="botao-acao" disabled={enviando} onClick={() => finalizar(null)}>
            Confirmar
          </button>
          <button className="botao-cancelar" onClick={() => setPlanoSelecionado(null)}>
            Cancelar
          </button>
        </div>
      )}

      {planoSelecionado && !(planoSelecionado.id === 'teste_gratis' && mode === 'cadastro') && (
        <ModalPlanoSelecionado
          plano={planoSelecionado}
          onFechar={() => setPlanoSelecionado(null)}
          onConfirmar={finalizar}
          enviando={enviando}
        />
      )}
    </div>
  );
}
