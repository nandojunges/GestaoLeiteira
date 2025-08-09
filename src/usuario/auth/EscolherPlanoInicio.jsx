import { useNavigate } from 'react-router-dom';
import './EscolherPlano.css';

export default function EscolherPlanoInicio() {
  const planos = [
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

  const navigate = useNavigate();

  const escolher = (id) => {
    navigate(`/cadastro?plano=${id}`);
  };

  return (
    <div className="pagina-escolher-plano">
      <div className="painel-planos">
        <h1 className="titulo">Escolha seu Plano</h1>
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
                onClick={() => escolher(p.id)}
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
