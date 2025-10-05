import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  estudiantesService,
  profesoresService,
  rubrosService,
} from "../../services";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    estudiantes: 0,
    profesores: 0,
    rubros: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [estudiantesRes, rubrosRes] = await Promise.all([
        estudiantesService.getAll(),
        rubrosService.getAll(),
      ]);

      const newStats = {
        estudiantes: estudiantesRes.data.length,
        rubros: rubrosRes.data.filter((r) => r.Activo).length,
        profesores: 0,
      };

      if (isAdmin) {
        const profesoresRes = await profesoresService.getAll();
        newStats.profesores = profesoresRes.data.length;
      }

      setStats(newStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Bienvenido, {user?.sub?.split("@")[0]}</h1>
        <p className="dashboard-subtitle">
          Panel de Control del Sistema de Notas
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3>Estudiantes</h3>
            <p className="stat-number">{stats.estudiantes}</p>
            <p className="stat-label">Registrados</p>
          </div>
        </div>

        {isAdmin && (
          <div className="stat-card">
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-content">
              <h3>Profesores</h3>
              <p className="stat-number">{stats.profesores}</p>
              <p className="stat-label">Activos</p>
            </div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Rubros</h3>
            <p className="stat-number">{stats.rubros}</p>
            <p className="stat-label">Configurados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Semanas</h3>
            <p className="stat-number">13</p>
            <p className="stat-label">Período 2-14</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Accesos Rápidos</h2>
        <div className="actions-grid">
          <a href="/estudiantes" className="action-card">
            <span className="action-icon">👨‍🎓</span>
            <h3>Gestionar Estudiantes</h3>
            <p>Ver, crear y editar estudiantes</p>
          </a>

          <a href="/notas" className="action-card">
            <span className="action-icon">📝</span>
            <h3>Ingresar Notas</h3>
            <p>Registrar calificaciones por semana</p>
          </a>

          {isAdmin && (
            <a href="/profesores" className="action-card">
              <span className="action-icon">👨‍🏫</span>
              <h3>Gestionar Profesores</h3>
              <p>Administrar usuarios del sistema</p>
            </a>
          )}

          <a href="/ajustes" className="action-card">
            <span className="action-icon">⚙️</span>
            <h3>Ajustes de Cuenta</h3>
            <p>Cambiar contraseña y preferencias</p>
          </a>
        </div>
      </div>

      <div className="info-section">
        <h2>Información del Sistema</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>🎯 Sistema de Evaluación</h3>
            <ul>
              <li>Rotación: 40% (Asistencia, TC, Quices, etc.)</li>
              <li>Exámenes: 40% (3 Parciales)</li>
              <li>Simulación: 20%</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>📆 Calendario Académico</h3>
            <ul>
              <li>Semanas de evaluación: 2-14</li>
              <li>Parciales: Semanas 6, 10 y 14</li>
              <li>Casos Clínicos: 3 evaluaciones</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>💡 Consejos</h3>
            <ul>
              <li>Inicializa las semanas antes de ingresar notas</li>
              <li>Las notas se promedian automáticamente</li>
              <li>Verifica los rubros activos por semana</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
