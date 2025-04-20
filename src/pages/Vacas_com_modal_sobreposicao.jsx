import React, { useState, useEffect } from 'react';

function Vacas() {
  const [vacas, setVacas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [novaVaca, setNovaVaca] = useState({
    nome: '',
    brinco: '',
    grupo: '',
    nascimento: ''
  });

  useEffect(() => {
    const armazenadas = localStorage.getItem('vacas');
    if (armazenadas) {
      setVacas(JSON.parse(armazenadas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vacas', JSON.stringify(vacas));
  }, [vacas]);

  const handleChange = (e) => {
    setNovaVaca({ ...novaVaca, [e.target.name]: e.target.value });
  };

  const adicionarVaca = () => {
    if (!novaVaca.nome || !novaVaca.brinco || !novaVaca.grupo) return;
    const nova = { ...novaVaca, id: Date.now() };
    setVacas([...vacas, nova]);
    setNovaVaca({ nome: '', brinco: '', grupo: '', nascimento: '' });
    setMostrarModal(false);
  };

  const removerVaca = (id) => {
    if (window.confirm("Deseja remover esta vaca?")) {
      setVacas(vacas.filter(v => v.id !== id));
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Poppins, sans-serif' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>🐄 Vacas Cadastradas</h2>

      <button onClick={() => setMostrarModal(true)} style={{
        backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem',
        border: 'none', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer'
      }}>
        ➕ Cadastrar Vaca
      </button>

      {vacas.length === 0 ? (
        <p style={{ marginTop: '1rem' }}>Nenhuma vaca cadastrada.</p>
      ) : (
        <ul style={{ marginTop: '1rem' }}>
          {vacas.map(v => (
            <li key={v.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
              <strong>{v.nome}</strong> | Brinco: {v.brinco} | Grupo: {v.grupo}
              {v.nascimento && <> | Nasc.: {v.nascimento}</>}
              <button onClick={() => removerVaca(v.id)} style={{
                marginLeft: '1rem', backgroundColor: '#ef4444', color: '#fff',
                border: 'none', borderRadius: '0.375rem', padding: '0.25rem 0.5rem', cursor: 'pointer'
              }}>🗑️</button>
            </li>
          ))}
        </ul>
      )}

      {mostrarModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff', padding: '2rem', borderRadius: '1rem',
            width: '100%', maxWidth: '500px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>➕ Nova Vaca</h3>

            <input name="nome" placeholder="Nome ou Nº" value={novaVaca.nome} onChange={handleChange}
              style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }} />
            <input name="brinco" placeholder="Brinco" value={novaVaca.brinco} onChange={handleChange}
              style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }} />
            <input name="grupo" placeholder="Grupo / Lote" value={novaVaca.grupo} onChange={handleChange}
              style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }} />
            <input name="nascimento" type="date" value={novaVaca.nascimento} onChange={handleChange}
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setMostrarModal(false)} style={{
                padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', backgroundColor: '#f3f4f6'
              }}>Cancelar</button>
              <button onClick={adicionarVaca} style={{
                backgroundColor: '#22c55e', color: '#fff', border: 'none',
                padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: '600'
              }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vacas;