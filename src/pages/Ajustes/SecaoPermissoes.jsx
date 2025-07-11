import { useContext, useState } from 'react';
import { ConfiguracaoContext } from '../../context/ConfiguracaoContext';

export default function SecaoPermissoes() {
  const { config, setConfig } = useContext(ConfiguracaoContext);
  const [novo, setNovo] = useState('');

  const adicionar = () => {
    if (!novo) return;
    const lista = config.permissoes.includes(novo)
      ? config.permissoes
      : [...config.permissoes, novo];
    setConfig({ ...config, permissoes: lista });
    setNovo('');
  };

  const remover = (usuario) => {
    setConfig({
      ...config,
      permissoes: config.permissoes.filter((u) => u !== usuario),
    });
  };

  return (
    <section className="bg-white shadow rounded p-4 space-y-4">
      <h2 className="text-xl font-semibold">Permissões</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          placeholder="Email ou usuário"
          className="border rounded px-2 py-1 flex-1"
        />
        <button onClick={adicionar} className="bg-blue-500 text-white px-3 rounded">
          Conceder acesso
        </button>
      </div>
      <ul className="list-disc pl-5 space-y-1">
        {config.permissoes.map((p) => (
          <li key={p} className="flex justify-between items-center">
            <span>{p}</span>
            <button
              onClick={() => remover(p)}
              className="text-red-500 hover:underline"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
