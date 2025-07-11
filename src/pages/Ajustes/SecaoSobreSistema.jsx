export default function SecaoSobreSistema() {
  const versao = '1.0.0';
  const atualizacao = '2025-06-22';

  const feedback = () => {
    alert('Obrigado pelo feedback!');
  };

  return (
    <section className="bg-white shadow rounded p-4 space-y-2">
      <h2 className="text-xl font-semibold">Sobre o sistema</h2>
      <p>Gestão Leiteira - v{versao}</p>
      <p>Última atualização: {atualizacao}</p>
      <p>Desenvolvido por comunidade open source.</p>
      <button
        onClick={feedback}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Enviar Feedback
      </button>
    </section>
  );
}
