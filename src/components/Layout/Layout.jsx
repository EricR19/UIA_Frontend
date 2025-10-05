import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="layout">
      {/* Top Bar */}
      <div className="topbar">
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <div className="topbar-brand">
          <h2>📚 Sistema UIA</h2>
        </div>

        <div className="topbar-user">
          <div className="user-info">
            <span className="user-email">{user?.sub}</span>
            <span className="user-role">
              {isAdmin ? "👑 Admin" : "👨‍🏫 Profesor"}
            </span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Salir</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h3>Menú Principal</h3>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <span className="sidebar-icon">🏠</span>
            <span className="sidebar-text">Inicio</span>
          </Link>

          <Link
            to="/estudiantes"
            className={`sidebar-link ${
              isActive("/estudiantes") ? "active" : ""
            }`}
            onClick={closeSidebar}
          >
            <span className="sidebar-icon">👨‍🎓</span>
            <span className="sidebar-text">Estudiantes</span>
          </Link>

          <Link
            to="/notas"
            className={`sidebar-link ${isActive("/notas") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <span className="sidebar-icon">📝</span>
            <span className="sidebar-text">Notas</span>
          </Link>

          {isAdmin && (
            <Link
              to="/profesores"
              className={`sidebar-link ${
                isActive("/profesores") ? "active" : ""
              }`}
              onClick={closeSidebar}
            >
              <span className="sidebar-icon">👨‍🏫</span>
              <span className="sidebar-text">Profesores</span>
            </Link>
          )}

          <Link
            to="/ajustes"
            className={`sidebar-link ${isActive("/ajustes") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <span className="sidebar-icon">⚙️</span>
            <span className="sidebar-text">Ajustes</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <p>© 2025 UIA</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
