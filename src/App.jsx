import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SistemaBase from "./layout/SistemaBase";

import Inicio from "./pages/AppTarefas";
import Animais from "./pages/Animais";
import Ajustes from "./pages/Ajustes";
import Admin from "./pages/Admin/Admin";

const Stub = (t) => () => <div style={{ padding: 16 }}>Página {t}</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SistemaBase />}>
          <Route index element={<Navigate to="/inicio" replace />} />
          <Route path="inicio" element={<Inicio />} />
          <Route path="animais" element={<Animais />} />
          <Route path="leite" element={<Stub t="Leite" />} />
          <Route path="reproducao" element={<Stub t="Reprodução" />} />
          <Route path="bezerras" element={<Stub t="Bezerras" />} />
          <Route path="financeiro" element={<Stub t="Financeiro" />} />
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
