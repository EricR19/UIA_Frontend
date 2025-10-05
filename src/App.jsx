import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import {
  PrivateRoute,
  AdminRoute,
  PublicRoute,
} from "./components/ProtectedRoute";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Estudiantes from "./pages/Estudiantes/Estudiantes";
import Profesores from "./pages/Profesores/Profesores";
import Notas from "./pages/Notas/Notas";
import Ajustes from "./pages/Ajustes/Ajustes";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Ruta pública - Login */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Rutas privadas - Requieren autenticación */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* Dashboard - Accesible para todos los usuarios autenticados */}
            <Route index element={<Dashboard />} />

            {/* Estudiantes - Solo administradores */}
            <Route
              path="estudiantes"
              element={
                <AdminRoute>
                  <Estudiantes />
                </AdminRoute>
              }
            />

            {/* Profesores - Solo administradores */
            <Route
              path="profesores"
              element={
                <AdminRoute>
                  <Profesores />
                </AdminRoute>
              }
            />

            {/* Notas - Accesible para todos (con restricciones por rol) */}
            <Route path="notas" element={<Notas />} />

            {/* Ajustes - Accesible para todos los usuarios autenticados */}
            <Route path="ajustes" element={<Ajustes />} />
          </Route>

          {/* Ruta catch-all - Redirige al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
