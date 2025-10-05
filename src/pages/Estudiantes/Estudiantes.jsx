import { useEffect, useState } from "react";
import { estudiantesService } from "../../services";
import Toast from "../../components/Toast/Toast";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import "./Estudiantes.css";

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEstudiante, setEditingEstudiante] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    Nombre: "",
    Apellido: "",
    Matricula: "",
    Email: "",
    Telefono: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [importing, setImporting] = useState(false);
  const [showImportResults, setShowImportResults] = useState(false);
  const [importResults, setImportResults] = useState(null);

  useEffect(() => {
    loadEstudiantes();
  }, []);

  const loadEstudiantes = async () => {
    try {
      const response = await estudiantesService.getAll();
      setEstudiantes(response.data);
    } catch (error) {
      setError("Error al cargar estudiantes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingEstudiante) {
        await estudiantesService.update(
          editingEstudiante.Id_estudiante,
          formData
        );
        setSuccess("✓ Estudiante actualizado correctamente");
      } else {
        await estudiantesService.create(formData);
        setSuccess("✓ Estudiante creado correctamente");
      }
      await loadEstudiantes();
      closeModal();
    } catch (error) {
      setError(error.response?.data?.detail || "Error al guardar estudiante");
    }
  };

  const handleEdit = (estudiante) => {
    setEditingEstudiante(estudiante);
    setFormData({
      Nombre: estudiante.Nombre,
      Apellido: estudiante.Apellido,
      Matricula: estudiante.Matricula,
      Email: estudiante.Email,
      Telefono: estudiante.Telefono || "",
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
      await estudiantesService.delete(deletingId);
      setSuccess("✓ Estudiante eliminado correctamente");
      await loadEstudiantes();
    } catch (error) {
      setError("Error al eliminar estudiante");
    }
    setDeletingId(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar que sea XML o XLSX
    if (!file.name.endsWith(".xml") && !file.name.endsWith(".xlsx")) {
      setError("Por favor seleccione un archivo XML o Excel (.xlsx) válido");
      e.target.value = ""; // Limpiar input
      return;
    }

    setImporting(true);
    setError("");

    try {
      const response = await estudiantesService.importar(file);
      setImportResults(response.data);
      setShowImportResults(true);

      // Si se crearon estudiantes, recargar la lista
      if (response.data.estudiantes_creados > 0) {
        await loadEstudiantes();
        setSuccess(
          `✓ Se importaron ${response.data.estudiantes_creados} estudiante(s) correctamente`
        );
      } else {
        setError("No se importó ningún estudiante. Revise los detalles.");
      }
    } catch (error) {
      setError(error.response?.data?.detail || "Error al importar archivo");
    } finally {
      setImporting(false);
      e.target.value = ""; // Limpiar input para permitir subir el mismo archivo de nuevo
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEstudiante(null);
    setFormData({
      Nombre: "",
      Apellido: "",
      Matricula: "",
      Email: "",
      Telefono: "",
    });
    setError("");
  };

  const filteredEstudiantes = estudiantes.filter(
    (est) =>
      est.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.Apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.Matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.Email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Cargando estudiantes...</div>;
  }

  const estudianteToDelete = estudiantes.find(
    (e) => e.Id_estudiante === deletingId
  );

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
      {showConfirmDelete && estudianteToDelete && (
        <ConfirmModal
          message={`¿Está seguro de eliminar al estudiante ${estudianteToDelete.Nombre} ${estudianteToDelete.Apellido} (${estudianteToDelete.Matricula})?`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirmDelete(false);
            setDeletingId(null);
          }}
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
        />
      )}

      <div className="estudiantes-page">
        <div className="page-header">
          <h1>👨‍🎓 Gestión de Estudiantes</h1>
          <div className="header-actions">
            <label htmlFor="file-upload" className="btn-secondary">
              📄 Importar Archivo
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xml,.xlsx"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <button onClick={() => setShowModal(true)} className="btn-primary">
              ➕ Nuevo Estudiante
            </button>
          </div>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, matrícula o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-count">
            {filteredEstudiantes.length} de {estudiantes.length} estudiantes
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Matrícula</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEstudiantes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No se encontraron estudiantes
                  </td>
                </tr>
              ) : (
                filteredEstudiantes.map((estudiante) => (
                  <tr key={estudiante.Id_estudiante}>
                    <td>{estudiante.Id_estudiante}</td>
                    <td>
                      <span className="badge">{estudiante.Matricula}</span>
                    </td>
                    <td>
                      {estudiante.Nombre} {estudiante.Apellido}
                    </td>
                    <td>{estudiante.Email}</td>
                    <td>{estudiante.Telefono || "N/A"}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(estudiante)}
                          className="btn-icon btn-edit"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(estudiante.Id_estudiante)}
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
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {editingEstudiante
                    ? "✏️ Editar Estudiante"
                    : "➕ Nuevo Estudiante"}
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
                  <label>Matrícula *</label>
                  <input
                    type="text"
                    value={formData.Matricula}
                    onChange={(e) =>
                      setFormData({ ...formData, Matricula: e.target.value })
                    }
                    required
                  />
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
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.Telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, Telefono: e.target.value })
                    }
                  />
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
                    {editingEstudiante ? "Guardar Cambios" : "Crear Estudiante"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de resultados de importación */}
        {showImportResults && importResults && (
          <div
            className="modal-overlay"
            onClick={() => setShowImportResults(false)}
          >
            <div
              className="modal-content import-results-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>📊 Resultados de Importación</h2>
                <button
                  onClick={() => setShowImportResults(false)}
                  className="modal-close"
                >
                  ✕
                </button>
              </div>

              <div className="import-summary">
                <div className="summary-item">
                  <span className="summary-label">Total procesados:</span>
                  <span className="summary-value">
                    {importResults.total_procesados}
                  </span>
                </div>
                <div className="summary-item success">
                  <span className="summary-label">✓ Estudiantes creados:</span>
                  <span className="summary-value">
                    {importResults.estudiantes_creados}
                  </span>
                </div>
                <div className="summary-item warning">
                  <span className="summary-label">⊘ Estudiantes omitidos:</span>
                  <span className="summary-value">
                    {importResults.estudiantes_omitidos}
                  </span>
                </div>
                <div className="summary-item error">
                  <span className="summary-label">✕ Errores:</span>
                  <span className="summary-value">{importResults.errores}</span>
                </div>
              </div>

              <div className="import-details">
                {/* Estudiantes creados */}
                {importResults.detalles.creados.length > 0 && (
                  <div className="detail-section">
                    <h3>
                      ✓ Estudiantes Creados (
                      {importResults.detalles.creados.length})
                    </h3>
                    <ul className="detail-list success-list">
                      {importResults.detalles.creados.map((est, idx) => (
                        <li key={idx}>
                          <strong>{est.matricula}</strong> - {est.nombre}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Estudiantes omitidos */}
                {importResults.detalles.omitidos.length > 0 && (
                  <div className="detail-section">
                    <h3>
                      ⊘ Estudiantes Omitidos (
                      {importResults.detalles.omitidos.length})
                    </h3>
                    <ul className="detail-list warning-list">
                      {importResults.detalles.omitidos.map((est, idx) => (
                        <li key={idx}>
                          <strong>{est.matricula}</strong> - {est.nombre}
                          <br />
                          <small>Razón: {est.razon}</small>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Errores */}
                {importResults.detalles.errores.length > 0 && (
                  <div className="detail-section">
                    <h3>✕ Errores ({importResults.detalles.errores.length})</h3>
                    <ul className="detail-list error-list">
                      {importResults.detalles.errores.map((err, idx) => (
                        <li key={idx}>
                          <strong>Fila {err.fila}:</strong> {err.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setShowImportResults(false)}
                  className="btn-primary"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de importación en progreso */}
        {importing && (
          <div className="modal-overlay">
            <div className="loading-modal">
              <div className="spinner"></div>
              <p>Importando estudiantes...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Estudiantes;
