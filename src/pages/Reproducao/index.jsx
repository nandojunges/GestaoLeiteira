import React, { useState } from 'react';
import SubAbasReproducao from './SubAbasReproducao';
import VisaoGeralReproducao from './VisaoGeralReproducao';
import ProtocolosReprodutivos from './ProtocolosReprodutivos';
import DiagnosticoCio from './DiagnosticoCio';

export default function Index() {
  const [abaAtiva, setAbaAtiva] = useState('visaoGeral');

  const renderizarConteudo = () => {
    switch (abaAtiva) {
      case 'visaoGeral':
        return <VisaoGeralReproducao />;
      case 'protocolos':
        return <ProtocolosReprodutivos />;
      case 'diagnosticoCio':
        return <DiagnosticoCio />;
      default:
        return <VisaoGeralReproducao />;
    }
  };

  return (
    <div className="w-full px-4 py-2">
      <SubAbasReproducao abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
      <div className="mt-4">
        {renderizarConteudo()}
      </div>
    </div>
  );
}
