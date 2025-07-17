import { useNavigate } from 'react-router-dom';

export default function EscolherPlanoInicio() {
  const planos = [
    {
      id: 'teste_gratis',
      nome: 'Teste',
      preco: 'R$0',
      recursos: ['Acesso por 7 dias'],
    },
    {
      id: 'basico',
      nome: 'Básico',
      preco: 'R$29',
      recursos: ['Suporte simples', 'Até 2 usuários'],
    },
    {
      id: 'intermediario',
      nome: 'Intermediário',
      preco: 'R$59',
      recursos: ['Suporte completo', '5 usuários', 'Controle de bezerras'],
    },
    {
      id: 'completo',
      nome: 'Completo',
      preco: 'R$89',
      recursos: ['Todos os recursos disponíveis'],
    },
  ];

  const navigate = useNavigate();

  const escolher = (id) => {
    navigate(`/cadastro?plano=${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold text-center">Escolha seu Plano</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {planos.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg shadow-sm p-4 flex flex-col items-center text-center space-y-2"
          >
            <h2 className="text-lg font-semibold">{p.nome}</h2>
            <div className="font-bold">{p.preco}</div>
            <ul className="text-sm flex-1 list-disc pl-4">
              {p.recursos.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <button
              className="botao-acao mt-2"
              onClick={() => escolher(p.id)}
            >
              Escolher este plano
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
