import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';

export default function MetricasProcurador() {
  const [metricas, setMetricas] = useState(null);

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

  useEffect(() => {
    cargarMetricas();
  }, []);

  function handleExportPDF() {
    window.print();
  }

  if (!metricas) return null;

  const tiempo = metricas.tiempo_promedio_atencion;

  return (
    <div className="metricas-widget" id="metricas-report">
      <div className="metricas-header">
        <h2>Métricas del Municipio</h2>
        <button className="btn-black" onClick={handleExportPDF}>
          Exportar a PDF
        </button>
      </div>

      <div className="metricas-grid">
        <div className="metricas-card">
          <h3>Tiempos Promedio de Atención</h3>
          {tiempo.promedio_horas === null ? (
            <div className="time-stat">
              <p className="time-desc">Sin reportes cerrados</p>
            </div>
          ) : (
            <div className="time-stat">
              <span className="time-value">{tiempo.promedio_horas}</span>
              <span className="time-unit">horas</span>
              <p className="time-desc">Desde el registro hasta el cierre ({tiempo.reportes_cerrados} reportes cerrados)</p>
            </div>
          )}
        </div>

        <div className="metricas-card">
          <h3>Reportes por Estatus</h3>
          <div className="bar-chart">
            {metricas.reportes_por_estatus.map((fila) => (
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
    </div>
  );
}
