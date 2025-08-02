import axios from 'axios';

const api = axios.create({
  // Garante que a base da API termine com barra caso VITE_API_URL não esteja definida.
  // Assim, chamadas como `api.post('auth/login')` resultam em '/api/auth/login' em vez de 'apiauth/login'.
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : '/api/',
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('token');
  let token = null;
  try {
    token = stored ? JSON.parse(stored)?.token ?? stored : null;
  } catch (err) {
    token = stored;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
