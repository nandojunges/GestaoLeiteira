import { useContext } from 'react';
import { ConfiguracaoContext } from '../../context/ConfiguracaoContext';

export default function SecaoConfiguracoesVisuais() {
  const { config, setConfig } = useContext(ConfiguracaoContext);

  const atualiza = (campo, valor) => {
    setConfig({ ...config, [campo]: valor });
  };

  const atualizaIcone = (valor) => {
    setConfig({
      ...config,
      tamanhoIcones: { ...config.tamanhoIcones, principal: valor },
    });
  };

  return (
    <section className="bg-white shadow rounded p-4 space-y-4">
      <h2 className="text-xl font-semibold">Aparência</h2>
      <div>
        <label className="block font-medium">Fonte</label>
        <select
          value={config.fonte || 'Poppins'}
          onChange={(e) => atualiza('fonte', e.target.value)}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="Poppins">Poppins</option>
          <option value="Roboto">Roboto</option>
          <option value="Inter">Inter</option>
        </select>
      </div>
      <div>
        <label className="block font-medium">
          Tamanho da fonte: {config.tamanhoFonte || 16}px
        </label>
        <input
          type="range"
          min="12"
          max="22"
          value={config.tamanhoFonte || 16}
          onChange={(e) => atualiza('tamanhoFonte', Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div>
        <label className="block font-medium">
          Tamanho dos ícones: {config.tamanhoIcones?.principal || 65}px
        </label>
        <input
          type="range"
          min="48"
          max="96"
          value={config.tamanhoIcones?.principal || 65}
          onChange={(e) => atualizaIcone(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="flex items-center gap-4">
        <span
          style={{
            fontFamily: config.fonte,
            fontSize: config.tamanhoFonte,
          }}
        >
          Preview texto
        </span>
        <img
          src="/vite.svg"
          alt="exemplo"
          style={{
            width: config.tamanhoIcones?.principal || 65,
            height: config.tamanhoIcones?.principal || 65,
          }}
        />
      </div>
    </section>
  );
}
