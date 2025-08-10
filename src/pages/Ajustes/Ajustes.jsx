import { useContext, useState, useRef } from 'react';
import { ConfiguracaoContext } from '../../context/ConfiguracaoContext';
import { toast } from 'react-toastify';
import ModalCapa from '../../usuario/ModalCapa';
import ModalFoto from '../../usuario/ModalFoto';
import SecaoConfiguracoesVisuais from './SecaoConfiguracoesVisuais';
import SecaoNotificacoes from './SecaoNotificacoes';
import SecaoPreferenciasGerais from './SecaoPreferenciasGerais';
import SecaoCalendario from './SecaoCalendario';
import SecaoDimensoes from './SecaoDimensoes';
import SecaoTabelas from './SecaoTabelas';
import { enviarImagem } from '../../utils/backendApi';
import { salvarConfiguracao } from '../../utils/configUsuario';
import { motion, AnimatePresence } from 'framer-motion';
import jwtDecode from 'jwt-decode';
import { promoverPreParto, ping } from '../../api';

export default function Ajustes() {
  const { config, setConfig } = useContext(ConfiguracaoContext);
  const [abaAtiva, setAbaAtiva] = useState(null);
  const [mostrarModalCapa, setMostrarModalCapa] = useState(false);
  const [imagemEdicao, setImagemEdicao] = useState(null);
  const [recorteEdicao, setRecorteEdicao] = useState(null);
  const [mostrarModalFoto, setMostrarModalFoto] = useState(false);
  const [imagemFotoEdicao, setImagemFotoEdicao] = useState(null);
  const [recorteFotoEdicao, setRecorteFotoEdicao] = useState(null);
  const [imagemPerfil, setImagemPerfil] = useState(config.foto || '');
  const [processingPreParto, setProcessingPreParto] = useState(false);
  const inputFotoRef = useRef(null);
  const inputCapaRef = useRef(null);
  const nomeRef = useRef(null);
  const proprietarioRef = useRef(null);
  const siteRef = useRef(null);

  let isAdmin = false;
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      isAdmin = decoded?.perfil === 'admin';
    }
  } catch (e) {
    /* ignore */
  }

  const abrirExibicao = () => setAbaAtiva('exibicao');
  const abrirNotificacoes = () => setAbaAtiva('notificacoes');
  const abrirIdioma = () => setAbaAtiva('idioma');
  const abrirCalendario = () => setAbaAtiva('calendario');
  const abrirDimensoes = () => setAbaAtiva('dimensoes');
  const abrirTabelas = () => setAbaAtiva('tabelas');

  const handlePromoverPreParto = async () => {
    setProcessingPreParto(true);
    try {
      const { count = 0, ids = [] } = await promoverPreParto();
      toast.success(`Processados: ${count}, IDs: ${ids.join(', ')}`);
    } catch (err) {
      toast.error('Não foi possível promover Pré-Parto');
    } finally {
      setProcessingPreParto(false);
    }
  };

  const handlePing = async () => {
    try {
      const res = await ping();
      toast.info(`ok: ${res.ok}, ts: ${res.ts}`);
    } catch (err) {
      toast.error('API indisponível');
    }
  };

  const abrirEdicaoFoto = () => {
    setImagemFotoEdicao(config.fotoOriginal || config.foto || null);
    setRecorteFotoEdicao(config.fotoRecorte || { x: 0, y: 0, zoom: 1 });
    setMostrarModalFoto(true);
  };

  const abrirEdicaoCapa = () => {
    setImagemEdicao(config.capaOriginal || config.capa || null);
    setRecorteEdicao(config.capaRecorte || null);
    setMostrarModalCapa(true);
  };

  const selecionarFotoPerfil = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemFotoEdicao(reader.result);
      setRecorteFotoEdicao({ x: 0, y: 0, zoom: 1 });
      setMostrarModalFoto(true);
    };
    reader.readAsDataURL(file);
  };

  const selecionarCapa = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemEdicao(reader.result);
      setRecorteEdicao(null);
      setMostrarModalCapa(true);
    };
    reader.readAsDataURL(file);
  };


  return (
    <div className="max-w-[700px] mx-auto p-4 font-sans flex flex-col gap-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">⚙️ Ajustes</h2>

      <div className="relative h-[200px] rounded-lg overflow-hidden">
        {config.capa ? (
          <img src={config.capa} alt="Capa" className="w-full h-full object-cover" />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Capa da Fazenda</span>
        )}
        <button
          onClick={() => inputCapaRef.current?.click()}
          className="absolute top-2 right-2 bg-white/80 dark:bg-gray-700/80 text-xl px-2 rounded"
        >
          ⋮
        </button>
        <input
          type="file"
          accept="image/*"
          ref={inputCapaRef}
          onChange={selecionarCapa}
          className="hidden"
        />
      </div>

      <div className="flex flex-col items-center -mt-12">
        <div className="relative w-[120px] h-[120px] rounded-full border-4 border-blue-500 shadow-md overflow-hidden cursor-pointer" onClick={abrirEdicaoFoto}>
          <img src={imagemPerfil || '/icones/perfil-padrao.png'} alt="Foto" className="foto-perfil-circular" />
        </div>
        <button
          onClick={() => inputFotoRef.current?.click()}
          className="mt-2 bg-blue-600 text-white text-sm px-3 py-1 rounded shadow"
        >
          Escolher Foto de Perfil
        </button>
        <input
          type="file"
          accept="image/*"
          ref={inputFotoRef}
          onChange={selecionarFotoPerfil}
          className="hidden"
        />
      </div>

      <div className="flex flex-col gap-4 max-w-[600px] mx-auto">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nome da Fazenda</label>
              <input
                type="text"
                ref={nomeRef}
                value={config.nomeFazenda}
                onChange={(e) => setConfig({ ...config, nomeFazenda: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && proprietarioRef.current?.focus()}
                placeholder="Digite o nome da fazenda..."
                className="w-full mt-1 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring focus:ring-blue-300 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nome do Proprietário</label>
              <input
                type="text"
                ref={proprietarioRef}
                value={config.produtor}
                onChange={(e) => setConfig({ ...config, produtor: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && siteRef.current?.focus()}
                placeholder="Seu nome..."
                className="w-full mt-1 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring focus:ring-blue-300 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Rede Social</label>
              <input
                type="text"
                ref={siteRef}
                value={config.site || ''}
                onChange={(e) => setConfig({ ...config, site: e.target.value })}
                placeholder="https://..."
                className="w-full mt-1 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring focus:ring-blue-300 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-center">
              <BotaoConfig icon="🖥️" texto="Exibição" onClick={abrirExibicao} ativo={abaAtiva==='exibicao'} />
              <BotaoConfig icon="🔔" texto="Notificações" onClick={abrirNotificacoes} ativo={abaAtiva==='notificacoes'} />
              <BotaoConfig icon="🌐" texto="Idioma" onClick={abrirIdioma} ativo={abaAtiva==='idioma'} />
              <BotaoConfig icon="📅" texto="Calendário" onClick={abrirCalendario} ativo={abaAtiva==='calendario'} />
              <BotaoConfig icon="📏" texto="Dimensões" onClick={abrirDimensoes} ativo={abaAtiva==='dimensoes'} />
              <BotaoConfig icon="📊" texto="Tabela" onClick={abrirTabelas} ativo={abaAtiva==='tabelas'} />
            </div>
            <div>
              <AnimatePresence mode="wait">
                {abaAtiva === 'exibicao' && (
                  <motion.div key="exibicao" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SecaoConfiguracoesVisuais />
                  </motion.div>
                )}
                {abaAtiva === 'notificacoes' && (
                  <motion.div key="not" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SecaoNotificacoes />
                  </motion.div>
                )}
                {abaAtiva === 'idioma' && (
                  <motion.div key="idioma" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SecaoPreferenciasGerais />
                  </motion.div>
                )}
                {abaAtiva === 'calendario' && (
                  <motion.div key="cal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SecaoCalendario />
                  </motion.div>
                )}
                {abaAtiva === 'dimensoes' && (
                  <motion.div key="dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SecaoDimensoes />
                  </motion.div>
                )}
                {abaAtiva === 'tabelas' && (
                  <motion.div key="tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SecaoTabelas />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {isAdmin && (
            <div className="text-right mt-8">
              <button
                onClick={handlePromoverPreParto}
                disabled={processingPreParto}
                className="botao-acao"
              >
                {processingPreParto ? 'Processando...' : 'Promover Pré-Parto (D-21)'}
              </button>
            </div>
          )}
          <div className="text-right mt-8">
            <button onClick={handlePing} className="botao-acao">
              Testar conexão API
            </button>
          </div>
          <div className="text-right mt-8">
            <button
              onClick={() => {
                salvarConfiguracao(config);
                alert('Alterações salvas com sucesso!');
              }}
              className="botao-acao"
            >
              Salvar Alterações
            </button>
          </div>

      {mostrarModalCapa && (
        <ModalCapa
          imagem={imagemEdicao}
          recorte={recorteEdicao}
          setImagem={setImagemEdicao}
          setRecorte={setRecorteEdicao}
          onFechar={() => setMostrarModalCapa(false)}
          onSalvar={async ({ arquivo, original, cropped, crop }) => {
            const url = await enviarImagem('configuracoes/capa.jpg', cropped);
            setConfig({
              ...config,
              capa: url,
              capaOriginal: original,
              capaRecorte: crop,
              capaArquivo: arquivo?.name || config.capaArquivo,
            });
            toast.success('✅ Capa atualizada com sucesso!');
            setMostrarModalCapa(false);
          }}
        />
      )}
      {mostrarModalFoto && (
        <ModalFoto
          imagem={imagemFotoEdicao}
          recorte={recorteFotoEdicao}
          setImagem={setImagemFotoEdicao}
          setRecorte={setRecorteFotoEdicao}
          onFechar={() => setMostrarModalFoto(false)}
          onSalvar={async ({ arquivo, original, cropped, crop }) => {
            const url = await enviarImagem('configuracoes/perfil.jpg', cropped);
            setImagemPerfil(url);
            setConfig({
              ...config,
              foto: url,
              fotoOriginal: original,
              fotoRecorte: crop,
              fotoArquivo: arquivo?.name || config.fotoArquivo,
            });
            toast.success('✅ Foto atualizada com sucesso!');
            setMostrarModalFoto(false);
          }}
        />
      )}
    </div>
  );
}

function BotaoConfig({ icon, texto, onClick, ativo }) {
  return (
    <div className={`card-botao ${ativo ? 'ativo' : ''}`} onClick={onClick}>
      <i>{icon}</i>
      <span>{texto}</span>
    </div>
  );
}


