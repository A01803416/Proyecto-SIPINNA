import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import TablaReportes from './TablaReportes';
import DetalleReporte from './DetalleReporte';

/**
 * Resumen que consume el tablero desde el endpoint de métricas.
 * @typedef {Object} ResumenTableroProcurador
 * @property {number} reportes_nuevos Cantidad de reportes nuevos.
 * @property {number} posibles_duplicados Cantidad de reportes marcados como posibles duplicados.
 * @property {number} ninos_identificados Cantidad de niños identificados.
 * @property {number} riesgo_alto Cantidad de reportes con riesgo alto.
 * @property {number} total_reportes Cantidad total de reportes.
 */

/**
 * Presenta el resumen operativo de Procuraduría y los reportes recientes.
 * Permite abrir el detalle de un reporte y actualizar los datos al realizar cambios.
 * @returns {import('react').ReactNode} Tablero o null mientras se cargan las métricas.
 */
export default function TableroProcurador() {
  /** @type {[ResumenTableroProcurador|null, import('react').Dispatch<import('react').SetStateAction<ResumenTableroProcurador|null>>]} */
  const [metricas, setMetricas] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [folioAbierto, setFolioAbierto] = useState(null);

  /**
   * Obtiene las métricas resumidas del tablero.
   * @returns {Promise<void>}
   */
  async function cargarMetricas() {
    try {
      const res = await fetch(`${API_URL}/procurador/metricas`, {
        headers: encabezados()
      });
      const data = await res.json();
      if (res.ok) {
        setMetricas(data);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  }

  /**
   * Obtiene la lista de reportes recientes que se muestra en la tabla.
   * @returns {Promise<void>}
   */
  async function cargarReportes() {
    try {
      const res = await fetch(`${API_URL}/procurador/reportes`, {
        headers: encabezados()
      });
      const data = await res.json();
      if (res.ok) {
        setReportes(data);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  }

  /**
   * Actualiza las métricas y los reportes, por ejemplo tras editar un reporte.
   * @returns {Promise<void>}
   */
  async function cargarDatos() {
    await cargarMetricas();
    await cargarReportes();
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  if (!metricas) return null;

  const conPeligro = reportes.filter((r) => r.peligro_inmediato).length;

  return (
    <>
      <div className="dashboard-top-section">
        <div className="top-left-widget">
          <div className="procurador-alerts-widget">
            <div className="alert-box danger-alert">
              <h3>Alerta Peligro Inmediato</h3>
              <p>{conPeligro} reportes con peligro inmediato requieren atención urgente.</p>
            </div>
            <div className="alert-box warning-alert">
              <h3>Posible Duplicidad</h3>
              <p>{metricas.posibles_duplicados} reportes marcados como posible duplicado.</p>
            </div>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Reportes Nuevos</span>
            <span className="kpi-value">{metricas.reportes_nuevos}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Posibles Duplicados</span>
            <span className="kpi-value">{metricas.posibles_duplicados}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Niños Ident.</span>
            <span className="kpi-value">{metricas.ninos_identificados}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Riesgo Alto</span>
            <span className="kpi-value">{metricas.riesgo_alto}</span>
          </div>
          <div className="kpi-card" style={{gridColumn: 'span 2'}}>
            <span className="kpi-label">Total de Reportes</span>
            <span className="kpi-value">{metricas.total_reportes}</span>
          </div>
        </div>
      </div>

      <div className="table-widget">
        <h2>Seguimiento de Casos Recientes</h2>
        <TablaReportes reportes={reportes} onVer={setFolioAbierto} mostrarTodos={false} />
      </div>

      {folioAbierto && (
        <DetalleReporte
          folio={folioAbierto}
          onClose={() => setFolioAbierto(null)}
          onCambio={cargarDatos}
        />
      )}
    </>
  );
}
