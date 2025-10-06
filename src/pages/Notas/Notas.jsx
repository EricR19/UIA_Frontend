import { useEffect, useState } from "react";
import {
  estudiantesService,
  notasService,
  rubrosService,
} from "../../services";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast/Toast";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import "./Notas.css";

const Notas = () => {
  const { isAdmin } = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [notas, setNotas] = useState([]);
  const [notaFinal, setNotaFinal] = useState(null);
  const [semanaActual, setSemanaActual] = useState(2);
  const [rubrosActivos, setRubrosActivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingValues, setEditingValues] = useState({}); // Valores temporales durante la edición
  const [historial, setHistorial] = useState([]); // Historial de cambios
  const [showHistorial, setShowHistorial] = useState(false); // Toggle historial
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal de confirmación

  useEffect(() => {
    loadEstudiantes();
  }, []);

  useEffect(() => {
    if (selectedEstudiante) {
      loadNotas();
    }
  }, [selectedEstudiante]);

  useEffect(() => {
    loadRubrosActivos();
  }, [semanaActual]);

  const loadEstudiantes = async () => {
    try {
      const response = await estudiantesService.getAll();
      setEstudiantes(response.data);
    } catch (error) {
      setError("Error al cargar estudiantes");
    }
  };

  const loadNotas = async () => {
    setLoading(true);
    try {
      const response = await notasService.getByEstudiante(
        selectedEstudiante.Id_estudiante
      );
      setNotas(response.data);

      // Cargar nota final calculada
      const notaFinalRes = await notasService.getNotaFinal(
        selectedEstudiante.Id_estudiante
      );
      setNotaFinal(notaFinalRes.data);

      // Cargar historial si es admin
      if (isAdmin) {
        loadHistorial();
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setNotas([]);
        setNotaFinal(null);
      } else {
        setError("Error al cargar notas");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadHistorial = async () => {
    try {
      const response = await notasService.getHistorialEstudiante(
        selectedEstudiante.Id_estudiante,
        50
      );
      setHistorial(response.data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setHistorial([]);
    }
  };

  const loadRubrosActivos = async () => {
    try {
      const response = await rubrosService.getSemana(semanaActual);
      setRubrosActivos(response.data.Rubros || []);
    } catch (error) {
      console.error("Error al cargar rubros activos:", error);
      setRubrosActivos([]);
    }
  };

  const handleInicializarSemanas = async () => {
    if (!selectedEstudiante) return;
    setShowConfirmModal(true);
  };

  const confirmarInicializacion = async () => {
    setShowConfirmModal(false);
    try {
      await notasService.inicializarSemanas(selectedEstudiante.Id_estudiante);
      setSuccess("Semanas inicializadas correctamente");
      await loadNotas();
    } catch (error) {
      setError(error.response?.data?.detail || "Error al inicializar semanas");
    }
  };

  const handleInputChange = (campo, valor) => {
    // Validar que el valor esté en el rango permitido (0-100)
    const numValor = parseFloat(valor);
    if (valor !== "" && (numValor < 0 || numValor > 100)) {
      setError("⚠️ Las notas deben estar entre 0 y 100");
      return;
    }

    // Actualizar valor temporal mientras se edita
    setEditingValues((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleGuardarNota = async (notaId, campo, valor) => {
    try {
      const numValor = parseFloat(valor) || 0;

      // Validar rango antes de enviar al backend
      if (numValor < 0 || numValor > 100) {
        setError("⚠️ Las notas deben estar entre 0 y 100");
        return;
      }

      const updateData = {
        Semana: semanaActual,
        [campo]: numValor,
      };
      await notasService.update(notaId, updateData);
      setSuccess("✓ Nota guardada correctamente");
      await loadNotas();

      // Limpiar el valor temporal
      setEditingValues((prev) => {
        const newValues = { ...prev };
        delete newValues[campo];
        return newValues;
      });
    } catch (error) {
      // Manejar error de validación (422) del backend
      let errorMsg = "Error al guardar nota";

      if (error.response?.status === 422) {
        errorMsg = "⚠️ Valor inválido. Las notas deben estar entre 0 y 100";

        // Si el backend envía detalles, extraerlos de forma segura
        const detail = error.response?.data?.detail;
        if (Array.isArray(detail) && detail.length > 0) {
          errorMsg = `⚠️ ${detail[0].msg || errorMsg}`;
        } else if (typeof detail === "string") {
          errorMsg = detail;
        }
      } else if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        errorMsg =
          typeof detail === "string" ? detail : "Error al guardar nota";
      }

      setError(errorMsg);

      // Limpiar el valor inválido del estado temporal
      setEditingValues((prev) => {
        const newValues = { ...prev };
        delete newValues[campo];
        return newValues;
      });

      // Recargar notas para restaurar valores correctos
      await loadNotas();
    }
  };

  const handleDescargarExcel = async () => {
    if (!selectedEstudiante) return;

    setLoading(true);
    try {
      const response = await notasService.exportarExcel(
        selectedEstudiante.Id_estudiante
      );

      // Crear blob y descargar
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Notas_${selectedEstudiante.Nombre}_${
        selectedEstudiante.Apellido
      }_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess("✓ Excel descargado correctamente");
    } catch (error) {
      setError(error.response?.data?.detail || "Error al descargar Excel");
    } finally {
      setLoading(false);
    }
  };

  const puedeEditarRubro = (codigo) => {
    // VALIDACIONES DE SEMANA PARA EXAMENES Y COMPENDIUM
    // Parcial I - solo semana 5
    if (codigo === "parcial_i" && semanaActual !== 5) {
      return false;
    }

    // Parcial II - solo semana 10
    if (codigo === "parcial_ii" && semanaActual !== 10) {
      return false;
    }

    // Parcial III - solo semana 14
    if (codigo === "parcial_iii" && semanaActual !== 14) {
      return false;
    }

    // Compendium - semanas 2-13, excepto 6, 10 y 14
    if (codigo === "compendium") {
      const semanasPermitidasCompendium = [2, 3, 4, 5, 7, 8, 9, 11, 12, 13];
      if (!semanasPermitidasCompendium.includes(semanaActual)) {
        return false;
      }
    }

    // VALIDACIONES DE ROL (solo después de validar semanas)
    if (isAdmin) return true;

    // Profesores NO pueden editar parciales, simulación ni infografía
    const rubrosRestringidos = [
      "parcial_i",
      "parcial_ii",
      "parcial_iii",
      "simulacion",
      "infografia",
    ];
    return !rubrosRestringidos.includes(codigo);
  };

  const getNotaSemana = () => {
    return notas.find((n) => n.Semana === semanaActual);
  };

  const notaSemana = getNotaSemana();

  const getRubroField = (codigo) => {
    const mapping = {
      asistencia: "Asistencia",
      tc: "Tc",
      quices: "Quices",
      compendium: "Compendium",
      cc: "Cc",
      parcial_i: "Parcial_i",
      parcial_ii: "Parcial_ii",
      parcial_iii: "Parcial_iii",
      simulacion: "Simulacion",
      infografia: "Infografia",
    };
    return mapping[codigo] || codigo;
  };

  const getMensajeSemana = (codigo) => {
    // Mensajes informativos cuando un rubro no está disponible por semana
    if (codigo === "parcial_i" && semanaActual !== 5) {
      return "Solo disponible en semana 5";
    }
    if (codigo === "parcial_ii" && semanaActual !== 10) {
      return "Solo disponible en semana 10";
    }
    if (codigo === "parcial_iii" && semanaActual !== 14) {
      return "Solo disponible en semana 14";
    }
    if (codigo === "compendium") {
      const semanasPermitidasCompendium = [2, 3, 4, 5, 7, 8, 9, 11, 12, 13];
      if (!semanasPermitidasCompendium.includes(semanaActual)) {
        return "No disponible en esta semana";
      }
    }
    return null;
  };

  const getDisplayValue = (campo, dbValue) => {
    // Si hay un valor siendo editado, mostrar ese, sino el de la BD
    return editingValues.hasOwnProperty(campo)
      ? editingValues[campo]
      : dbValue || 0;
  };

  return (
    <>
      {/* Toasts para mensajes */}
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

      {/* Modal de confirmación */}
      {showConfirmModal && selectedEstudiante && (
        <ConfirmModal
          message={`¿Desea inicializar las semanas 2-14 para ${selectedEstudiante.Nombre} ${selectedEstudiante.Apellido}? Esta acción creará registros de notas para todas las semanas.`}
          onConfirm={confirmarInicializacion}
          onCancel={() => setShowConfirmModal(false)}
          confirmText="Sí, inicializar"
          cancelText="Cancelar"
        />
      )}

      <div className="notas-page">
        <div className="page-header">
          <h1>📝 Gestión de Notas</h1>
        </div>

        <div className="notas-container">
          {/* Panel izquierdo - Selección de estudiante */}
          <div className="students-panel">
            <h2>Estudiantes</h2>
            <div className="students-list">
              {estudiantes.map((est) => (
                <div
                  key={est.Id_estudiante}
                  className={`student-item ${
                    selectedEstudiante?.Id_estudiante === est.Id_estudiante
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setSelectedEstudiante(est)}
                >
                  <div className="student-name">
                    {est.Nombre} {est.Apellido}
                  </div>
                  <div className="student-matricula">{est.Matricula}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho - Ingreso de notas */}
          <div className="notes-panel">
            {!selectedEstudiante ? (
              <div className="empty-state">
                <h3>👈 Selecciona un estudiante</h3>
                <p>
                  Elige un estudiante de la lista para ver o ingresar sus notas
                </p>
              </div>
            ) : (
              <>
                <div className="student-header">
                  <div>
                    <h2>
                      {selectedEstudiante.Nombre} {selectedEstudiante.Apellido}
                    </h2>
                    <p className="student-info">
                      Matrícula: {selectedEstudiante.Matricula} | Email:{" "}
                      {selectedEstudiante.Email}
                    </p>
                  </div>
                  {notas.length === 0 && (
                    <button
                      onClick={handleInicializarSemanas}
                      className="btn-primary"
                    >
                      🔄 Inicializar Semanas
                    </button>
                  )}
                </div>

                {notas.length > 0 && (
                  <>
                    {/* Selector de semana */}
                    <div className="week-selector">
                      <label>Semana:</label>
                      <select
                        value={semanaActual}
                        onChange={(e) =>
                          setSemanaActual(parseInt(e.target.value))
                        }
                        className="week-select"
                      >
                        {Array.from({ length: 13 }, (_, i) => i + 2).map(
                          (sem) => (
                            <option key={sem} value={sem}>
                              Semana {sem}
                            </option>
                          )
                        )}
                      </select>
                      <span className="rubros-count">
                        {rubrosActivos.length} rubros activos
                      </span>
                    </div>

                    {/* Formulario de notas */}
                    {loading ? (
                      <div className="loading">Cargando notas...</div>
                    ) : (
                      <div className="notes-form">
                        <h3>Notas de la Semana {semanaActual}</h3>

                        {rubrosActivos.length === 0 ? (
                          <div className="info-message">
                            No hay rubros activos para esta semana
                          </div>
                        ) : (
                          <div className="rubros-grid">
                            {rubrosActivos.map((rubro) => {
                              const campo = getRubroField(rubro.Codigo);
                              const dbValue = notaSemana?.[campo] || 0;
                              const displayValue = getDisplayValue(
                                campo,
                                dbValue
                              );
                              const puedeEditar = puedeEditarRubro(
                                rubro.Codigo
                              );
                              const mensajeSemana = getMensajeSemana(
                                rubro.Codigo
                              );

                              return (
                                <div
                                  key={rubro.Id_rubro}
                                  className="rubro-item"
                                >
                                  <label>
                                    {rubro.Nombre}
                                    <span className="rubro-percent">
                                      ({rubro.Porcentaje}%)
                                    </span>
                                    {mensajeSemana && (
                                      <span className="restricted-badge semana-badge">
                                        📅 {mensajeSemana}
                                      </span>
                                    )}
                                    {!puedeEditar && !mensajeSemana && (
                                      <span className="restricted-badge">
                                        🔒 Admin
                                      </span>
                                    )}
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={displayValue}
                                    onChange={(e) => {
                                      if (puedeEditar) {
                                        handleInputChange(
                                          campo,
                                          e.target.value
                                        );
                                      }
                                    }}
                                    onBlur={(e) => {
                                      if (
                                        puedeEditar &&
                                        notaSemana &&
                                        editingValues.hasOwnProperty(campo)
                                      ) {
                                        handleGuardarNota(
                                          notaSemana.Id_nota,
                                          campo,
                                          e.target.value
                                        );
                                      }
                                    }}
                                    onKeyPress={(e) => {
                                      if (
                                        e.key === "Enter" &&
                                        puedeEditar &&
                                        notaSemana
                                      ) {
                                        e.target.blur(); // Trigger onBlur to save
                                      }
                                    }}
                                    disabled={!puedeEditar}
                                    className={
                                      !puedeEditar ? "input-disabled" : ""
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Resumen de nota final - SOLO ADMINISTRADORES */}
                    {isAdmin && notaFinal && (
                      <div className="nota-final-panel">
                        <div className="nota-final-header">
                          <h3>📊 Nota Final Calculada</h3>
                          <button
                            onClick={handleDescargarExcel}
                            className="btn-excel"
                            disabled={loading}
                          >
                            📥 Descargar Excel
                          </button>
                        </div>
                        <div className="nota-final-value">
                          {notaFinal.nota_final.toFixed(2)}
                        </div>
                        <div className="desglose-grid">
                          {Object.entries(notaFinal.desglose || {}).map(
                            ([codigo, datos]) =>
                              datos.aporte > 0 && (
                                <div key={codigo} className="desglose-item">
                                  <span className="desglose-label">
                                    {codigo}
                                  </span>
                                  <span className="desglose-promedio">
                                    Prom: {datos.promedio.toFixed(2)}
                                  </span>
                                  <span className="desglose-aporte">
                                    {datos.aporte.toFixed(2)} pts
                                  </span>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Historial de Cambios - Solo Admin */}
                    {isAdmin && notas.length > 0 && (
                      <div className="historial-section">
                        <div className="historial-header">
                          <h3>📜 Historial de Cambios</h3>
                          <button
                            onClick={() => setShowHistorial(!showHistorial)}
                            className="btn-secondary btn-small"
                          >
                            {showHistorial ? "Ocultar" : "Mostrar"} Historial
                          </button>
                        </div>

                        {showHistorial && (
                          <div className="historial-content">
                            {historial.length === 0 ? (
                              <div className="historial-empty">
                                No hay cambios registrados aún
                              </div>
                            ) : (
                              <div className="historial-list">
                                {historial.map((h) => (
                                  <div
                                    key={h.Id_historial}
                                    className="historial-item"
                                  >
                                    <div className="historial-icon">📝</div>
                                    <div className="historial-details">
                                      <div className="historial-title">
                                        <strong>{h.Campo_modificado}</strong>
                                        {h.Valor_anterior !== null &&
                                          h.Valor_nuevo !== null && (
                                            <span className="historial-change">
                                              {h.Valor_anterior} →{" "}
                                              {h.Valor_nuevo}
                                            </span>
                                          )}
                                      </div>
                                      <div className="historial-meta">
                                        <span className="historial-profesor">
                                          👤 {h.profesor_nombre || "Sistema"}
                                        </span>
                                        <span className="historial-fecha">
                                          🕒{" "}
                                          {new Date(
                                            h.Fecha_modificacion
                                          ).toLocaleString("es-ES", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notas;
