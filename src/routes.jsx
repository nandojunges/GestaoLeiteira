import React from 'react';
// TODO: Quando atualizar para React Router v7, adicionar future flag v7_startTransition
import { Navigate, Route, createRoutesFromElements } from 'react-router-dom';
import RotaProtegida from './utils/RotaProtegida';
import SistemaBase from './layout/SistemaBase';
import AppTarefas from './pages/AppTarefas';
import Animais from './pages/Animais';
import Bezerras from './pages/Bezerras';
import Reproducao from './pages/Reproducao';
import Leite from './pages/Leite';
import Saude from './pages/Saude';
import ConsumoReposicao from './pages/ConsumoReposicao';
import Financeiro from './pages/Financeiro/Financeiro';
import Calendario from './pages/Calendario';
import Ajustes from './pages/Ajustes';
import Relatorios from './pages/Relatorios';
import Cadastro from './pages/Auth/Cadastro';
import VerificarEmail from './pages/Auth/VerificarEmail';
import Login from './pages/Auth/Login';
import EsqueciSenha from './pages/Auth/EsqueciSenha';
import BemVindo from './pages/Auth/BemVindo';
import Admin from './pages/Admin/Admin';
import ListaUsuarios from './pages/Admin/ListaUsuarios';
import RotaAdmin from './utils/RotaAdmin';
import Fazenda from './pages/Fazenda/Fazenda';
import Logout from './pages/Auth/Logout';
import ConfigTelaInicial from './pages/ConfigTelaInicial';

const routes = createRoutesFromElements(
  <>
  <Route path="/" element={<SistemaBase />}>
    <Route path="inicio" element={<RotaProtegida><AppTarefas /></RotaProtegida>} />
    <Route path="animais" element={<RotaProtegida><Animais /></RotaProtegida>} />
    <Route path="bezerras" element={<RotaProtegida><Bezerras /></RotaProtegida>} />
    <Route path="reproducao" element={<RotaProtegida><Reproducao /></RotaProtegida>} />
    <Route path="leite" element={<RotaProtegida><Leite /></RotaProtegida>} />
    <Route path="saude" element={<RotaProtegida><Saude /></RotaProtegida>} />
    <Route path="consumoestoque" element={<RotaProtegida><ConsumoReposicao /></RotaProtegida>} />
    <Route path="consumo" element={<RotaProtegida><ConsumoReposicao /></RotaProtegida>} />
    <Route path="financeiro" element={<RotaProtegida><Financeiro /></RotaProtegida>} />
    <Route path="calendario" element={<RotaProtegida><Calendario /></RotaProtegida>} />
    <Route path="ajustes" element={<RotaProtegida><Ajustes /></RotaProtegida>} />
    <Route path="relatorios" element={<RotaProtegida><Relatorios /></RotaProtegida>} />
    <Route index element={<RotaProtegida><Navigate to="/inicio" replace /></RotaProtegida>} />
    <Route path="*" element={<Navigate to="/inicio" replace />} />
  </Route>
  <Route path="/cadastro" element={<Cadastro />} />
  <Route path="/verificar-email" element={<VerificarEmail />} />
  <Route path="/login" element={<Login />} />
  <Route path="/esqueci-senha" element={<EsqueciSenha />} />
  <Route path="/bemvindo" element={<BemVindo />} />
  <Route path="/admin" element={<RotaAdmin><Admin /></RotaAdmin>} />
  <Route path="/admin/usuarios" element={<RotaAdmin><ListaUsuarios /></RotaAdmin>} />
  <Route path="/fazenda" element={<Fazenda />} />
  <Route path="/painel" element={<Fazenda />} />
  <Route path="/configuracoes-inicial" element={<ConfigTelaInicial />} />
  <Route path="logout" element={<Logout />} />
  </>
);

export default routes;