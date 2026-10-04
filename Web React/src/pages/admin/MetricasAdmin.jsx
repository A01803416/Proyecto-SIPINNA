import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';

export default function MetricasAdmin() {
  const [metricas, setMetricas] = useState(null);

  async function cargarMetricas() {
    try {
      const res = await fetch(`${API_URL}/admin/metricas`, {
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

  useEffect(() => {
    cargarMetricas();
  }, []);

  function handleExportPDF() {
    window.print();
  }

  if (!metricas) return null;

  return (
    <div className="metricas-widget" id="metricas-report">
      <div className="metricas-header">
        <h2>Métricas Globales (Todos los Municipios)</h2>
        <button className="btn-black" onClick={handleExportPDF}>
          Exportar a PDF
        </button>
      </div>

      <div className="metricas-grid">
        <div className="metricas-card">
          <h3>Tiempos Promedio de Atención</h3>
          {metricas.tiempo_promedio_atencion_por_municipio.map(fila => (
            <div className="time-stat" key={fila.nombre_municipio}>
              <p className="time-desc">{fila.nombre_municipio}</p>
              {fila.promedio_horas === null ? (
                <p className="time-desc">Sin reportes cerrados</p>
              ) : (
                <>
                  <span className="time-value">{fila.promedio_horas}</span>
                  <span className="time-unit">horas</span>
                  <p className="time-desc">Desde el registro hasta el cierre ({fila.reportes_cerrados} reportes cerrados)</p>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="metricas-card">
          <h3>Reportes por Estatus</h3>
          <div className="bar-chart">
            {metricas.reportes_por_estatus.map(fila => (
              <div className="bar-row" key={fila.estatus}>
                <span className="bar-label">{fila.estatus}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(fila.total / metricas.total_reportes) * 100}%` }}></div>
                </div>
                <span className="bar-value">{fila.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="metricas-card full-width">
        <h3>Comparativa Global de Municipios (Todos)</h3>
        <div className="bar-chart" style={{maxHeight: '300px', overflowY: 'auto', paddingRight: '10px'}}>
          {metricas.reportes_por_municipio.map(fila => (
            <div className="bar-row" key={fila.nombre_municipio} style={{marginBottom: '10px'}}>
              <span className="bar-label" style={{width: '120px', fontSize: '0.85rem'}}>{fila.nombre_municipio}</span>
              <div className="bar-track" style={{flex: 1, background: '#eee', height: '12px', borderRadius: '6px', overflow: 'hidden', margin: '0 10px'}}>
                <div className="bar-fill" style={{ width: `${(fila.total / metricas.total_reportes) * 100}%`, background: '#222', height: '100%' }}></div>
              </div>
              <span className="bar-value" style={{fontWeight: 'bold', width: '30px', textAlign: 'right'}}>{fila.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
