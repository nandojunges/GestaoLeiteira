import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ConfiguracaoProvider } from './context/ConfiguracaoContext';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './routes';
// TODO: Quando atualizar para React Router v7, adicionar future flag v7_startTransition

const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfiguracaoProvider>
      <RouterProvider router={router} />
    </ConfiguracaoProvider>
  </React.StrictMode>
);
// estilos FullCalendar
import '@fullcalendar/core/index.css';
import '@fullcalendar/daygrid/index.css';
import '@fullcalendar/timegrid/index.css';
