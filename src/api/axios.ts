import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://examen-final-backend-tec-web-ii-production.up.railway.app/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de REQUEST — añade el token automáticamente
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de RESPONSE — solo desloguea si el token no existe o expiró
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLoginRequest = error.config?.url?.includes('/Token');
    const token = localStorage.getItem('token');

    if (error.response?.status === 401 && !esLoginRequest && !token) {
      // No hay token en absoluto — redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/iniciar-sesion';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;