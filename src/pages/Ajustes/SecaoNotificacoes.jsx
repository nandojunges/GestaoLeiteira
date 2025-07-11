import { useContext } from 'react';
import { ConfiguracaoContext } from '../../context/ConfiguracaoContext';

export default function SecaoNotificacoes() {
  const { config, setConfig } = useContext(ConfiguracaoContext);

  const atualiza = (campo, valor) => {
    setConfig({
      ...config,
      notificacoes: { ...config.notificacoes, [campo]: valor },
    });
  };

  const atualizaCanal = (canal) => {
    setConfig({
      ...config,
      notificacoes: {
        ...config.notificacoes,
        canais: {
          ...config.notificacoes.canais,
          [canal]: !config.notificacoes.canais[canal],
        },
      },
    });
  };

  return (
    <section className="bg-white shadow rounded p-4 space-y-2">
      <h2 className="text-xl font-semibold mb-2">Notificações</h2>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.notificacoes.visual}
          onChange={(e) => atualiza('visual', e.target.checked)}
        />
        Notificações visuais
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.notificacoes.som}
          onChange={(e) => atualiza('som', e.target.checked)}
        />
        Sons de alerta
      </label>
      <div>
        <label className="block font-medium">Antecedência (dias)</label>
        <input
          type="number"
          min="0"
          value={config.notificacoes.antecedencia}
          onChange={(e) => atualiza('antecedencia', Number(e.target.value))}
          className="border rounded px-2 py-1 w-20"
        />
      </div>
      <div className="space-x-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.notificacoes.canais.exibicao}
            onChange={() => atualizaCanal('exibicao')}
          />
          Exibição
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.notificacoes.canais.email}
            onChange={() => atualizaCanal('email')}
          />
          Email
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.notificacoes.canais.icones}
            onChange={() => atualizaCanal('icones')}
          />
          Ícones
        </label>
      </div>
    </section>
  );
}
