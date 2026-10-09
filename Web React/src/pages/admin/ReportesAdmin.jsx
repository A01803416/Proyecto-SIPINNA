import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import { ESTATUS } from '../procurador/estatus';
import TablaReportesAdmin from './TablaReportesAdmin';
import DetalleReporteAdmin from './DetalleReporteAdmin';

/**
 * @typedef {Object} MunicipioFiltroAdmin
 * @property {number|string} id_municipio Identificador del municipio.
 * @property {string} nombre_municipio Nombre visible del municipio.
 */

/**
 * Presenta el listado administrativo de reportes con filtros por fecha,
 * municipio, estatus, riesgo y peligro inmediato. También permite consultar
 * el detalle y fusionar dos reportes.
 * @returns {JSX.Element} Panel de filtros y tabla de reportes.
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

  /**
   * Solicita los reportes a la API aplicando los filtros activos.
   * @returns {Promise<void>} Promesa que se resuelve al terminar la solicitud.
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
   * Obtiene el catálogo de municipios para las opciones del filtro.
   * @returns {Promise<void>} Promesa que se resuelve al terminar la solicitud.
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

  // cada filtro que cambia vuelve a pedir la lista al backend
  useEffect(() => {
    cargarReportes();
  }, [filterDesde, filterHasta, filterMunicipio, filterEstatus, filterRiesgo, filterPeligro]);

  useEffect(() => {
    cargarMunicipios();
  }, []);

  // la fusion es siempre de dos reportes, no se deja elegir un tercero
  /**
   * Agrega o quita un folio de la selección, que admite como máximo dos.
   * @param {number|string} folio Folio del reporte que se selecciona o deselecciona.
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
   * Envía los dos reportes seleccionados para fusionarlos en un mismo caso.
   * Si la operación tiene éxito, limpia la selección y actualiza el listado.
   * @returns {Promise<void>} Promesa que se resuelve al terminar la fusión.
   */
  async function fusionar() {
    const folio1 = seleccionados[0];
    const folio2 = seleccionados[1];
    if (!window.confirm(`¿Fusionar ${folio1} y ${folio2} en un mismo caso?`)) return;

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
   * Restablece los filtros de fecha, municipio, estatus, riesgo y peligro.
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
           <button className="btn-black" style={{background: '#dc3545'}} onClick={fusionar}>Fusionar {seleccionados.length} Casos</button>
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
    </div>
  );
}
