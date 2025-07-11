import { useEffect, useState } from 'react';
import api from '../../api';

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    api.get('/usuarios')
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Usuários Cadastrados</h1>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">E-mail</th>
            <th className="p-2 text-left">Senha (hash)</th>
            <th className="p-2 text-center">Verificado</th>
            <th className="p-2 text-left">Telefone</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2">{u.id}</td>
              <td className="p-2">{u.nome}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2 break-all">{u.senha}</td>
              <td className="p-2 text-center">{u.verificado ? '✅' : '❌'}</td>
              <td className="p-2">{u.telefone || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
