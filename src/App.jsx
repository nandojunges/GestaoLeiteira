import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import SistemaBase from './layout/SistemaBase';
import Login from './pages/Auth/Login';
import Inicio from './pages/Inicio'; // substitua pelo seu componente correto
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jwtDecode from 'jwt-decode';
function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      if (!decoded || !decoded.idProdutor) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (e) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Routes>
      {/* Login fora do layout principal */}
      <Route path="/login" element={<Login />} />

      {/* Todo o resto usa o layout SistemaBase */}
      <Route path="/" element={<SistemaBase />}>
        <Route path="inicio" element={<Inicio />} />
        {/* Aqui você pode adicionar outras páginas depois */}
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} pauseOnHover theme="light" />
    </BrowserRouter>
  );
}
