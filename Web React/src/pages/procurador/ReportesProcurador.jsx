import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import { ESTATUS } from './estatus';
import TablaReportes from './TablaReportes';
import DetalleReporte from './DetalleReporte';

export default function ReportesProcurador() {
  const [reportes, setReportes] = useState([]);
  const [folioAbierto, setFolioAbierto] = useState(null);

  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');
  const [filterEstatus, setFilterEstatus] = useState('');
  const [filterRiesgo, setFilterRiesgo] = useState('');
  const [filterPeligro, setFilterPeligro] = useState(false);

  async function cargarReportes() {
    let url = `${API_URL}/procurador/reportes?`;
    if (filterDesde) url += `desde=${filterDesde}&`;
    if (filterHasta) url += `hasta=${filterHasta}&`;
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

  // cada filtro que cambia vuelve a pedir la lista al backend
  useEffect(() => {
    cargarReportes();
  }, [filterDesde, filterHasta, filterEstatus, filterRiesgo, filterPeligro]);

  function limpiarFiltros() {
    setFilterDesde('');
    setFilterHasta('');
    setFilterEstatus('');
    setFilterRiesgo('');
    setFilterPeligro(false);
  }

  return (
    <div className="full-table-widget">
      <div className="report-filters-header" style={{display: 'flex', justifyContent: 'space-between'}}>
        <h2>Todos los Reportes</h2>
      </div>

      <div className="report-filters-controls" style={{marginBottom: '16px', flexWrap: 'wrap', gap: '8px'}}>
          <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>Desde: <input type="date" value={filterDesde} onChange={(e) => setFilterDesde(e.target.value)} style={{padding:'4px'}} /></label>
          <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>Hasta: <input type="date" value={filterHasta} onChange={(e) => setFilterHasta(e.target.value)} style={{padding:'4px'}} /></label>

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

      <TablaReportes reportes={reportes} onVer={setFolioAbierto} mostrarTodos={true} />

      {folioAbierto && (
        <DetalleReporte
          folio={folioAbierto}
          onClose={() => setFolioAbierto(null)}
          onCambio={cargarReportes}
        />
      )}
    </div>
  );
}
