import { createContext, useState, useEffect } from 'react';
import { carregarConfiguracao, salvarConfiguracao } from '../utils/configUsuario';

export const ConfiguracaoContext = createContext();

const padrao = {
  nomeFazenda: '',
  produtor: '',
  site: '',
  foto: '',
  fotoArquivo: '',
  fotoOriginal: '',
  fotoRecorte: { x: 0, y: 0, zoom: 1 },
  capa: '',
  capaArquivo: '',
  capaOriginal: '',
  capaRecorte: { x: 0, y: 0, width: 0, height: 0 },
  fonte: 'Poppins',
  tamanhoFonte: 16,
  tamanhoIcones: { principal: 65, sub: 45, aviso: 32 },
  notificacoes: {
    visual: true,
    som: true,
    antecedencia: 3,
    canais: { exibicao: true, email: false, icones: true },
  },
  permissoes: [],
  preferencias: {
    idioma: 'pt',
    formatoData: 'dd/mm/yyyy',
    mostrarFds: true,
    tema: 'claro',
  },
};

export function ConfiguracaoProvider({ children }) {
  const [config, setConfig] = useState(padrao);

  useEffect(() => {
    const carregar = async () => {
      try {
        const salvo = await carregarConfiguracao();
        setConfig((atual) => ({ ...atual, ...salvo }));
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      }
    };
    carregar();
  }, []);

  useEffect(() => {
    salvarConfiguracao(config);
    if (config.fonte)
      document.documentElement.style.setProperty('--fonte-primaria', config.fonte);
    if (config.tamanhoFonte)
      document.documentElement.style.setProperty(
        '--tamanho-fonte-base',
        `${config.tamanhoFonte}px`
      );
    if (config.tamanhoIcones?.aviso)
      document.documentElement.style.setProperty(
        '--tamanho-icone-aviso',
        `${config.tamanhoIcones.aviso}px`
      );
    if (config.preferencias?.tema === 'escuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config]);

  return (
    <ConfiguracaoContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfiguracaoContext.Provider>
  );
}
