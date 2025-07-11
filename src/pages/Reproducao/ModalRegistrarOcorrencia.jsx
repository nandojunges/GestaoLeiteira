import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import { buscarVacas } from '../../utils/apiFuncoes.js';
import { buscarTodos } from '../../utils/backendApi';
import { addDays } from 'date-fns';
import { toast } from 'react-toastify';
import { formatarDataDigitada, formatarDataBR } from '../Animais/utilsAnimais';
import { addEventoCalendario } from '../../utils/eventosCalendario';
import {
  adicionarOcorrenciaFirestore,
  calcularProximaEtapa,
  iniciarProtocoloParaAnimal,
} from '../../utils/registroReproducao';
import { criarAvisoEstoqueFaltando, alocarImplanteParaVaca } from './utilsReproducao';
import { temEstoquePara } from '../../utils/estoque';

export default function ModalRegistrarOcorrencia({ vaca, status = 'No PEV', onClose, onSalvar }) {
  const TIPOS_PEV = [
    'Corrimento',
    'Metrite',
    'Endometrite',
    'Retenção de placenta',
    'Cisto folicular',
    'Anestro',
    'Iniciar Pré-sincronização'
  ];

  const TIPOS_LIBERADA = [
    'Cisto folicular',
    'Cisto luteal',
    'Corrimento',
    'Anestro',
    'Endometrite',
    'Iniciar Protocolo IATF',
    'Iniciar Pré-sincronização'
  ];

  const TIPOS = status === 'Liberada' ? TIPOS_LIBERADA : TIPOS_PEV;

  const [tipo, setTipo] = useState('');
  const [descricaoTipo, setDescricaoTipo] = useState('');
  const [dataOcorrencia, setDataOcorrencia] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [iniciarTratamento, setIniciarTratamento] = useState(false);
  const [dataInicioTratamento, setDataInicioTratamento] = useState('');
  const [produto, setProduto] = useState(null);
  const [dose, setDose] = useState('');
  const [duracao, setDuracao] = useState('');
  const [carencia, setCarencia] = useState(''); // exibida apenas para consulta
  const [produtos, setProdutos] = useState([]);
  const [todosProtocolos, setTodosProtocolos] = useState([]);
  const [protocoloSelecionado, setProtocoloSelecionado] = useState(null);
  const [usoImplante, setUsoImplante] = useState('1');
  const [carregando, setCarregando] = useState(false);
  const camposRef = useRef([]);

  const tipoEsperado =
    tipo === 'Iniciar Protocolo IATF'
      ? 'IATF'
      : tipo === 'Iniciar Pré-sincronização'
      ? 'PRÉ-SINCRONIZAÇÃO'
      : '';

  const protocolosFiltrados = todosProtocolos.filter((p) => {
    return (p.tipo || '').toUpperCase() === tipoEsperado;
  });

  const protocoloAtual = protocolosFiltrados.find(
    (p) => p.id === protocoloSelecionado?.value
  );
  const precisaImplante = protocoloAtual?.etapas?.some((e) =>
    (e.acao || '').toLowerCase().includes('inserir dispositivo')
  );

  const handleEnter = (index) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const prox = camposRef.current[index + 1];
      prox && prox.focus();
    }
  };

  async function aplicarProtocolo(registro) {
    const prot = todosProtocolos.find(
      (p) => p.id === protocoloSelecionado?.value
    );
    if (!prot) return;

    const historicoKey = `historicoReprodutivo_${vaca.numero}`;
    const historico = (await buscarTodos('historicoReprodutivo'))?.[vaca.numero] || [];
    const novaEntrada = {
      protocolo: protocoloSelecionado.label,
      tipo:
        (prot?.tipo || (tipo.includes('IATF') ? 'IATF' : 'PRÉ-SINCRONIZAÇÃO')).toUpperCase(),
      dataInicio: dataOcorrencia,
    };
    const existe = historico.some(
      (h) => h.protocolo === novaEntrada.protocolo && h.dataInicio === novaEntrada.dataInicio
    );
    if (!existe) {
      historico.push(novaEntrada);
      await adicionarItem(historicoKey, historico);
    }

    const eventosExistentes = await buscarTodos('eventosCalendario');
    const inicio = new Date(dataOcorrencia.split('/').reverse().join('-'));

    for (const et of prot.etapas) {
      const dataEvento = addDays(inicio, et.dia).toISOString().split('T')[0];
      const evento = {
        numero: vaca.numero,
        tipo: 'Protocolo Reprodutivo',
        subtipo: et.hormonio || et.acao || 'Etapa',
        data: dataEvento,
        protocoloId: prot.id,
        status: 'pendente',
      };

      const jaExiste = eventosExistentes.some(
        (e) =>
          String(e.numero) === String(evento.numero) &&
          e.data === evento.data &&
          e.protocoloId === evento.protocoloId &&
          e.subtipo === evento.subtipo
      );

      if (!jaExiste) {
        await adicionarItem('eventosCalendario', evento);
      }

      if ((et.acao || '').toLowerCase().includes('inserir dispositivo')) {
        const disponiveis = (await buscarTodos('implantes')).filter(
          (i) => String(i.uso) === String(usoImplante) && !i.emUsoPor
        ).length;
        if (disponiveis < 1) {
          const avisos = await buscarTodos('avisos');
          await adicionarItem('avisos', [
            ...avisos,
            {
              msg: `Dispositivo de ${usoImplante}º uso indisponível no estoque.`,
              data: new Date().toISOString(),
            },
          ]);
          const id = `faltando-dispositivo-${usoImplante}-${new Date()
            .toISOString()
            .slice(0, 10)}`;
          const tarefas = await buscarTodos('tarefas');
          if (!tarefas.some((t) => t.id === id)) {
            tarefas.push({
              id,
              data: new Date().toISOString().slice(0, 10),
              descricao: `Dispositivo de ${usoImplante}º uso indisponível no estoque.`,
              tipo: 'estoque',
              status: 'pendente',
            });
            await adicionarItem('tarefas', tarefas);
          }
        } else {
          await alocarImplanteParaVaca(usoImplante, vaca.numero);
        }
      } else if (
        et.hormonio &&
        !temEstoquePara(et.hormonio || et.principioAtivo, et.quantidade || 1)
      ) {
        criarAvisoEstoqueFaltando({
          principioAtivo: et.hormonio || et.principioAtivo,
          vaca: vaca.numero,
          protocoloId: prot.id,
          quantidadeNecessaria: et.quantidade || 1,
        });
      }
    }

    registro.protocoloId = prot.id;
    registro.nomeProtocolo = prot.nome;
    registro.etapas = prot.etapas;
    registro.proximaEtapa = calcularProximaEtapa(prot, dataOcorrencia);

    await iniciarProtocoloParaAnimal(
      vaca,
      prot,
      dataOcorrencia,
      precisaImplante ? usoImplante : null
    );

    toast.success('Protocolo aplicado com sucesso!');
  }

  useEffect(() => {
    (async () => {
      const lista = await buscarTodos('estoque');
      const arr = Array.isArray(lista) ? lista : [];
      const farm = arr.filter((p) => p.agrupamento === 'Farmácia');
      setProdutos(
        farm.map((p) => ({
          value: p.nomeComercial,
          label: p.nomeComercial,
          carenciaLeite: p.carenciaLeite,
          carenciaCarne: p.carenciaCarne,
        }))
      );

      const prot = await buscarTodos('protocolos');
      setTodosProtocolos(prot);
    })();

    const esc = e => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const handleSalvar = async () => {
    if (!tipo || !dataOcorrencia || dataOcorrencia.length !== 10) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setCarregando(true);

    try {
      const dados = {
        numero: vaca.numero,
        tipo,
        data: dataOcorrencia,
        observacoes,
        ...(tipo === 'Outros' && descricaoTipo ? { descricaoTipo } : {}),
      };

      await adicionarItem('ocorrencias', dados);

      let registro = {
        tipo: tipo.startsWith('Iniciar ') ? `Início ${tipo.slice(8)}` : tipo,
        data: dataOcorrencia,
        obs: observacoes,
      };

      if (iniciarTratamento && produto && dataInicioTratamento) {
        const tratamento = {
          numeroAnimal: vaca.numero,
          dataInicio: dataInicioTratamento,
          produto,
        dose,
        duracao,
        carencia,
        ocorrencia: tipo
      };
      const listaTr = await buscarTodos('tratamentos');
      await adicionarItem('tratamentos', tratamento);
      window.dispatchEvent(new Event('tratamentosAtualizados'));

      const toISO = (d) => {
        const [dia, mes, ano] = d.split('/');
        return `${ano}-${mes.padStart(2,'0')}-${dia.padStart(2,'0')}`;
      };

      const inicio = new Date(toISO(dataInicioTratamento));
      const eventos = await buscarTodos('eventosExtras');
      for (let i = 0; i < parseInt(duracao || 0); i++) {
        const data = new Date(inicio);
        data.setDate(data.getDate() + i);
        eventos.push({
          title: `Tratamento ${produto} - Vaca ${vaca.numero}`,
          date: data.toISOString().split('T')[0],
          tipo: 'checkup',
          prioridadeVisual: true
        });
      }
      await adicionarItem('eventosExtras', eventos);

      const listaProdutos = await buscarTodos('estoque');
      const arrProd = Array.isArray(listaProdutos) ? listaProdutos : [];
      const info = arrProd.find(p => p.nomeComercial === produto) || {};
      const carLeite = parseInt(info.carenciaLeite || 0);
      const carCarne = parseInt(info.carenciaCarne || 0);

      const fimLeite = new Date(inicio);
      fimLeite.setDate(fimLeite.getDate() + carLeite);
      const fimCarne = new Date(inicio);
      fimCarne.setDate(fimCarne.getDate() + carCarne);

      await addEventoCalendario({
        title: `📛 Início da carência – ${produto} (Animal ${vaca.numero})`,
        date: inicio.toISOString().split('T')[0],
        tipo: 'carencia'
      });
      await addEventoCalendario({
        title: `✅ Fim da carência de LEITE – ${produto} (Animal ${vaca.numero})`,
        date: fimLeite.toISOString().split('T')[0],
        tipo: 'carencia'
      });
      await addEventoCalendario({
        title: `✅ Fim da carência de CARNE – ${produto} (Animal ${vaca.numero})`,
        date: fimCarne.toISOString().split('T')[0],
        tipo: 'carencia'
      });

      const alertas = await buscarTodos('alertasCarencia');
      alertas.push({
        numeroAnimal: vaca.numero,
        produto,
        leiteAte: formatarDataBR(fimLeite),
        carneAte: formatarDataBR(fimCarne)
      });
      await adicionarItem('alertasCarencia', alertas);
      window.dispatchEvent(new Event('alertasCarenciaAtualizados'));
      }

      if (tipo === 'Iniciar Pré-sincronização' || tipo === 'Iniciar Protocolo IATF') {
        if (!protocoloSelecionado) {
          toast.warn('Selecione um protocolo');
          return;
        }
        await aplicarProtocolo(registro);
      }

      await adicionarOcorrenciaFirestore(vaca.numero, registro);

      toast.success('Ocorrência registrada com sucesso!');
      onSalvar?.(dados);
      window.dispatchEvent(new Event('registroReprodutivoAtualizado'));
      onClose?.();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar ocorrência');
    } finally {
      setCarregando(false);
    }
  };

  const input = {
    padding: '0.6rem',
    border: '1px solid #ccc',
    borderRadius: '0.5rem',
    width: '100%',
    fontSize: '0.95rem'
  };

  const overlay = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  };

  const modal = {
    background: '#fff',
    borderRadius: '1rem',
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflowY: 'auto',
    fontFamily: 'Poppins, sans-serif',
    display: 'flex',
    flexDirection: 'column'
  };

  const header = {
    background: '#1e40af',
    color: 'white',
    padding: '1rem 1.5rem',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    borderTopLeftRadius: '1rem',
    borderTopRightRadius: '1rem',
    textAlign: 'center'
  };

  const conteudo = {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div style={header}>Registrar Ocorrência - {vaca.numero}</div>
        <div style={conteudo}>
          <div>
            <label>Tipo de Ocorrência *</label>
            <Select
              options={TIPOS.map(t => ({ value: t, label: t }))}
              value={tipo ? { value: tipo, label: tipo } : null}
              onChange={opt => {
                setTipo(opt?.value || '');
                setDescricaoTipo('');
              }}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione..."
              isSearchable
            />
          </div>
          {tipo === 'Outros' && (
            <div>
              <label>Descreva</label>
              <input
                ref={el => (camposRef.current[1] = el)}
                value={descricaoTipo}
                onChange={e => setDescricaoTipo(e.target.value)}
                onKeyDown={handleEnter(1)}
                style={input}
              />
            </div>
          )}
          <div>
            <label>Data da ocorrência *</label>
            <input
              ref={el => (camposRef.current[ tipo === 'Outros' ? 2 : 1] = el)}
              value={dataOcorrencia}
              onChange={e => setDataOcorrencia(formatarDataDigitada(e.target.value))}
              onKeyDown={tipo === 'Outros' ? handleEnter(2) : handleEnter(1)}
              style={input}
              placeholder="dd/mm/aaaa"
            />
          </div>
          <div>
            <label>Observações</label>
            <textarea
              ref={el => (camposRef.current[tipo === 'Outros' ? 3 : 2] = el)}
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              onKeyDown={tipo === 'Outros' ? handleEnter(3) : handleEnter(2)}
              style={{ ...input, height: '80px' }}
            />
          </div>
          {(tipo === 'Iniciar Pré-sincronização' || tipo === 'Iniciar Protocolo IATF') && (
            <div>
              <label>Protocolo</label>
              {protocolosFiltrados.length === 0 ? (
                <p style={{ color: 'gray' }}>⚠️ Nenhum protocolo do tipo disponível</p>
              ) : (
                <Select
                  options={protocolosFiltrados.map(p => ({ value: p.id, label: p.nome }))}
                  value={protocoloSelecionado}
                  onChange={setProtocoloSelecionado}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Selecione..."
                  isSearchable
                />
              )}
            </div>
          )}
          {precisaImplante && (
            <div>
              <label>Tipo de Implante</label>
              <select value={usoImplante} onChange={e => setUsoImplante(e.target.value)} style={input}>
                <option value="1">De 1º uso</option>
                <option value="2">De 2º uso</option>
                <option value="3">De 3º uso</option>
              </select>
            </div>
          )}
          {tipo !== 'Cio natural' && (
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={iniciarTratamento}
                  onChange={e => setIniciarTratamento(e.target.checked)}
                />{' '}
                Iniciar tratamento agora
              </label>
            </div>
          )}
          {iniciarTratamento && tipo !== 'Cio natural' && (
            <>
              <div>
                <label>Produto</label>
                <Select
                  options={produtos}
                  value={produto ? { value: produto, label: produto } : null}
                  onChange={opt => {
                    setProduto(opt?.value || null);
                    if (opt) {
                      const l = opt.carenciaLeite || 0;
                      const c = opt.carenciaCarne || 0;
                      setCarencia(`${l}/${c}`);
                    }
                  }}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Selecione..."
                  isSearchable
                />
              </div>
              <div>
                <label>Data de início *</label>
                <input
                  ref={el => (camposRef.current[tipo === 'Outros' ? 4 : 3] = el)}
                  value={dataInicioTratamento}
                  onChange={e => setDataInicioTratamento(formatarDataDigitada(e.target.value))}
                  onKeyDown={handleEnter(tipo === 'Outros' ? 4 : 3)}
                  style={input}
                  placeholder="dd/mm/aaaa"
                />
              </div>
              <div>
                <label>Dose</label>
                <input value={dose} onChange={e => setDose(e.target.value)} style={input} />
              </div>
              <div>
                <label>Duração (dias)</label>
                <input
                  type="number"
                  value={duracao}
                  onChange={e => setDuracao(e.target.value)}
                  style={{ ...input, width: '120px' }}
                />
              </div>
              <div>
                <label>Carência (Leite/Carne)</label>
                <div style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}>
                  {carencia || '—'}
                </div>
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={onClose} className="botao-cancelar">Cancelar</button>
            <button onClick={handleSalvar} className="botao-acao">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );

}

