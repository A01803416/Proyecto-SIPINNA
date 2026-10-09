import { API_URL, encabezados } from '../../services/api_url';
import { claseEstatus, claseRiesgo } from '../procurador/estatus';

/**
 * @typedef {Object} ReporteFilaAdmin
 * @property {number|string} id_folio_reporte Folio del reporte.
 * @property {string} fecha_registro Fecha en que se registró.
 * @property {string} nombre_municipio Municipio asociado al reporte.
 * @property {string|null} [correo_procurador] Correo del procurador responsable.
 * @property {string} tipo_actividad Actividad detectada.
 * @property {string} nivel_riesgo Nivel de riesgo asignado.
 * @property {string} estatus Estatus actual del reporte.
 * @property {boolean} [peligro_inmediato] Indica si existe peligro inmediato.
 * @property {boolean} [posible_duplicado] Indica si se marcó como posible duplicado.
 */

// mostrarTodos en false deja solo los tres primeros, como en el tablero
// mostrarFusion agrega la columna de casillas para elegir los reportes a fusionar
/**
 * Renderiza reportes administrativos y sus acciones de consulta, descarga y fusión.
 * @param {Object} props Propiedades de la tabla.
 * @param {ReporteFilaAdmin[]} props.reportes Reportes que se mostrarán.
 * @param {(folio: number|string) => void} props.onVer Callback para abrir el detalle de un reporte.
 * @param {boolean} props.mostrarTodos Indica si se muestran todos los reportes; si no, muestra los tres primeros.
 * @param {boolean} props.mostrarFusion Indica si se habilitan las casillas de selección para fusión.
 * @param {(number|string)[]} props.seleccionados Folios seleccionados para fusionar.
 * @param {(folio: number|string) => void} props.onSeleccionar Callback al seleccionar o deseleccionar un folio.
 * @returns {JSX.Element} Tabla de reportes con las columnas configuradas.
 */
export default function TablaReportesAdmin({ reportes, onVer, mostrarTodos, mostrarFusion, seleccionados, onSeleccionar }) {
  const filas = mostrarTodos ? reportes : reportes.slice(0, 3);

  // abre la ventana antes del fetch para que el navegador no la bloquee
  /**
   * Obtiene los datos completos de un reporte y abre una vista imprimible.
   * @param {number|string} folio Folio del reporte que se va a descargar.
   * @returns {Promise<void>} Promesa que se resuelve al preparar la vista imprimible.
   */
  async function descargarReporte(folio) {
    const ventana = window.open('', '_blank');

    try {
      const res = await fetch(`${API_URL}/admin/reportes/${folio}`, {
        headers: encabezados()
      });
      const data = await res.json();

      if (!res.ok) {
        ventana.close();
        alert(data.message);
        return;
      }

      const r = data;

      ventana.document.write(`
        <html>
          <head>
            <title>Reporte ${r.id_folio_reporte}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; font-size: 14px; line-height: 1.6; color: #333; }
              .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 30px; }
              .row { margin-bottom: 12px; border-bottom: 1px solid #ddd; padding-bottom: 8px; display: flex; }
              strong { width: 180px; flex-shrink: 0; color: #000; }
              .val { flex-grow: 1; }
              .title { font-size: 26px; font-weight: bold; margin: 0; color: #000; text-transform: uppercase; }
              .subtitle { font-size: 14px; color: #666; margin: 8px 0 0 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 class="title">EXPEDIENTE RIETI: ${r.id_folio_reporte}</h2>
              <p class="subtitle">Sistema de Protección de Menores - Documento Oficial</p>
            </div>
            <div class="row"><strong>Fecha de Registro:</strong> <div class="val">${r.fecha_registro}</div></div>
            <div class="row"><strong>Municipio:</strong> <div class="val">${r.nombre_municipio}</div></div>
            <div class="row"><strong>Procurador:</strong> <div class="val">${r.correo_procurador || 'Sin procurador'}</div></div>
            <div class="row"><strong>Colonia:</strong> <div class="val">${r.colonia || 'No especificada'}</div></div>
            <div class="row"><strong>Lugar:</strong> <div class="val">${r.nombre_lugar || 'N/A'}</div></div>
            <div class="row"><strong>Actividad Detectada:</strong> <div class="val">${r.tipo_actividad}</div></div>
            <div class="row"><strong>Descripción de los Hechos:</strong> <div class="val">${r.descripcion}</div></div>
            <div class="row"><strong>Edad Aproximada:</strong> <div class="val">${r.edad_aproximada}</div></div>
            <div class="row"><strong>No. de Menores:</strong> <div class="val">${r.numero_menores}</div></div>
            <div class="row"><strong>Nivel de Riesgo:</strong> <div class="val">${r.nivel_riesgo}</div></div>
            <div class="row"><strong>Estatus Actual:</strong> <div class="val">${r.estatus}</div></div>
            <script>
              window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); };
            </script>
          </body>
        </html>
      `);
      ventana.document.close();
    } catch (err) {
      console.error(err);
      ventana.close();
      alert('No se pudo conectar con el servidor');
    }
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {mostrarFusion && <th>Fusionar</th>}
          <th>Folio</th>
          <th>Fecha</th>
          <th>Municipio</th>
          <th>Procurador</th>
          <th>Actividad</th>
          <th>Nivel de Riesgo</th>
          <th>Estatus</th>
          <th>Alertas</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        {filas.length === 0 && (
          <tr><td colSpan="10" style={{textAlign:'center', padding:'20px'}}>No hay reportes.</td></tr>
        )}
        {filas.map((r) => (
          <tr key={r.id_folio_reporte} style={{background: r.peligro_inmediato ? '#fff5f5' : 'inherit'}}>
            {mostrarFusion && (
              <td>
                <input
                  type="checkbox"
                  checked={seleccionados.includes(r.id_folio_reporte)}
                  onChange={() => onSeleccionar(r.id_folio_reporte)}
                />
              </td>
            )}
            <td>{r.id_folio_reporte}</td>
            <td>{r.fecha_registro.slice(0, 10)}</td>
            <td>{r.nombre_municipio}</td>
            <td>{r.correo_procurador || 'Sin procurador'}</td>
            <td>{r.tipo_actividad}</td>
            <td><span className={`badge ${claseRiesgo(r.nivel_riesgo)}`}>{r.nivel_riesgo}</span></td>
            <td><span className={`badge ${claseEstatus(r.estatus)}`}>{r.estatus}</span></td>
            <td>
              <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                {r.peligro_inmediato && <span style={{background:'#dc3545', color:'white', fontSize:'0.7rem', padding:'2px 6px', borderRadius:'12px', whiteSpace:'nowrap', textAlign:'center'}}>Peligro Inmediato</span>}
                {r.posible_duplicado && <span style={{background:'#ffc107', color:'black', fontSize:'0.7rem', padding:'2px 6px', borderRadius:'12px', whiteSpace:'nowrap', textAlign:'center'}}>Posible Duplicado</span>}
                {!r.peligro_inmediato && !r.posible_duplicado && <span style={{color:'#aaa', fontSize:'0.8rem', textAlign:'center'}}>-</span>}
              </div>
            </td>
            <td>
              <button className="btn-action" onClick={() => onVer(r.id_folio_reporte)}>Ver</button>
              <button className="btn-action-icon" onClick={() => descargarReporte(r.id_folio_reporte)}>↓</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
