import { useEffect, useState } from "react";
import { profesoresService } from "../../services";
import Toast from "../../components/Toast/Toast";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import "./Profesores.css";

const Profesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfesor, setEditingProfesor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    Nombre: "",
    Apellido: "",
    Especialidad: "",
    Email: "",
    Password: "",
    Rol: "profesor",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadProfesores();
  }, []);

  const loadProfesores = async () => {
    try {
      const response = await profesoresService.getAll();
      setProfesores(response.data);
    } catch (error) {
      setError("Error al cargar profesores");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingProfesor) {
        // Para editar, solo enviamos los campos que cambiaron
        const updateData = { ...formData };
        if (!updateData.Password) {
          delete updateData.Password; // No actualizar contraseña si está vacía
        }
        await profesoresService.update(editingProfesor.Id_profesor, updateData);
        setSuccess("✓ Profesor actualizado correctamente");
      } else {
        // Al crear, NO enviar campo Password (se genera automáticamente en backend)
        const createData = { ...formData };
        delete createData.Password; // Eliminar siempre al crear

        const response = await profesoresService.create(createData);

        // Verificar si el email fue enviado
        if (response.data.email_enviado) {
          setSuccess(
            "✓ Profesor creado correctamente. Email de bienvenida enviado a " +
              formData.Email
          );
        } else {
          setSuccess(
            "✓ Profesor creado correctamente. ⚠️ No se pudo enviar el email de bienvenida."
          );
          if (response.data.email_error) {
            console.warn("Error de email:", response.data.email_error);
          }
        }
      }
      await loadProfesores();
      closeModal();
    } catch (error) {
      setError(error.response?.data?.detail || "Error al guardar profesor");
    }
  };

  const handleEdit = (profesor) => {
    setEditingProfesor(profesor);
    setFormData({
      Nombre: profesor.Nombre,
      Apellido: profesor.Apellido,
      Especialidad: profesor.Especialidad || "",
      Email: profesor.Email,
      Password: "", // No mostrar la contraseña
      Rol: profesor.Rol,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    try {
      await profesoresService.delete(deletingId);
      setSuccess("✓ Profesor eliminado correctamente");
      await loadProfesores();
    } catch (error) {
      setError("Error al eliminar profesor");
    }
    setDeletingId(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProfesor(null);
    setFormData({
      Nombre: "",
      Apellido: "",
      Especialidad: "",
      Email: "",
      Password: "",
      Rol: "profesor",
    });
    setError("");
  };

  const filteredProfesores = profesores.filter(
    (prof) =>
      prof.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.Apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prof.Especialidad &&
        prof.Especialidad.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="loading">Cargando profesores...</div>;
  }

  const profesorToDelete = profesores.find((p) => p.Id_profesor === deletingId);

  return (
    <>
      {/* Toasts */}
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError("")}
          duration={4000}
        />
      )}
      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess("")}
          duration={3000}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showConfirmDelete && profesorToDelete && (
        <ConfirmModal
          message={`¿Está seguro de eliminar al profesor ${profesorToDelete.Nombre} ${profesorToDelete.Apellido}? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirmDelete(false);
            setDeletingId(null);
          }}
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
        />
      )}

      <div className="profesores-page">
        <div className="page-header">
          <h1>👨‍🏫 Gestión de Profesores</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            ➕ Nuevo Profesor
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, email o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-count">
            {filteredProfesores.length} de {profesores.length} profesores
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Especialidad</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfesores.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No se encontraron profesores
                  </td>
                </tr>
              ) : (
                filteredProfesores.map((profesor) => (
                  <tr key={profesor.Id_profesor}>
                    <td>{profesor.Id_profesor}</td>
                    <td>
                      {profesor.Nombre} {profesor.Apellido}
                    </td>
                    <td>{profesor.Email}</td>
                    <td>{profesor.Especialidad || "N/A"}</td>
                    <td>
                      <span className={`badge badge-${profesor.Rol}`}>
                        {profesor.Rol === "administrador"
                          ? "👑 Admin"
                          : "👨‍🏫 Profesor"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(profesor)}
                          className="btn-icon btn-edit"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(profesor.Id_profesor)}
                          className="btn-icon btn-delete"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div
            className="modal-overlay"
            onMouseDown={(e) => {
              // Solo cerrar si el mousedown es directamente en el overlay
              if (e.target === e.currentTarget) {
                closeModal();
              }
            }}
          >
            <div
              className="modal-content"
              onMouseDown={(e) => {
                // Prevenir que cualquier mousedown dentro del contenido cierre el modal
                e.stopPropagation();
              }}
            >
              <div className="modal-header">
                <h2>
                  {editingProfesor ? "✏️ Editar Profesor" : "➕ Nuevo Profesor"}
                </h2>
                <button onClick={closeModal} className="modal-close">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      value={formData.Nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, Nombre: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Apellido *</label>
                    <input
                      type="text"
                      value={formData.Apellido}
                      onChange={(e) =>
                        setFormData({ ...formData, Apellido: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.Email}
                    onChange={(e) =>
                      setFormData({ ...formData, Email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Especialidad</label>
                  <input
                    type="text"
                    value={formData.Especialidad}
                    onChange={(e) =>
                      setFormData({ ...formData, Especialidad: e.target.value })
                    }
                    placeholder="Ej: Medicina Interna"
                  />
                </div>

                {/* Solo mostrar campo de contraseña al EDITAR */}
                {editingProfesor && (
                  <div className="form-group">
                    <label>Nueva Contraseña (opcional)</label>
                    <input
                      type="password"
                      value={formData.Password}
                      onChange={(e) =>
                        setFormData({ ...formData, Password: e.target.value })
                      }
                      minLength={6}
                      placeholder="Dejar vacío para mantener la actual"
                    />
                    <small style={{ color: "#666", fontSize: "0.85em" }}>
                      💡 Solo completa si quieres cambiar la contraseña
                    </small>
                  </div>
                )}

                {/* Mensaje informativo al CREAR */}
                {!editingProfesor && (
                  <div className="form-group">
                    <div
                      style={{
                        background: "#e3f2fd",
                        border: "1px solid #2196f3",
                        borderRadius: "8px",
                        padding: "15px",
                        color: "#1565c0",
                      }}
                    >
                      <strong>🔐 Contraseña Automática</strong>
                      <p style={{ margin: "5px 0 0 0", fontSize: "0.9em" }}>
                        Se generará una contraseña segura automáticamente y se
                        enviará por email al profesor. Tú no tendrás acceso a
                        esta contraseña por seguridad.
                      </p>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Rol *</label>
                  <select
                    value={formData.Rol}
                    onChange={(e) =>
                      setFormData({ ...formData, Rol: e.target.value })
                    }
                    required
                  >
                    <option value="profesor">Profesor</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingProfesor ? "Guardar Cambios" : "Crear Profesor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profesores;
