import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import TablaReportesAdmin from './TablaReportesAdmin';
import DetalleReporteAdmin from './DetalleReporteAdmin';
import MapaCalor from '../../components/MapaCalor';

/**
 * @typedef {Object} ResumenTableroAdmin
 * @property {number} reportes_nuevos Cantidad de reportes nuevos.
 * @property {number} posibles_duplicados Cantidad de posibles duplicados.
 * @property {number} ninos_identificados Cantidad de menores identificados.
 * @property {number} riesgo_alto Cantidad de reportes con riesgo alto.
 * @property {number} total_reportes Cantidad total de reportes.
 */

/**
 * @typedef {Object} MunicipioTableroAdmin
 * @property {number|string} id_municipio Identificador del municipio.
 * @property {string} nombre_municipio Nombre visible del municipio.
 */

/**
 * @typedef {Object} PuntoMapaTableroAdmin
 * @property {number|string} latitud Latitud del punto del mapa.
 * @property {number|string} longitud Longitud del punto del mapa.
 */

/**
 * Muestra el resumen administrativo con indicadores, mapa y reportes recientes.
 * Los datos se cargan al montar el componente y el detalle abre el reporte elegido.
 * @returns {JSX.Element|null} Tablero administrativo, o null mientras cargan las métricas.
 */
export default function TableroAdmin() {
  const [metricas, setMetricas] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [folioAbierto, setFolioAbierto] = useState(null);
  const [puntosMapa, setPuntosMapa] = useState([]);

  /**
   * Obtiene puntos del mapa, métricas, reportes y municipios desde la API.
   * @returns {Promise<void>} Promesa que se resuelve al completar las solicitudes.
   */
  async function cargarDatos() {
    try {
      const resMapa = await fetch(`${API_URL}/admin/mapa`, {
        headers: encabezados()
      });

      const dataMapa = await resMapa.json();
      if (resMapa.ok) {
        setPuntosMapa(dataMapa);
      }

      const resMetricas = await fetch(`${API_URL}/admin/metricas`, {
        headers: encabezados()
      });
      const dataMetricas = await resMetricas.json();
      if (resMetricas.ok) {
        setMetricas(dataMetricas);
      } else {
        alert(dataMetricas.message);
      }

      const resReportes = await fetch(`${API_URL}/admin/reportes`, {
        headers: encabezados()
      });
      const dataReportes = await resReportes.json();
      if (resReportes.ok) {
        setReportes(dataReportes);
      } else {
        alert(dataReportes.message);
      }

      const resMunicipios = await fetch(`${API_URL}/municipios`, {
        headers: encabezados()
      });
      const dataMunicipios = await resMunicipios.json();
      if (resMunicipios.ok) {
        setMunicipios(dataMunicipios);
      } else {
        alert(dataMunicipios.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  if (!metricas) return null;

  return (
    <>
      <div className="dashboard-top-section">
        <div className="top-left-widget">
          <div className="admin-map-widget">
            <div className="map-filters">
              <select defaultValue="">
                <option value="">Todos los Municipios</option>
                {municipios.map((m) => (
                  <option key={m.id_municipio} value={m.id_municipio}>
                    {m.nombre_municipio}
                  </option>
                ))}
              </select>
              <select defaultValue="">
                <option>Últimos 3 meses</option>
              </select>
              <select defaultValue="">
                <option>Rango de Edad (Todos)</option>
              </select>
              <select defaultValue="">
                <option>Nivel de Riesgo</option>
              </select>
              <button className="btn-black">Filtrar</button>
            </div>
            <div className="map-iframe-container">
              <div style={{ height: '350px', width: '100%' }}>
                <MapaCalor puntos={puntosMapa} />
              </div>
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
          <div className="kpi-card" style={{ gridColumn: 'span 2' }}>
            <span className="kpi-label">Total de Reportes</span>
            <span className="kpi-value">{metricas.total_reportes}</span>
          </div>
        </div>
      </div>

      <div className="table-widget">
        <h2>Últimos Reportes Registrados</h2>
        <TablaReportesAdmin
          reportes={reportes}
          onVer={setFolioAbierto}
          mostrarTodos={false}
          mostrarFusion={false}
          seleccionados={[]}
          onSeleccionar={null}
        />
      </div>

      {folioAbierto && (
        <DetalleReporteAdmin folio={folioAbierto} onClose={() => setFolioAbierto(null)} />
      )}
    </>
  );
}