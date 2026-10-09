import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';

/**
 * Datos de métricas que devuelve el endpoint de Procuraduría.
 * @typedef {Object} MetricasProcuradorData
 * @property {number} total_reportes Total de reportes incluidos en las métricas.
 * @property {{ promedio_horas: number|null, reportes_cerrados: number }} tiempo_promedio_atencion Resumen del tiempo de atención.
 * @property {Array<{ estatus: string, total: number }>} reportes_por_estatus Conteo de reportes agrupados por estatus.
 */

/**
 * Muestra las métricas de atención y la distribución de reportes por estatus.
 * @returns {import('react').ReactNode} Panel de métricas o null mientras se cargan.
 */
export default function MetricasProcurador() {
  /** @type {[MetricasProcuradorData|null, import('react').Dispatch<import('react').SetStateAction<MetricasProcuradorData|null>>]} */
  const [metricas, setMetricas] = useState(null);

  /**
   * Consulta al servidor las métricas del área de Procuraduría.
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

  useEffect(() => {
    cargarMetricas();
  }, []);

  /**
   * Abre el diálogo de impresión del navegador para guardar o imprimir el panel.
   * @returns {void}
   */
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
