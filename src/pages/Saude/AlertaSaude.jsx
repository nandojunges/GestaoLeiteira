import React, { useEffect, useState } from 'react';
import { db } from '../../utils/db';
import { formatarDataBR } from '../Animais/utilsAnimais';

const select = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

function parseData(str) {
  if (!str) return null;
  const [d, m, y] = str.split('/');
  return new Date(y, m - 1, d);
}

function gerarAlertas(ocorrencias, tratamentos, animais) {
  const hoje = new Date();
  const alertas = [];

  const nomeAnimal = (num) => {
    return animais.find((a) => String(a.numero) === String(num))?.nome || num;
  };

  // 🔴 Carência ativa
  tratamentos.forEach((t) => {
    const inicio = parseData(t.data);
    const dias = parseInt(t.carencia || t.carenciaDias || 0);
    if (!inicio || !dias) return;
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + dias);
    if (fim >= hoje) {
      alertas.push({
        animal: nomeAnimal(t.animal || t.numeroAnimal),
        tipo: 'Carência ativa',
        data: formatarDataBR(hoje),
        dataObj: hoje,
        acao: 'Suspender ordenha',
      });
    }
  });

  // 🟠 Mastite recorrente
  const mastites = ocorrencias.filter(
    (o) => (o.diagnostico || '').toLowerCase().includes('mastite') && o.data
  );
  const mapaMastite = new Map();
  mastites.forEach((o) => {
    const num = o.animal || o.numeroAnimal;
    if (!mapaMastite.has(num)) mapaMastite.set(num, []);
    mapaMastite.get(num).push(parseData(o.data));
  });
  mapaMastite.forEach((datas, num) => {
    datas.sort((a, b) => a - b);
    for (let i = 1; i < datas.length; i++) {
      const diff = (datas[i] - datas[i - 1]) / (1000 * 60 * 60 * 24);
      if (diff <= 60) {
        alertas.push({
          animal: nomeAnimal(num),
          tipo: 'Repetição de mastite',
          data: formatarDataBR(datas[i]),
          dataObj: datas[i],
          acao: 'Consultar',
        });
        break;
      }
    }
  });

  // 🟡 Tratamento prolongado
  const mapaTrat = new Map();
  tratamentos.forEach((t) => {
    const num = t.animal || t.numeroAnimal;
    const dt = parseData(t.data);
    if (!num || !dt) return;
    if (!mapaTrat.has(num)) mapaTrat.set(num, []);
    mapaTrat.get(num).push(dt);
  });
  mapaTrat.forEach((datas, num) => {
    datas.sort((a, b) => a - b);
    let seq = 1;
    for (let i = 1; i < datas.length; i++) {
      const diff = (datas[i] - datas[i - 1]) / (1000 * 60 * 60 * 24);
      if (diff <= 1) seq += 1; else seq = 1;
      if (seq > 7) {
        alertas.push({
          animal: nomeAnimal(num),
          tipo: 'Tratamento prolongado',
          data: formatarDataBR(datas[i]),
          dataObj: datas[i],
          acao: 'Verificar',
        });
        break;
      }
    }
  });

  // 🔵 Muitas ocorrências
  const limite = new Date();
  limite.setMonth(limite.getMonth() - 3);
  const contagem = {};
  ocorrencias.forEach((o) => {
    const dt = parseData(o.data);
    if (!dt || dt < limite) return;
    const num = o.animal || o.numeroAnimal;
    contagem[num] = (contagem[num] || 0) + 1;
  });
  Object.entries(contagem).forEach(([num, qtd]) => {
    if (qtd > 3) {
      alertas.push({
        animal: nomeAnimal(num),
        tipo: 'Muitas ocorrências',
        data: formatarDataBR(hoje),
        dataObj: hoje,
        acao: 'Verificar',
      });
    }
  });

  return alertas;
}

export default function AlertaSaude() {
  const [alertas, setAlertas] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    const carregar = async () => {
      const ocorrencias = await select('SELECT * FROM ocorrencias');
      const tratamentos = await select('SELECT * FROM tratamentos');
      const animais = await select('SELECT * FROM animais');
      const lista = gerarAlertas(ocorrencias, tratamentos, animais);
      lista.sort((a, b) => b.dataObj - a.dataObj);
      setAlertas(lista);
    };

    carregar();
    window.addEventListener('dadosUsuarioAtualizados', carregar);
    return () => window.removeEventListener('dadosUsuarioAtualizados', carregar);
  }, []);

  const tipos = [
    { id: 'todos', label: 'Todos' },
    { id: 'Carência ativa', label: 'Carência ativa' },
    { id: 'Repetição de mastite', label: 'Repetição de mastite' },
    { id: 'Tratamento prolongado', label: 'Tratamento prolongado' },
    { id: 'Muitas ocorrências', label: 'Muitas ocorrências' },
  ];

  const filtrados =
    filtro === 'todos' ? alertas : alertas.filter((a) => a.tipo === filtro);

  const titulos = ['Animal', 'Tipo', 'Data', 'Ação'];

  return (
    <div>
      <div style={{ marginBottom: '0.5rem', textAlign: 'right' }}>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ padding: '0.25rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}
        >
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      {filtrados.length === 0 ? (
        <p>Nenhum alerta.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="tabela-padrao">
            <thead>
              <tr>
                {titulos.map((t, i) => (
                  <th key={i}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((a, i) => (
                <tr key={i}>
                  <td>{a.animal}</td>
                  <td>{a.tipo}</td>
                  <td>{a.data}</td>
                  <td>{a.acao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

