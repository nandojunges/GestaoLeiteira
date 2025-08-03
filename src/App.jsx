import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SistemaBase from './layout/SistemaBase';
import Login from './pages/Auth/Login';
import Inicio from './pages/Inicio'; // substitua pelo seu componente correto
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jwtDecode from 'jwt-decode';

export default function App() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (!decoded || !decoded.idProdutor) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } catch (e) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login fora do layout principal */}
        <Route path="/login" element={<Login />} />

        {/* Todo o resto usa o layout SistemaBase */}
        <Route path="/" element={<SistemaBase />}>
          <Route path="inicio" element={<Inicio />} />
          {/* Aqui você pode adicionar outras páginas depois */}
        </Route>
      </Routes>

      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} pauseOnHover theme="light" />
    </BrowserRouter>
  );
}
