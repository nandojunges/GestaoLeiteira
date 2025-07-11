import React, { useEffect, useState } from 'react';
import { db } from '../../utils/db';

export default function AppTarefas() {
  const [tarefas, setTarefas] = useState([]);
  const hoje = new Date().toISOString().slice(0, 10);

  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

  const run = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

  const carregar = async () => {
    await run(
      `CREATE TABLE IF NOT EXISTS tarefas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        descricao TEXT,
        data TEXT,
        tipo TEXT,
        concluida BOOLEAN
      )`
    );
    const rows = await query('SELECT * FROM tarefas WHERE data = ?', [hoje]);
    setTarefas(rows);
  };

  const marcarComoConcluida = async (id) => {
    await run('UPDATE tarefas SET concluida = ? WHERE id = ?', [1, id]);
    carregar();
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
        Tarefas de {hoje.split('-').reverse().join('/')}
      </h2>
      {tarefas.length === 0 ? (
        <p>Nenhuma tarefa para hoje.</p>
      ) : (
        tarefas.map((t) => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
              background: '#f1f5f9',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
            }}
          >
            <span>{t.descricao}</span>
            {!t.concluida && (
              <button onClick={() => marcarComoConcluida(t.id)}>Concluir</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
