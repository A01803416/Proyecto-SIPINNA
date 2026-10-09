import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import QuienesSomos from './pages/QuienesSomos';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PanelProcurador from './pages/procurador/PanelProcurador';
import PanelAdmin from './pages/admin/PanelAdmin';
import './App.css';

/**
 * Configura el enrutamiento principal de RIETI.
 * Define las páginas públicas y protege los paneles de administración y
 * procuraduría según el rol de la sesión.
 * @returns {JSX.Element} Router principal con las rutas de la aplicación.
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/login-admin" element={<Login role="admin" />} />
          <Route path="/login-procurador" element={<Login role="procurador" />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute rol="administrador">
                <PanelAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/procurador"
            element={
              <ProtectedRoute rol="procurador">
                <PanelProcurador />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
