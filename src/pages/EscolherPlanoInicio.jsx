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
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        backgroundImage: "url('/icones/telafundo.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '800px',
          width: '100%',
        }}
      >
        <h1 className="text-xl font-bold text-center mb-4">Escolha seu Plano</h1>
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
              <button className="botao-acao mt-2" onClick={() => escolher(p.id)}>
                Selecionar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
