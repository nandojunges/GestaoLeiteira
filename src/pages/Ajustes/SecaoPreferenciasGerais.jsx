import { useContext } from 'react';
import { ConfiguracaoContext } from '../../context/ConfiguracaoContext';

export default function SecaoPreferenciasGerais() {
  const { config, setConfig } = useContext(ConfiguracaoContext);

  const atualiza = (campo, valor) => {
    setConfig({
      ...config,
      preferencias: { ...config.preferencias, [campo]: valor },
    });
  };

  const toggleTema = () => {
    const novo = config.preferencias.tema === 'escuro' ? 'claro' : 'escuro';
    atualiza('tema', novo);
  };

  const setIdiomaAtual = (idioma) => {
    atualiza('idioma', idioma);
  };

  return (
    <section className="bg-white shadow rounded p-4 space-y-4">
      <h2 className="text-xl font-semibold">Preferências gerais</h2>
      <div>
        <label className="block font-medium">Idioma</label>
        <ul className="space-y-1">
          <li onClick={() => setIdiomaAtual('pt')} className={`cursor-pointer hover:underline ${config.preferencias.idioma==='pt' ? 'font-semibold' : ''}`}>Português</li>
          <li onClick={() => setIdiomaAtual('en')} className={`cursor-pointer hover:underline ${config.preferencias.idioma==='en' ? 'font-semibold' : ''}`}>English</li>
        </ul>
      </div>
      <div>
        <label className="block font-medium">Formato de data</label>
        <select
          value={config.preferencias.formatoData}
          onChange={(e) => atualiza('formatoData', e.target.value)}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="dd/mm/yyyy">dd/mm/yyyy</option>
          <option value="mm/dd/yyyy">mm/dd/yyyy</option>
        </select>
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.preferencias.mostrarFds}
          onChange={(e) => atualiza('mostrarFds', e.target.checked)}
        />
        Exibir fins de semana
      </label>
      <div>
        <label className="block font-medium">Tema</label>
        <ul className="space-y-1">
          <li onClick={toggleTema} className="cursor-pointer hover:underline">🌞 Tema Claro / Escuro</li>
        </ul>
      </div>
    </section>
  );
}
