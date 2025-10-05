import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState(
    localStorage.getItem("rememberedEmail") || ""
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("rememberedEmail")
  );
  const navigate = useNavigate();
  const { login, showInactivityWarning } = useAuth();

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingrese un correo electrónico válido");
      return;
    }

    // Validación de contraseña
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Limpiar error antes de intentar
    setError("");
    setLoading(true);

    // Hacer el login
    login(email, password)
      .then(() => {
        // Guardar email si el usuario marcó "Recordarme"
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        setLoading(false);
        navigate("/", { replace: true });
      })
      .catch((err) => {
        const status = err.response?.status;

        if (status === 401 || status === 404 || status === 403) {
          setError("Correo electrónico o contraseña incorrectos");
        } else {
          setError("Error al iniciar sesión. Intente nuevamente");
        }

        setLoading(false);
      });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Sistema de Notas UIA</h1>
          <p>Ingrese sus credenciales</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {showInactivityWarning && (
            <div className="warning-message">
              🔒 Su sesión fue cerrada por inactividad (10 minutos). Por favor,
              inicie sesión nuevamente.
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
              placeholder="admin@uia.edu"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div className="form-group remember-me">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Recordar mi correo electrónico</span>
            </label>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>

          {error && <div className="error-message-text">❌ {error}</div>}
        </form>

        <div className="login-footer">
          <p>Sistema Académico v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
