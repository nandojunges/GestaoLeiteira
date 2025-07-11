import React, { useState } from 'react';

export default function ModalCadastroSecagem({ vaca, onFechar, onSalvar }) {
  const [data, setData] = useState('');
  const [plano, setPlano] = useState('');
  const [carenciaCarne, setCarenciaCarne] = useState('');
  const [carenciaLeite, setCarenciaLeite] = useState('');
  const [principioAtivo, setPrincipioAtivo] = useState('');
  const [nomeComercial, setNomeComercial] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Exemplo de dados para autocomplete (será substituído pelos dados do sistema)
  const sugestoesPrincipios = ['Cefapirina', 'Penicilina', 'Enrofloxacina'];
  const sugestoesNomes = ['Cepravin', 'Mastizone', 'Kem-Tetra'];

  const salvar = () => {
    const secagem = {
      numero: vaca.numero,
      data,
      plano,
      carenciaCarne,
      carenciaLeite,
      principioAtivo,
      nomeComercial,
      responsavel,
      observacoes,
    };
    onSalvar(secagem);
    onFechar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center z-50 pt-12">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative">
        {/* Tarja azul no topo */}
        <div className="h-6 bg-blue-800 rounded-t-lg"></div>

        <div className="p-6 max-h-[80vh] overflow-auto">
          <h2 className="text-xl font-bold mb-4 text-blue-900">Aplicar Secagem - Vaca {vaca.numero || vaca.brinco}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700">Data da Secagem</label>
              <input type="date" value={data} onChange={e => setData(e.target.value)} className="input" />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Plano de Tratamento</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={plano}
                  onChange={e => setPlano(e.target.value)}
                  className="input flex-1"
                />
                <button className="px-2 text-blue-600 text-xl hover:scale-125 transition">➕</button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700">Carência (Carne)</label>
              <input
                type="number"
                value={carenciaCarne}
                onChange={e => setCarenciaCarne(e.target.value)}
                className="input"
                placeholder="dias"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Carência (Leite)</label>
              <input
                type="number"
                value={carenciaLeite}
                onChange={e => setCarenciaLeite(e.target.value)}
                className="input"
                placeholder="dias"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Princípio Ativo</label>
              <input
                list="listaPrincipios"
                value={principioAtivo}
                onChange={e => setPrincipioAtivo(e.target.value)}
                className="input"
              />
              <datalist id="listaPrincipios">
                {sugestoesPrincipios.map((p, i) => <option key={i} value={p} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-sm text-gray-700">Nome Comercial</label>
              <input
                list="listaComerciais"
                value={nomeComercial}
                onChange={e => setNomeComercial(e.target.value)}
                className="input"
              />
              <datalist id="listaComerciais">
                {sugestoesNomes.map((n, i) => <option key={i} value={n} />)}
              </datalist>
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-700">Responsável</label>
              <input
                type="text"
                value={responsavel}
                onChange={e => setResponsavel(e.target.value)}
                className="input w-full"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-gray-700">Observações</label>
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                className="input w-full"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-4">
            <button onClick={onFechar} className="text-red-600 hover:underline">✖ Cancelar</button>
            <button onClick={salvar} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition">
              Aplicar Secagem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
