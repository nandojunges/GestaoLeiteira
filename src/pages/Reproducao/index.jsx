import React, { useState } from 'react';
import SubAbasReproducao from './SubAbasReproducao';
import VisaoGeralReproducao from './VisaoGeralReproducao';
import ProtocolosReprodutivos from './ProtocolosReprodutivos';
import DiagnosticoCio from './DiagnosticoCio';
import ConfigurarPEV from './ConfigurarPEV';
import HistoricoCompleto from './HistoricoCompleto';

export default function Index() {
  const [abaAtiva, setAbaAtiva] = useState('visaoGeral');

  const renderizarConteudo = () => {
    switch (abaAtiva) {
      case 'visaoGeral':
        return <VisaoGeralReproducao />;
      case 'protocolos':
        return <ProtocolosReprodutivos />;
      case 'diagnosticos':
        return <DiagnosticoCio />;
      case 'configPEV':
        return <ConfigurarPEV />;
      case 'historico':
        return <HistoricoCompleto />;
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
