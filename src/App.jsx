import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppTarefas from "./pages/AppTarefas";
import Estoque from './pages/Estoque';
import Animais from './pages/Animais';
import AjustesSistema from './pages/AjustesSistema';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppTarefas />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/animais" element={<Animais />} />
        <Route path="/ajustes" element={<AjustesSistema />} />
      </Routes>
    </Router>
  );
}

export default App;
