import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import TablaReportesAdmin from './TablaReportesAdmin';
import DetalleReporteAdmin from './DetalleReporteAdmin';
import MapaCalor from '../../components/MapaCalor';

/**
 * Muestra el resumen administrativo con indicadores, mapa y reportes recientes.
 * @returns {JSX.Element|null} Tablero administrativo, o null mientras cargan las métricas.
 */
export default function TableroAdmin() {
  const [metricas, setMetricas] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [folioAbierto, setFolioAbierto] = useState(null);
  const [puntosMapa, setPuntosMapa] = useState([]);

  // Estados para los filtros del mapa
  const [municipioSel, setMunicipioSel] = useState("");
  const [riesgoSel, setRiesgoSel] = useState("");
  const [estatusSel, setEstatusSel] = useState("");

  /**
   * Carga inicial de métricas, reportes, municipios y mapa.
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

  /**
   * Función para filtrar únicamente los puntos del mapa según los selectores
   */
  async function aplicarFiltrosMapa() {
    try {
      const params = new URLSearchParams();
      if (municipioSel) params.append('id_municipio', municipioSel);
      if (riesgoSel) params.append('nivel_riesgo', riesgoSel);
      if (estatusSel) params.append('estatus', estatusSel);

      const url = `${API_URL}/admin/mapa?${params.toString()}`;
      const resMapa = await fetch(url, { headers: encabezados() });
      const dataMapa = await resMapa.json();

      if (resMapa.ok) {
        setPuntosMapa(dataMapa);
      }
    } catch (err) {
      console.error("Error al filtrar el mapa: ", err);
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
              {/* Filtro Municipio */}
              <select value={municipioSel} onChange={(e) => setMunicipioSel(e.target.value)}>
                <option value="">Todos los Municipios</option>
                {municipios.map((m) => (
                  <option key={m.id_municipio} value={m.id_municipio}>
                    {m.nombre_municipio}
                  </option>
                ))}
              </select>

              {/* Filtro Nivel de Riesgo */}
              <select value={riesgoSel} onChange={(e) => setRiesgoSel(e.target.value)}>
                <option value="">Nivel de Riesgo</option>
                <option value="Bajo">Bajo</option>
                <option value="Medio">Medio</option>
                <option value="Alto">Alto</option>
              </select>

              {/* Filtro Estatus Actualizado */}
              <select value={estatusSel} onChange={(e) => setEstatusSel(e.target.value)}>
                <option value="">Estatus (Todos)</option>
                <option value="Registrado">Registrado</option>
                <option value="En revisión">En revisión</option>
                <option value="En seguimiento">En seguimiento</option>
                <option value="Canalizado">Canalizado</option>
                <option value="Concluido">Concluido</option>
                <option value="Archivado">Archivado</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Reincidente">Reincidente</option>
              </select>

              {/* Botón Aplicar Filtros */}
              <button className="btn-black" onClick={aplicarFiltrosMapa}>
                Aplicar Filtros
              </button>
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