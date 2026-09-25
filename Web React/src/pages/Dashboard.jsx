import { useState } from 'react';
import './Dashboard.css';

// --- SUBCOMPONENTES DE LAS PESTAÑAS ---

// Pestaña: Tablero (Dashboard Principal)
const TableroContent = ({ isAdmin }) => (
  <>
    <div className="dashboard-top-section">
      <div className="top-left-widget">
        {isAdmin ? (
          <div className="admin-map-widget">
             <div className="map-filters">
                <select defaultValue=""><option>Todos los Municipios</option></select>
                <select defaultValue=""><option>Últimos 3 meses</option></select>
                <select defaultValue=""><option>Rango de Edad (Todos)</option></select>
                <select defaultValue=""><option>Nivel de Riesgo</option></select>
                <button className="btn-black">Filtrar</button>
              </div>
              <div className="map-iframe-container">
                <iframe
                  width="100%"
                  height="100%"
                  scrolling="no"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-99.28%2C19.53%2C-99.24%2C19.57&amp;layer=mapnik"
                  style={{ border: 'none' }}
                  title="Mapa Admin"
                ></iframe>
              </div>
          </div>
        ) : (
          <div className="procurador-alerts-widget">
            <div className="alert-box danger-alert">
              <h3>⚠️ Alerta Peligro Inmediato</h3>
              <p>2 reportes nuevos requieren atención urgente.</p>
            </div>
            <div className="alert-box warning-alert">
              <h3>🔄 Posible Duplicidad</h3>
              <p>Se detectaron 3 reportes en la misma ubicación.</p>
            </div>
          </div>
        )}
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Niños Ident.</span>
          <span className="kpi-value">430</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Invest.</span>
          <span className="kpi-value">125</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">{isAdmin ? 'Casos Graves' : 'Críticos Graves'}</span>
          <span className="kpi-value">18</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pendientes</span>
          <span className="kpi-value">54</span>
        </div>
      </div>
    </div>

    <div className="table-widget">
      <h2>{isAdmin ? 'Últimos Reportes Registrados' : 'Seguimiento de Casos Recientes'}</h2>
      <ReportesTable />
    </div>
  </>
);

// Pestaña: Mapa (Solo el mapa grande)
const MapaContent = () => (
  <div className="full-map-widget">
     <div className="map-filters-full">
        <select defaultValue=""><option>Todos los Municipios</option></select>
        <select defaultValue=""><option>Rango de Edad</option></select>
        <select defaultValue=""><option>Nivel de Riesgo</option></select>
        <select defaultValue=""><option>Estatus</option></select>
        <button className="btn-black">Aplicar Filtros</button>
      </div>
      <div className="map-iframe-container-full">
         <iframe
            width="100%"
            height="100%"
            scrolling="no"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-99.28%2C19.53%2C-99.24%2C19.57&amp;layer=mapnik"
            style={{ border: 'none' }}
            title="Mapa Completo"
          ></iframe>
      </div>
  </div>
);

// Pestaña: Reportes (Vista expandida de la tabla)
const ReportesContent = () => (
  <div className="full-table-widget">
    <div className="report-filters-header">
        <h2>Todos los Reportes</h2>
        <div className="report-filters-controls">
           <label>Desde: <input type="date" /></label>
           <label>Hasta: <input type="date" /></label>
           <select defaultValue=""><option>Municipio</option></select>
           <button className="btn-black">Buscar</button>
        </div>
    </div>
    <ReportesTable fullList />
  </div>
);

// Pestaña: Usuarios (Solo Admin)
const UsuariosContent = () => (
  <div className="users-widget">
    <h2>Registrar Nuevo Usuario Oficial</h2>
    <form className="users-form">
      <div className="form-row">
        <div className="input-group">
          <label>Nombre completo</label>
          <input type="text" className="input-box-clean" />
        </div>
        <div className="input-group">
          <label>Correo electrónico institucional</label>
          <input type="email" className="input-box-clean" />
        </div>
      </div>
      <div className="form-row">
        <div className="input-group">
          <label>Rol del Usuario</label>
          <select className="input-box-clean">
            <option>Selecciona un rol...</option>
            <option>Admin</option>
            <option>Procurador</option>
          </select>
        </div>
        <div className="input-group">
          <label>Municipio Asignado</label>
          <select className="input-box-clean">
             <option>Selecciona municipio...</option>
             <option>Atizapán</option>
             <option>Naucalpan</option>
          </select>
        </div>
      </div>
       <div className="form-row">
        <div className="input-group">
          <label>Contraseña Temporal</label>
          <input type="password" className="input-box-clean" />
        </div>
      </div>
      <button type="button" className="btn-black btn-large">Crear Usuario</button>
    </form>
  </div>
);

// Componente reutilizable para la tabla
const ReportesTable = ({ fullList = false }) => (
  <table className="data-table">
    <thead>
      <tr>
        <th>Folio</th>
        <th>Fecha</th>
        <th>Municipio</th>
        <th>Actividad</th>
        <th>Nivel de Riesgo</th>
        <th>Estatus</th>
        <th>Acción</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>RIETI-ATZ-001</td>
        <td>10/09/2026</td>
        <td>Atizapán</td>
        <td>Venta en semáforo</td>
        <td><span className="badge risk-high">Alto</span></td>
        <td><span className="badge status-citizen">Reporte Ciudadano</span></td>
        <td><button className="btn-action">Ver</button> <button className="btn-action-icon">↓</button></td>
      </tr>
      <tr>
        <td>RIETI-NAU-002</td>
        <td>09/09/2026</td>
        <td>Naucalpan</td>
        <td>Limpiaparabrisas</td>
        <td><span className="badge risk-medium">Medio</span></td>
        <td><span className="badge status-valid">Reporte Validado</span></td>
        <td><button className="btn-action">Ver</button> <button className="btn-action-icon">↓</button></td>
      </tr>
      <tr>
        <td>RIETI-TLA-003</td>
        <td>08/09/2026</td>
        <td>Tlalnepantla</td>
        <td>Carga y descarga</td>
        <td><span className="badge risk-high">Alto</span></td>
        <td><span className="badge status-canalized">Canalización</span></td>
        <td><button className="btn-action">Ver</button> <button className="btn-action-icon">↓</button></td>
      </tr>
      {fullList && (
        <tr>
          <td>RIETI-ATZ-004</td>
          <td>05/09/2026</td>
          <td>Atizapán</td>
          <td>Mendicidad</td>
          <td><span className="badge risk-high">Alto</span></td>
          <td><span className="badge status-valid">Reporte Validado</span></td>
          <td><button className="btn-action">Ver</button> <button className="btn-action-icon">↓</button></td>
        </tr>
      )}
    </tbody>
  </table>
);

// --- COMPONENTE PRINCIPAL (LAYOUT) ---

export const Dashboard = ({ role = 'admin' }) => {
  const isAdmin = role === 'admin';
  // Estado para controlar qué pestaña está activa. Default: 'tablero'
  const [activeTab, setActiveTab] = useState('tablero');

  // Función auxiliar para renderizar el contenido según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case 'tablero': return <TableroContent isAdmin={isAdmin} />;
      case 'mapa': return <MapaContent />;
      case 'reportes': return <ReportesContent />;
      case 'usuarios': return isAdmin ? <UsuariosContent /> : <TableroContent isAdmin={isAdmin} />;
      default: return <TableroContent isAdmin={isAdmin} />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo-container">
          <img src="/logorieti.jpeg" alt="Logo RIETI" className="sidebar-logo" />
        </div>
        <nav className="sidebar-nav">
          <a href="/">Inicio</a>
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
          {isAdmin && (
            <button 
              className={`nav-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
              onClick={() => setActiveTab('usuarios')}
            >
              Usuarios
            </button>
          )}
        </nav>
        <div className="sidebar-bottom">
          <h2 className="sidebar-rieti-text">RIETI</h2>
          <a href="/" className="btn-logout">Cerrar sesión</a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <h1 className="dashboard-title">
          {isAdmin ? 'Panel de Administrador Municipal' : 'Panel de Procurador'}
        </h1>
        {renderContent()}
      </main>
    </div>
  );
};