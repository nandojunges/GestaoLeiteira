import { useContext } from 'react';
import { ConfiguracaoContext } from '../../context/ConfiguracaoContext';

export default function SecaoIdentidade() {
  const { config, setConfig } = useContext(ConfiguracaoContext);

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setConfig({ ...config, foto: reader.result });
    reader.readAsDataURL(file);
  };

  const handleCapa = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setConfig({ ...config, capa: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <section className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-semibold mb-4">Identidade</h2>
      <div className="space-y-4">
        <div>
          <label className="block font-medium">Foto da Fazenda</label>
          <input type="file" accept="image/*" onChange={handleFoto} />
          {config.foto && (
            <img
              src={config.foto}
              alt="Perfil"
              className="mt-2 h-24 w-24 object-cover rounded-full"
            />
          )}
        </div>
        <div>
          <label className="block font-medium">Nome da Fazenda</label>
          <input
            type="text"
            value={config.nomeFazenda || ''}
            onChange={(e) => setConfig({ ...config, nomeFazenda: e.target.value })}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div>
          <label className="block font-medium">Nome do Produtor</label>
          <input
            type="text"
            value={config.produtor || ''}
            onChange={(e) => setConfig({ ...config, produtor: e.target.value })}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div>
          <label className="block font-medium">Foto de Capa</label>
          <input type="file" accept="image/*" onChange={handleCapa} />
          {config.capa && (
            <img
              src={config.capa}
              alt="Capa"
              className="mt-2 w-full h-32 object-cover rounded"
            />
          )}
        </div>
      </div>
    </section>
  );
}
