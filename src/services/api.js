import axios from "axios";

// Usar variable de entorno para la URL del API
// En desarrollo: http://localhost:8000/api
// En producción: https://uia-backend-3j1t.onrender.com/api
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Usar sessionStorage en vez de localStorage
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Actualizar timestamp de última actividad en cada request
      sessionStorage.setItem("lastActivity", Date.now().toString());
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si es un error 401 en el endpoint de login, NO redirigir
      // Dejar que el componente Login maneje el error
      const isLoginEndpoint = error.config?.url?.includes("/auth/login");

      if (!isLoginEndpoint) {
        // Solo limpiar sesión y redirigir si NO es el login
        // Esto maneja sesiones expiradas en otras páginas
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("loginTime");
        sessionStorage.removeItem("lastActivity");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      // Si ES el login, simplemente rechazar el error para que Login.jsx lo capture
    }
    return Promise.reject(error);
  }
);

export default api;
