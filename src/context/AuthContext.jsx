import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services";
import useIdleTimer from "../hooks/useIdleTimer";

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutos en milisegundos

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  // Callback para manejar inactividad
  const handleIdle = useCallback(() => {
    if (user) {
      console.warn("🔒 Sesión cerrada por inactividad (10 minutos)");
      authService.logout();
      setUser(null);
      setShowInactivityWarning(true);
      // NO usar window.location.href - dejar que React Router maneje la navegación
    }
  }, [user]);

  // Hook de inactividad
  useIdleTimer(INACTIVITY_TIMEOUT, handleIdle);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();

    // Verificar si la sesión está expirada
    if (currentUser && authService.isSessionExpired(INACTIVITY_TIMEOUT)) {
      console.warn("🔒 Sesión expirada detectada al cargar");
      authService.logout();
      setUser(null);
    } else {
      setUser(currentUser);
    }

    setLoading(false);
  }, []);

  // Verificar expiración periódicamente
  useEffect(() => {
    if (!user) return;

    const checkExpiration = setInterval(() => {
      if (authService.isSessionExpired(INACTIVITY_TIMEOUT)) {
        console.warn("🔒 Sesión expirada detectada en verificación periódica");
        authService.logout();
        setUser(null);
        // NO usar window.location.href - dejar que React Router maneje la navegación
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(checkExpiration);
  }, [user]);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setShowInactivityWarning(false);
      return data;
    } catch (error) {
      // Relanzar el error para que el componente Login lo capture
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.rol === "administrador";
  const isProfesor = user?.rol === "profesor";

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isProfesor,
    loading,
    showInactivityWarning,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
