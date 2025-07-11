import React, { useEffect, useState } from 'react';
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

export default function AlertasSaude() {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      const animais = await select('SELECT * FROM animais');
      const todos = await select('SELECT * FROM alertasSaude');

      const parse = (d) => {
        if (!d) return null;
        const [dia, mes, ano] = d.split('/');
        return new Date(ano, mes - 1, dia);
      };

      const hoje = new Date();
      const ativos = todos.filter((a) => {
        const l = parse(a.leiteAte);
        const c = parse(a.carneAte);
        return (l && l >= hoje) || (c && c >= hoje);
      });

      const lista = [];
      ativos.forEach((a) => {
        const nome = animais.find((n) => n.numero === a.numeroAnimal)?.nome || a.numeroAnimal;
        if (a.leiteAte && parse(a.leiteAte) >= hoje) {
          lista.push({ animal: nome, medicamento: a.produto, tipo: 'leite', liberacao: a.leiteAte });
        }
        if (a.carneAte && parse(a.carneAte) >= hoje) {
          lista.push({ animal: nome, medicamento: a.produto, tipo: 'carne', liberacao: a.carneAte });
        }
      });

      // remove alertas expirados
      const idsAtivos = new Set(ativos.map(a => a.id));
      (todos || []).forEach(d => {
        if (!idsAtivos.has(d.id)) execute('DELETE FROM alertasSaude WHERE id = ?', [d.id]);
      });
      window.dispatchEvent(new Event('alertasCarenciaAtualizados'));
      setAlertas(lista);
    };

    carregar();
    window.addEventListener('alertasCarenciaAtualizados', carregar);
    return () => window.removeEventListener('alertasCarenciaAtualizados', carregar);
  }, []);

  if (alertas.length === 0) return <p>Nenhum alerta.</p>;

  const titulos = ['Animal', 'Medicamento', 'Tipo', 'Liberação'];

  return (
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
          {alertas.map((a, i) => (
            <tr key={i}>
              <td>{a.animal}</td>
              <td>{a.medicamento}</td>
              <td>{a.tipo}</td>
              <td>{a.liberacao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
