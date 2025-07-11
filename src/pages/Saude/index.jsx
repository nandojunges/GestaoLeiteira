import React, { useState, useEffect } from 'react';
import SubAbasSaude from './SubAbasSaude';
import TabelaOcorrencias from './TabelaOcorrencias';
import TabelaTratamentos from './TabelaTratamentos';
import ModalOcorrencia from './ModalOcorrencia';
import ModalTratamento from './ModalTratamento';
import AlertasSaude from './AlertasSaude';
import { db } from '../../utils/db';

const select = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

const execute = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });

const getKeyValue = (key) =>
  new Promise((resolve, reject) => {
    db.get('SELECT value FROM key_value WHERE key = ?', [key], (err, row) => {
      if (err) reject(err);
      else resolve(row ? JSON.parse(row.value) : []);
    });
  });

const setKeyValue = (key, value) =>
  new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO key_value (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [key, JSON.stringify(value)],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });

export default function Saude() {
  const [aba, setAba] = useState('ocorrencias');
  const [mostrarOcorrencia, setMostrarOcorrencia] = useState(false);
  const [mostrarTratamento, setMostrarTratamento] = useState(false);
  const [dadosTratamento, setDadosTratamento] = useState(null);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [tratamentos, setTratamentos] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      setOcorrencias(await select('SELECT * FROM ocorrencias'));
      setTratamentos(await select('SELECT * FROM tratamentos'));
      setAnimais(await select('SELECT * FROM animais'));
      setProdutos(await select('SELECT * FROM estoque'));
    };
    carregar();
  }, []);

  const salvarOcorrencia = async (dados) => {
    const res = await execute(
      'INSERT INTO ocorrencias (numeroAnimal, data, tipo, descricao) VALUES (?, ?, ?, ?)',
      [dados.animal, dados.data, dados.diagnostico, dados.observacoes]
    );
    const lista = [...ocorrencias, { id: res.id, ...dados }];
    setOcorrencias(lista);
    window.dispatchEvent(new Event('dadosUsuarioAtualizados'));

    const mapa = { mastite: 'Pencivet' };
    const diag = (dados.diagnostico || '').toLowerCase();
    let medicamento = null;
    Object.keys(mapa).forEach((ch) => {
      if (diag.includes(ch)) medicamento = mapa[ch];
    });
    if (medicamento) {
      const prod = produtos.find(
        (p) => p.nomeComercial.toLowerCase() === medicamento.toLowerCase()
      );
      const dadosPadrao = {
        animal: { value: dados.animal, label: dados.animal },
        data: dados.data,
        produto: prod
          ? {
              value: prod.nomeComercial,
              label: prod.nomeComercial,
              carencia: prod.carencia || '',
              principioAtivo: prod.principioAtivo || '',
            }
          : null,
        ocorrenciaIdx: lista.length - 1,
      };
      setDadosTratamento(dadosPadrao);
      setMostrarTratamento(true);
    }
  };

  const salvarTratamento = async (dados) => {
    const res = await execute(
      `INSERT INTO tratamentos (
        numeroAnimal, data, duracaoDias, principioAtivo, nomeComercial, aplicador, observacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.animal,
        dados.data,
        dados.duracao || '',
        dados.principioAtivo || '',
        dados.medicamento,
        dados.aplicador,
        dados.observacoes || ''
      ]
    );
    const lista = [...tratamentos, { id: res.id, ...dados }];
    setTratamentos(lista);

    const idx = produtos.findIndex(p => p.nomeComercial === dados.medicamento);
    if (idx >= 0) {
      const prod = { ...produtos[idx] };
      prod.quantidade = parseFloat(prod.quantidade || 0) - parseFloat(dados.dose || 0);
      produtos[idx] = prod;
      await execute('UPDATE estoque SET quantidade = ? WHERE id = ?', [prod.quantidade, prod.id]);
      setProdutos([...produtos]);
      window.dispatchEvent(new Event('estoqueAtualizado'));
    }




    if (typeof dados.ocorrenciaIdx === 'number') {
      const oc = [...ocorrencias];
      if (oc[dados.ocorrenciaIdx]) {
        oc[dados.ocorrenciaIdx].tratamentoVinculado = true;
        setOcorrencias(oc);
        if (oc[dados.ocorrenciaIdx].id) {
          await execute('UPDATE ocorrencias SET descricao = descricao WHERE id = ?', [oc[dados.ocorrenciaIdx].id]);
        }
      }
    }

    const info = produtos.find((p) => p.nomeComercial === dados.medicamento);
    if (info) {
      const parse = (d) => {
        const [dia, mes, ano] = d.split('/');
        return new Date(ano, mes - 1, dia);
      };
      const formatar = (dt) => {
        const dia = String(dt.getDate()).padStart(2, '0');
        const mes = String(dt.getMonth() + 1).padStart(2, '0');
        const ano = dt.getFullYear();
        return `${dia}/${mes}/${ano}`;
      };
      const inicio = parse(dados.data);
      const fimLeite = new Date(inicio);
      fimLeite.setDate(fimLeite.getDate() + (parseInt(info.carenciaLeite) || 0));
      const fimCarne = new Date(inicio);
      fimCarne.setDate(fimCarne.getDate() + (parseInt(info.carenciaCarne) || 0));
      const hoje = new Date();
      const parseAlert = (d) => {
        const [dd, mm, aa] = d.split('/');
        return new Date(aa, mm - 1, dd);
      };
      const alertas = await getKeyValue('alertasEstoque');
      alertas.push({
        numeroAnimal: dados.animal,
        produto: dados.medicamento,
        leiteAte: formatar(fimLeite),
        carneAte: formatar(fimCarne),
      });
      await setKeyValue('alertasEstoque', alertas);
      window.dispatchEvent(new Event('alertaEstoqueAtualizado'));
    }
    window.dispatchEvent(new Event('dadosUsuarioAtualizados'));
  };

  const excluirOcorrencia = async (idx) => {
    const alvo = ocorrencias[idx];
    if (alvo?.id) await execute('DELETE FROM ocorrencias WHERE id = ?', [alvo.id]);
    const lista = ocorrencias.filter((_, i) => i !== idx);
    setOcorrencias(lista);
    window.dispatchEvent(new Event('dadosUsuarioAtualizados'));
  };

  const excluirTratamento = async (idx) => {
    const alvo = tratamentos[idx];
    if (alvo?.id) await execute('DELETE FROM tratamentos WHERE id = ?', [alvo.id]);
    const lista = tratamentos.filter((_, i) => i !== idx);
    setTratamentos(lista);
    window.dispatchEvent(new Event('dadosUsuarioAtualizados'));
  };

  const renderizar = () => {
    switch (aba) {
      case 'ocorrencias':
        return (
          <>
            <button className="botao-acao mb-2" onClick={() => setMostrarOcorrencia(true)}>＋ Nova Ocorrência</button>
            <TabelaOcorrencias lista={ocorrencias} onExcluir={excluirOcorrencia} />
            {mostrarOcorrencia && (
              <ModalOcorrencia animais={animais} onFechar={() => setMostrarOcorrencia(false)} onSalvar={salvarOcorrencia} />
            )}
          </>
        );
      case 'tratamentos':
        return (
          <>
            <button
              className="botao-acao mb-2"
              onClick={() => {
                setDadosTratamento(null);
                setMostrarTratamento(true);
              }}
            >
              ＋ Novo Tratamento
            </button>
            <TabelaTratamentos lista={tratamentos} onExcluir={excluirTratamento} />
            {mostrarTratamento && (
              <ModalTratamento
                animais={animais}
                produtos={produtos}
                dados={dadosTratamento}
                onFechar={() => {
                  setMostrarTratamento(false);
                  setDadosTratamento(null);
                }}
                onSalvar={salvarTratamento}
              />
            )}
          </>
        );
      case 'alertas':
        return <AlertasSaude />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full px-4 py-2">
      <SubAbasSaude abaAtiva={aba} setAbaAtiva={setAba} />
      <div className="mt-4">
        {renderizar()}
      </div>
    </div>
  );
}
