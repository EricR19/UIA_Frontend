import api from "./api";

export const authService = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.data.access_token) {
      // Usar sessionStorage en vez de localStorage (más seguro, se limpia al cerrar navegador)
      sessionStorage.setItem("token", response.data.access_token);
      sessionStorage.setItem("loginTime", Date.now().toString());

      // Decodificar el token para obtener información del usuario
      const userInfo = JSON.parse(
        atob(response.data.access_token.split(".")[1])
      );
      sessionStorage.setItem("user", JSON.stringify(userInfo));
      sessionStorage.setItem("lastActivity", Date.now().toString());
    }

    return response.data;
  },

  logout: () => {
    // Limpiar TODA la sesión
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("loginTime");
    sessionStorage.removeItem("lastActivity");

    // También limpiar localStorage por si acaso (migración)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const userStr = sessionStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!sessionStorage.getItem("token");
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.rol === "administrador";
  },

  isProfesor: () => {
    const user = authService.getCurrentUser();
    return user?.rol === "profesor";
  },

  updateActivity: () => {
    // Actualizar timestamp de última actividad
    if (sessionStorage.getItem("token")) {
      sessionStorage.setItem("lastActivity", Date.now().toString());
    }
  },

  getLastActivity: () => {
    const lastActivity = sessionStorage.getItem("lastActivity");
    return lastActivity ? parseInt(lastActivity) : null;
  },

  isSessionExpired: (maxInactiveTime = 600000) => {
    // 10 minutos
    const lastActivity = authService.getLastActivity();
    if (!lastActivity) return true;
    return Date.now() - lastActivity > maxInactiveTime;
  },
};

export const estudiantesService = {
  getAll: () => api.get("/estudiantes"),
  getById: (id) => api.get(`/estudiantes/${id}`),
  create: (data) => api.post("/estudiantes", data),
  update: (id, data) => api.put(`/estudiantes/${id}`, data),
  delete: (id) => api.delete(`/estudiantes/${id}`),
  importar: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/estudiantes/importar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const profesoresService = {
  getAll: () => api.get("/profesores"),
  getById: (id) => api.get(`/profesores/${id}`),
  create: (data) => api.post("/profesores", data),
  update: (id, data) => api.put(`/profesores/${id}`, data),
  delete: (id) => api.delete(`/profesores/${id}`),
  updatePassword: (id, password) =>
    api.put(`/profesores/${id}`, { Password: password }),
};

export const rubrosService = {
  getAll: () => api.get("/rubros"),
  getById: (id) => api.get(`/rubros/${id}`),
  getSemana: (semana) => api.get(`/rubros-semanales/semana/${semana}`),
  getCalendario: () => api.get("/rubros-semanales/calendario"),
};

export const notasService = {
  getByEstudiante: (estudianteId) =>
    api.get(`/notas/estudiante/${estudianteId}`),
  getCalculadas: (estudianteId) =>
    api.get(`/notas/estudiante/${estudianteId}/calculadas`),
  getNotaFinal: (estudianteId) =>
    api.get(`/notas/estudiante/${estudianteId}/calculada`),
  inicializarSemanas: (estudianteId) =>
    api.post(`/notas/inicializar-semanas/${estudianteId}`),
  update: (notaId, data) => api.put(`/notas/${notaId}`, data),
  create: (data) => api.post("/notas", data),
  getHistorialEstudiante: (estudianteId, limit = 50) =>
    api.get(`/notas/historial/estudiante/${estudianteId}`, {
      params: { limit },
    }),
  getHistorialNota: (notaId) => api.get(`/notas/historial/nota/${notaId}`),
  exportarExcel: (estudianteId) =>
    api.get(`/notas/estudiante/${estudianteId}/export-excel`, {
      responseType: "blob", // Importante para archivos binarios
    }),
};
