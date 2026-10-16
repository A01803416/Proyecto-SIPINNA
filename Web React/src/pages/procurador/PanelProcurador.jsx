import { useState } from 'react';
import '../Dashboard.css';
import { borrarSesion } from '../../services/sesion';
import TableroProcurador from './TableroProcurador';
import MapaProcurador from './MapaProcurador';
import ReportesProcurador from './ReportesProcurador';
import CasosProcurador from './CasosProcurador';
import MetricasProcurador from './MetricasProcurador';

/**
 * Renderiza el panel de Procuraduría con navegación entre tablero, mapa,
 * reportes, casos y métricas, además de la acción para cerrar sesión.
 * @returns {import('react').JSX.Element} Estructura del panel de Procurador.
 */
export default function PanelProcurador() {
  const [activeTab, setActiveTab] = useState('tablero');

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo-container">
          <h1 className="sidebar-titulo">
            RIETI
          </h1>
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
        </nav>
        <div className="sidebar-bottom">
          <a
            href="/login-procurador"
            className="btn-logout"
            onClick={() => borrarSesion()}
          >
            Cerrar sesión
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <h1 className="dashboard-title">Panel de Procurador</h1>
        {activeTab === 'tablero' && <TableroProcurador />}
        {activeTab === 'mapa' && <MapaProcurador />}
        {activeTab === 'reportes' && <ReportesProcurador />}
        {activeTab === 'casos' && <CasosProcurador />}
        {activeTab === 'metricas' && <MetricasProcurador />}
      </main>
    </div>
  );
}