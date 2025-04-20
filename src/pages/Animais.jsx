import React from 'react';
import Vacas from './Vacas_com_modal_sobreposicao';

function Animais() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Poppins, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>🐮 Gestão de Animais</h1>
      <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
        Cadastre aqui suas vacas para controle de produção, protocolos e outras informações zootécnicas.
      </p>
      
      <Vacas />
    </div>
  );
}

export default Animais;