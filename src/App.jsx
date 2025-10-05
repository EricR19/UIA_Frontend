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
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />

            <Route
              path="estudiantes"
              element={
                <AdminRoute>
                  <Estudiantes />
                </AdminRoute>
              }
            />

            <Route
              path="profesores"
              element={
                <AdminRoute>
                  <Profesores />
                </AdminRoute>
              }
            />

            <Route path="notas" element={<Notas />} />

            <Route path="ajustes" element={<Ajustes />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
