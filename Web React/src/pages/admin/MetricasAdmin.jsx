import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';

/**
 * @typedef {Object} TiempoAtencionMunicipio
 * @property {string} nombre_municipio Nombre del municipio.
 * @property {number|null} promedio_horas Promedio de atención en horas, o null si no hay cierres.
 * @property {number} reportes_cerrados Cantidad de reportes cerrados considerados.
 */

/**
 * @typedef {Object} ConteoPorEstatus
 * @property {string} estatus Estatus de los reportes.
 * @property {number} total Cantidad de reportes con ese estatus.
 */

/**
 * @typedef {Object} ConteoPorMunicipio
 * @property {string} nombre_municipio Nombre del municipio.
 * @property {number} total Cantidad de reportes del municipio.
 */

/**
 * @typedef {Object} MetricasGlobalesAdmin
 * @property {TiempoAtencionMunicipio[]} tiempo_promedio_atencion_por_municipio Promedios de atención por municipio.
 * @property {ConteoPorEstatus[]} reportes_por_estatus Conteos de reportes agrupados por estatus.
 * @property {ConteoPorMunicipio[]} reportes_por_municipio Conteos de reportes agrupados por municipio.
 * @property {number} total_reportes Total de reportes considerados en las métricas.
 */

/**
 * Presenta las métricas globales de atención, estatus y reportes por municipio.
 * Permite imprimir la vista para guardarla o exportarla como PDF.
 * @returns {JSX.Element|null} Panel de métricas, o null mientras carga la información.
 */
export default function MetricasAdmin() {
  const [metricas, setMetricas] = useState(null);

  /**
   * Obtiene las métricas globales administrativas desde la API.
   * @returns {Promise<void>} Promesa que se resuelve al terminar la solicitud.
   */
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

  /**
   * Abre el diálogo de impresión del navegador para guardar la vista como PDF.
   * @returns {void}
   */
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
