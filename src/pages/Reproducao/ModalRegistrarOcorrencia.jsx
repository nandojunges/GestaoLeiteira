import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import { formatarDataDigitada, formatarDataBR } from '../Animais/utilsAnimais';
import { addEventoCalendario } from '../../utils/eventosCalendario';

export default function ModalRegistrarOcorrencia({ vaca, onClose, onSalvar }) {
  const TIPOS = [
    'Metrite',
    'Endometrite',
    'Infecção Subclínica',
    'Cio natural',
    'Descalcificação',
    'Cetose',
    'Retenção de placenta',
    'Outros'
  ];

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
  const camposRef = useRef([]);

  const handleEnter = (index) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const prox = camposRef.current[index + 1];
      prox && prox.focus();
    }
  };

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem('produtos') || '[]');
    const farm = lista.filter((p) => p.agrupamento === 'Farmácia');
    setProdutos(
      farm.map((p) => ({
        value: p.nomeComercial,
        label: p.nomeComercial,
        carenciaLeite: p.carenciaLeite,
        carenciaCarne: p.carenciaCarne
      }))
    );
    const esc = e => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const salvar = () => {
    if (!tipo) {
      alert('Selecione o tipo de ocorrência');
      return;
    }
    if (!dataOcorrencia || dataOcorrencia.length !== 10) {
      alert('Informe a data da ocorrência');
      return;
    }
    const ocorrencia = {
      numeroAnimal: vaca.numero,
      data: dataOcorrencia,
      tipo,
      descricaoTipo: tipo === 'Outros' ? descricaoTipo : undefined,
      observacoes
    };
    const listaOc = JSON.parse(localStorage.getItem('ocorrencias') || '[]');
    listaOc.push(ocorrencia);
    localStorage.setItem('ocorrencias', JSON.stringify(listaOc));
    window.dispatchEvent(new Event('ocorrenciasAtualizadas'));

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
      const listaTr = JSON.parse(localStorage.getItem('tratamentos') || '[]');
      listaTr.push(tratamento);
      localStorage.setItem('tratamentos', JSON.stringify(listaTr));
      window.dispatchEvent(new Event('tratamentosAtualizados'));

      const toISO = (d) => {
        const [dia, mes, ano] = d.split('/');
        return `${ano}-${mes.padStart(2,'0')}-${dia.padStart(2,'0')}`;
      };

      const inicio = new Date(toISO(dataInicioTratamento));
      const eventos = JSON.parse(localStorage.getItem('eventosExtras') || '[]');
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
      localStorage.setItem('eventosExtras', JSON.stringify(eventos));

      const listaProdutos = JSON.parse(localStorage.getItem('produtos') || '[]');
      const info = listaProdutos.find(p => p.nomeComercial === produto) || {};
      const carLeite = parseInt(info.carenciaLeite || 0);
      const carCarne = parseInt(info.carenciaCarne || 0);

      const fimLeite = new Date(inicio);
      fimLeite.setDate(fimLeite.getDate() + carLeite);
      const fimCarne = new Date(inicio);
      fimCarne.setDate(fimCarne.getDate() + carCarne);

      addEventoCalendario({
        title: `📛 Início da carência – ${produto} (Animal ${vaca.numero})`,
        date: inicio.toISOString().split('T')[0],
        tipo: 'carencia'
      });
      addEventoCalendario({
        title: `✅ Fim da carência de LEITE – ${produto} (Animal ${vaca.numero})`,
        date: fimLeite.toISOString().split('T')[0],
        tipo: 'carencia'
      });
      addEventoCalendario({
        title: `✅ Fim da carência de CARNE – ${produto} (Animal ${vaca.numero})`,
        date: fimCarne.toISOString().split('T')[0],
        tipo: 'carencia'
      });

      const alertas = JSON.parse(localStorage.getItem('alertasCarencia') || '[]');
      alertas.push({
        numeroAnimal: vaca.numero,
        produto,
        leiteAte: formatarDataBR(fimLeite),
        carneAte: formatarDataBR(fimCarne)
      });
      localStorage.setItem('alertasCarencia', JSON.stringify(alertas));
      window.dispatchEvent(new Event('alertasCarenciaAtualizados'));
    }
    onSalvar?.(ocorrencia);
    onClose?.();
  };

  const input = () => ({
    padding: '0.6rem',
    border: '1px solid #ccc',
    borderRadius: '0.5rem',
    width: '100%',
    fontSize: '0.95rem'
  });

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
                style={input()}
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
              style={input()}
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
              style={{ ...input(), height: '80px' }}
            />
          </div>
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
                />
              </div>
              <div>
                <label>Data de início *</label>
                <input
                  ref={el => (camposRef.current[tipo === 'Outros' ? 4 : 3] = el)}
                  value={dataInicioTratamento}
                  onChange={e => setDataInicioTratamento(formatarDataDigitada(e.target.value))}
                  onKeyDown={handleEnter(tipo === 'Outros' ? 4 : 3)}
                  style={input()}
                  placeholder="dd/mm/aaaa"
                />
              </div>
              <div>
                <label>Dose</label>
                <input value={dose} onChange={e => setDose(e.target.value)} style={input()} />
              </div>
              <div>
                <label>Duração (dias)</label>
                <input
                  type="number"
                  value={duracao}
                  onChange={e => setDuracao(e.target.value)}
                  style={{ ...input(), width: '120px' }}
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
            <button onClick={salvar} className="botao-acao">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  width: '420px',
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
