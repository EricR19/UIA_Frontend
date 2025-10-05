import { useState } from "react";
import { profesoresService } from "../../services";
import { useAuth } from "../../context/AuthContext";
import "./Ajustes.css";

const Ajustes = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar mensajes al escribir
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("La nueva contraseña debe ser diferente a la actual");
      return;
    }

    // Verificar que el usuario esté cargado
    if (!user || !user.user_id) {
      setError(
        "Error: Usuario no identificado. Por favor, inicia sesión nuevamente."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await profesoresService.updatePassword(user.user_id, {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      });

      setSuccess("¡Contraseña actualizada exitosamente!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      if (error.response?.status === 401) {
        setError("La contraseña actual es incorrecta");
      } else {
        setError(
          error.response?.data?.detail || "Error al actualizar la contraseña"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ajustes-page">
      <div className="page-header">
        <h1>⚙️ Ajustes de Cuenta</h1>
      </div>

      <div className="ajustes-container">
        <div className="ajustes-card">
          <div className="user-info-section">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="user-details">
              <h2>{user?.name || "Usuario"}</h2>
              <p>{user?.email || ""}</p>
              <span className={`role-badge role-${user?.role}`}>
                {user?.role === "administrador"
                  ? "👑 Administrador"
                  : "👨‍🏫 Profesor"}
              </span>
            </div>
          </div>

          <div className="divider"></div>

          <div className="password-section">
            <h3>🔐 Cambiar Contraseña</h3>
            <p className="section-description">
              Actualiza tu contraseña para mantener tu cuenta segura
            </p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">
                  Contraseña Actual <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña actual"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">
                  Nueva Contraseña <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirmar Nueva Contraseña <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite la nueva contraseña"
                  disabled={loading}
                />
              </div>

              <div className="password-requirements">
                <h4>Requisitos de la contraseña:</h4>
                <ul>
                  <li
                    className={formData.newPassword.length >= 6 ? "valid" : ""}
                  >
                    Al menos 6 caracteres
                  </li>
                  <li
                    className={
                      formData.newPassword &&
                      formData.newPassword === formData.confirmPassword
                        ? "valid"
                        : ""
                    }
                  >
                    Las contraseñas coinciden
                  </li>
                  <li
                    className={
                      formData.currentPassword &&
                      formData.newPassword &&
                      formData.currentPassword !== formData.newPassword
                        ? "valid"
                        : ""
                    }
                  >
                    Diferente a la contraseña actual
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                className="btn-primary btn-full"
                disabled={loading}
              >
                {loading ? "Actualizando..." : "✓ Actualizar Contraseña"}
              </button>
            </form>
          </div>
        </div>

        <div className="tips-card">
          <h3>💡 Consejos de Seguridad</h3>
          <ul className="tips-list">
            <li>
              <span className="tip-icon">🔒</span>
              <div>
                <strong>Contraseña fuerte:</strong>
                <p>Usa una combinación de letras, números y símbolos</p>
              </div>
            </li>
            <li>
              <span className="tip-icon">🔄</span>
              <div>
                <strong>Cambio regular:</strong>
                <p>Actualiza tu contraseña periódicamente</p>
              </div>
            </li>
            <li>
              <span className="tip-icon">🚫</span>
              <div>
                <strong>No compartas:</strong>
                <p>Nunca compartas tu contraseña con nadie</p>
              </div>
            </li>
            <li>
              <span className="tip-icon">⚠️</span>
              <div>
                <strong>Sospecha de actividad:</strong>
                <p>
                  Si notas algo inusual, cambia tu contraseña inmediatamente
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Ajustes;
