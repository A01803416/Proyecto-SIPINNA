import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import { ESTATUS } from '../procurador/estatus';
import TablaReportesAdmin from './TablaReportesAdmin';
import DetalleReporteAdmin from './DetalleReporteAdmin';
import Dialogos from '../../components/Dialogos';

/**
 * Muestra el listado de reportes de todos los municipios con sus filtros.
 * Permite consultar el detalle de un reporte y fusionar dos reportes.
 * @returns {JSX.Element} Filtros y tabla de reportes.
 */
export default function ReportesAdmin() {
  const [reportes, setReportes] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [folioAbierto, setFolioAbierto] = useState(null);
  const [seleccionados, setSeleccionados] = useState([]);

  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');
  const [filterMunicipio, setFilterMunicipio] = useState('');
  const [filterEstatus, setFilterEstatus] = useState('');
  const [filterRiesgo, setFilterRiesgo] = useState('');
  const [filterPeligro, setFilterPeligro] = useState(false);

  // Estado para el modal de fusión
  const [modalFusionAbierto, setModalFusionAbierto] = useState(false);

  /**
   * Obtiene los reportes con los filtros elegidos.
   * @returns {Promise<void>}
   */
  async function cargarReportes() {
    let url = `${API_URL}/admin/reportes?`;
    if (filterDesde) url += `desde=${filterDesde}&`;
    if (filterHasta) url += `hasta=${filterHasta}&`;
    if (filterMunicipio) url += `id_municipio=${filterMunicipio}&`;
    if (filterEstatus) url += `estatus=${encodeURIComponent(filterEstatus)}&`;
    if (filterRiesgo) url += `nivel_riesgo=${filterRiesgo}&`;
    if (filterPeligro) url += 'peligro_inmediato=true&';

    try {
      const res = await fetch(url, {
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
   * Obtiene el catálogo de municipios para el filtro.
   * @returns {Promise<void>}
   */
  async function cargarMunicipios() {
    try {
      const res = await fetch(`${API_URL}/municipios`, {
        headers: encabezados()
      });
      const data = await res.json();
      if (res.ok) {
        setMunicipios(data);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  }

  useEffect(() => {
    cargarReportes();
  }, [filterDesde, filterHasta, filterMunicipio, filterEstatus, filterRiesgo, filterPeligro]);

  useEffect(() => {
    cargarMunicipios();
  }, []);

  /**
   * Agrega o quita un reporte de la selección para fusionar, que admite como máximo dos.
   * @param {number|string} folio Folio del reporte.
   * @returns {void}
   */
  function seleccionar(folio) {
    if (seleccionados.includes(folio)) {
      setSeleccionados(seleccionados.filter((f) => f !== folio));
    } else if (seleccionados.length === 2) {
      alert('Solo puedes elegir 2 reportes para fusionar.');
    } else {
      setSeleccionados([...seleccionados, folio]);
    }
  }

  /**
   * Pide confirmación para fusionar los dos reportes seleccionados.
   * @returns {void}
   */
  function solicitarFusion() {
    setModalFusionAbierto(true);
  }

  /**
   * Fusiona los dos reportes seleccionados en un caso.
   * @returns {Promise<void>}
   */
  async function ejecutarFusion() {
    setModalFusionAbierto(false);
    const folio1 = seleccionados[0];
    const folio2 = seleccionados[1];

    try {
      const res = await fetch(`${API_URL}/admin/fusiones`, {
        method: 'POST',
        headers: encabezados(),
        body: JSON.stringify({ folio1, folio2 })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Reportes fusionados en el caso ${data.id_caso}.`);
        setSeleccionados([]);
        cargarReportes();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  }

  /**
   * Regresa todos los filtros a su valor inicial.
   * @returns {void}
   */
  function limpiarFiltros() {
    setFilterDesde('');
    setFilterHasta('');
    setFilterMunicipio('');
    setFilterEstatus('');
    setFilterRiesgo('');
    setFilterPeligro(false);
  }

  return (
    <div className="full-table-widget">
      <div className="report-filters-header" style={{display: 'flex', justifyContent: 'space-between'}}>
        <h2>Todos los Reportes</h2>
        {seleccionados.length === 2 && (
           <button className="btn-black" style={{background: '#dc3545'}} onClick={solicitarFusion}>Fusionar {seleccionados.length} Reportes</button>
        )}
      </div>

      <div className="report-filters-controls" style={{marginBottom: '16px', flexWrap: 'wrap', gap: '8px'}}>
          <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>Desde: <input type="date" value={filterDesde} onChange={(e) => setFilterDesde(e.target.value)} style={{padding:'4px'}} /></label>
          <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>Hasta: <input type="date" value={filterHasta} onChange={(e) => setFilterHasta(e.target.value)} style={{padding:'4px'}} /></label>

          <select value={filterMunicipio} onChange={(e) => setFilterMunicipio(e.target.value)} style={{padding:'4px'}}>
            <option value="">Municipio (Todos)</option>
            {municipios.map((m) => <option key={m.id_municipio} value={m.id_municipio}>{m.nombre_municipio}</option>)}
          </select>

          <select value={filterEstatus} onChange={(e) => setFilterEstatus(e.target.value)} style={{padding:'4px'}}>
            <option value="">Estatus (Todos)</option>
            {ESTATUS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>

          <select value={filterRiesgo} onChange={(e) => setFilterRiesgo(e.target.value)} style={{padding:'4px'}}>
            <option value="">Riesgo (Todos)</option>
            <option value="Bajo">Bajo</option>
            <option value="Medio">Medio</option>
            <option value="Alto">Alto</option>
          </select>

          <label style={{display:'flex', alignItems:'center', gap:'4px', cursor:'pointer', padding:'4px', background:'#fff5f5', borderRadius:'4px'}}>
            <input type="checkbox" checked={filterPeligro} onChange={(e) => setFilterPeligro(e.target.checked)} />
            Solo Peligro Inmediato
          </label>

          <button className="btn-black" style={{padding:'4px 12px'}} onClick={limpiarFiltros}>Limpiar</button>
      </div>

      <TablaReportesAdmin
        reportes={reportes}
        onVer={setFolioAbierto}
        mostrarTodos={true}
        mostrarFusion={true}
        seleccionados={seleccionados}
        onSeleccionar={seleccionar}
      />

      {folioAbierto && (
        <DetalleReporteAdmin folio={folioAbierto} onClose={() => setFolioAbierto(null)} />
      )}

      {/* Modal de Fusión */}
      <Dialogos
        isOpen={modalFusionAbierto}
        title="Confirmar Fusión"
        message={`¿Estás seguro de fusionar los reportes ${seleccionados[0]} y ${seleccionados[1]} en un mismo caso?`}
        type="confirm"
        onConfirm={ejecutarFusion}
        onClose={() => setModalFusionAbierto(false)}
      />
    </div>
  );
}