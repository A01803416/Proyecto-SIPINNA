import { useState } from 'react';
import '../Dashboard.css';
import { borrarSesion } from '../../services/sesion';
import TableroAdmin from './TableroAdmin';
import MapaAdmin from './MapaAdmin';
import ReportesAdmin from './ReportesAdmin';
import DuplicadosAdmin from './DuplicadosAdmin';
import CasosAdmin from './CasosAdmin';
import MetricasAdmin from './MetricasAdmin';
import UsuariosAdmin from './UsuariosAdmin';

/**
 * Renderiza el panel de administración y su navegación lateral.
 * Muestra la sección activa y permite cerrar sesión eliminando los datos
 * de sesión almacenados.
 * @returns {JSX.Element} Estructura del panel administrativo.
 */
export default function PanelAdmin() {
  const [activeTab, setActiveTab] = useState('tablero');

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo-container">
          <img
            src="/logorieti.jpeg"
            alt="Logo RIETI"
            className="sidebar-logo"
          />
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${activeTab === 'tablero' ? 'active' : ''}`}
            onClick={() => setActiveTab('tablero')}
          >
            Tablero
          </button>
          <button
            className={`nav-btn ${activeTab === 'mapa' ? 'active' : ''}`}
            onClick={() => setActiveTab('mapa')}
          >
            Mapa
          </button>
          <button
            className={`nav-btn ${activeTab === 'reportes' ? 'active' : ''}`}
            onClick={() => setActiveTab('reportes')}
          >
            Reportes
          </button>
          <button
            className={`nav-btn ${activeTab === 'duplicados' ? 'active' : ''}`}
            onClick={() => setActiveTab('duplicados')}
          >
            Duplicados
          </button>
          <button
            className={`nav-btn ${activeTab === 'casos' ? 'active' : ''}`}
            onClick={() => setActiveTab('casos')}
          >
            Casos
          </button>
          <button
            className={`nav-btn ${activeTab === 'metricas' ? 'active' : ''}`}
            onClick={() => setActiveTab('metricas')}
          >
            Métricas
          </button>
          <button
            className={`nav-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('usuarios')}
          >
            Registros
          </button>
        </nav>
        <div className="sidebar-bottom">
          <h2 className="sidebar-rieti-text">RIETI</h2>
          <a
            href="/login-admin"
            className="btn-logout"
            onClick={() => borrarSesion()}
          >
            Cerrar sesión
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <h1 className="dashboard-title">Panel de Administrador Municipal</h1>
        {activeTab === 'tablero' && <TableroAdmin />}
        {activeTab === 'mapa' && <MapaAdmin />}
        {activeTab === 'reportes' && <ReportesAdmin />}
        {activeTab === 'duplicados' && <DuplicadosAdmin />}
        {activeTab === 'casos' && <CasosAdmin />}
        {activeTab === 'metricas' && <MetricasAdmin />}
        {activeTab === 'usuarios' && <UsuariosAdmin />}
      </main>
    </div>
  );
}