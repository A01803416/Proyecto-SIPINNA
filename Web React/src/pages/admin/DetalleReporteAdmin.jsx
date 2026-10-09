import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';

/** Nombres legibles para los campos registrados en la bitácora. @type {Record<string, string>} */
const NOMBRES_CAMPO = {
  estatus: 'Estatus',
  posible_duplicado: 'Posible duplicado',
  id_municipio: 'Municipio',
  id_procurador: 'Procurador',
  id_caso: 'Caso'
};

/**
 * @typedef {Object} NotaReporteAdmin
 * @property {number|string} id_avance Identificador de la nota.
 * @property {string} fecha_registro Fecha en que se registró la nota.
 * @property {string} descripcion_avance Descripción privada del avance.
 * @property {string|null} [descripcion_publica] Descripción pública opcional.
 */

/**
 * @typedef {Object} CambioBitacoraReporte
 * @property {string} fecha_cambio Fecha en que ocurrió el cambio.
 * @property {string} campo_modificado Nombre del campo modificado.
 * @property {string|null} valor_anterior Valor previo al cambio.
 * @property {string|null} valor_nuevo Valor nuevo del campo.
 * @property {string|null} [responsable_en_ese_momento] Responsable del cambio.
 */

/** @typedef {Object} MunicipioCatalogoAdmin
 * @property {number} id_municipio Identificador del municipio.
 * @property {string} nombre_municipio Nombre del municipio.
 */

/** @typedef {Object} ProcuradorCatalogoAdmin
 * @property {number} id_procurador Identificador del procurador.
 * @property {string} correo_procurador Correo del procurador.
 */

/**
 * @typedef {Object} ReporteAdmin
 * @property {number|string} id_folio_reporte Folio del reporte.
 * @property {string} fecha_registro Fecha de registro.
 * @property {string} nombre_municipio Nombre del municipio asociado.
 * @property {string|null} [colonia] Colonia donde se detectó la situación.
 * @property {string|null} [nombre_lugar] Referencia del lugar.
 * @property {string} descripcion Descripción de los hechos.
 * @property {string} tipo_actividad Actividad detectada.
 * @property {string|number} edad_aproximada Edad aproximada de los menores.
 * @property {number} numero_menores Cantidad de menores involucrados.
 * @property {string} horario Horario en que ocurre la situación.
 * @property {string} frecuencia Frecuencia de la situación.
 * @property {string} nivel_riesgo Nivel de riesgo asignado.
 * @property {string|null} [evidencia_fotografica] URL o ruta de la evidencia.
 * @property {string} estatus Estatus actual del reporte.
 * @property {string|null} [correo_procurador] Correo del procurador responsable.
 * @property {string|null} [detalles_cierre] Motivo o detalles del cierre.
 * @property {boolean} [peligro_inmediato] Indica si existe peligro inmediato.
 * @property {boolean} [posible_duplicado] Indica si se marcó como posible duplicado.
 * @property {number|null} [id_caso] Caso al que fue fusionado, si existe.
 * @property {NotaReporteAdmin[]} notas Notas registradas para el reporte.
 * @property {CambioBitacoraReporte[]} bitacora Historial de cambios del reporte.
 */

/**
 * Muestra en modo de solo lectura la información, las notas y los cambios
 * registrados de un reporte.
 * @param {Object} props Propiedades del componente.
 * @param {number|string} props.folio Folio del reporte que se va a consultar.
 * @param {() => void} props.onClose Callback para cerrar el modal.
 * @returns {JSX.Element|null} Modal con el detalle del reporte, o null mientras carga.
 */
export default function DetalleReporteAdmin({ folio, onClose }) {
  const [reporte, setReporte] = useState(null);
  const [municipios, setMunicipios] = useState([]);
  const [procuradores, setProcuradores] = useState([]);

  /**
   * Obtiene de la API el reporte identificado por `folio`.
   * @returns {Promise<void>} Promesa que se resuelve al terminar la solicitud.
   */
  async function cargarReporte() {
    try {
      const res = await fetch(`${API_URL}/admin/reportes/${folio}`, {
        headers: encabezados()
      });
      const data = await res.json();
      if (res.ok) {
        setReporte(data);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  }

  // catalogos para cambiar los ids de la bitacora por nombres
  /**
   * Carga los catálogos de municipios y procuradores usados en la bitácora.
   * @returns {Promise<void>} Promesa que se resuelve al terminar las solicitudes.
   */
  async function cargarCatalogos() {
    try {
      const resMunicipios = await fetch(`${API_URL}/municipios`, {
        headers: encabezados()
      });
      const dataMunicipios = await resMunicipios.json();
      if (resMunicipios.ok) {
        setMunicipios(dataMunicipios);
      } else {
        alert(dataMunicipios.message);
      }

      const resProcuradores = await fetch(`${API_URL}/admin/procuradores`, {
        headers: encabezados()
      });
      const dataProcuradores = await resProcuradores.json();
      if (resProcuradores.ok) {
        setProcuradores(dataProcuradores);
      } else {
        alert(dataProcuradores.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  }

  useEffect(() => {
    cargarReporte();
  }, [folio]);

  useEffect(() => {
    cargarCatalogos();
  }, []);

  // la bitacora guarda todo como texto, por eso se compara con Number
  /**
   * Convierte un valor de bitácora a una etiqueta legible cuando corresponde.
   * @param {string} campo Nombre del campo modificado.
   * @param {string|null} valor Valor registrado en la bitácora.
   * @returns {string} Etiqueta traducida o el valor original.
   */
  function traducirValor(campo, valor) {
    if (valor === null || valor === '') {
      return campo === 'id_caso' ? 'Sin caso' : 'Sin asignar';
    }
    if (campo === 'posible_duplicado') {
      return valor === '1' ? 'Sí' : 'No';
    }
    if (campo === 'id_municipio') {
      const encontrados = municipios.filter((m) => m.id_municipio === Number(valor));
      return encontrados.length > 0 ? encontrados[0].nombre_municipio : valor;
    }
    if (campo === 'id_procurador') {
      const encontrados = procuradores.filter((p) => p.id_procurador === Number(valor));
      return encontrados.length > 0 ? encontrados[0].correo_procurador : valor;
    }
    if (campo === 'id_caso') {
      return `Caso ${valor}`;
    }
    return valor;
  }

  if (!reporte) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content report-print-area" onClick={(e) => e.stopPropagation()} style={{maxWidth: '850px', width: '95%'}}>
        <div className="modal-header">
          <h2 style={{display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap'}}>
             Detalle de Reporte: {reporte.id_folio_reporte}
             {reporte.peligro_inmediato && <span style={{background:'#dc3545', color:'white', fontSize:'0.75rem', padding:'4px 8px', borderRadius:'12px'}}>Peligro Inmediato</span>}
             {reporte.posible_duplicado && <span style={{background:'#ffc107', color:'#000', fontSize:'0.75rem', padding:'4px 8px', borderRadius:'12px'}}>Posible Duplicado</span>}
             {reporte.id_caso && <span style={{background:'#17a2b8', color:'white', fontSize:'0.75rem', padding:'4px 8px', borderRadius:'12px'}}>Fusionado en {reporte.id_caso}</span>}
          </h2>
          <div>
            <button className="btn-close" onClick={onClose}>&times;</button>
          </div>
        </div>
        <div className="modal-body" style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap: '25px'}}>

          <div className="modal-section left-col">
             <h3 style={{borderBottom:'1px solid #eee', paddingBottom:'8px', marginBottom:'12px'}}>Datos Generales</h3>
             <p style={{margin:'4px 0'}}><strong>Fecha de Registro:</strong> {reporte.fecha_registro}</p>
             <p style={{margin:'4px 0'}}><strong>Municipio:</strong> {reporte.nombre_municipio}</p>
             <p style={{margin:'4px 0'}}><strong>Colonia:</strong> {reporte.colonia || 'No especificada'}</p>
             <p style={{margin:'4px 0'}}><strong>Lugar (Referencia):</strong> {reporte.nombre_lugar || 'N/A'}</p>
             <p style={{margin:'4px 0'}}><strong>Descripción:</strong> {reporte.descripcion}</p>

             <h3 style={{borderBottom:'1px solid #eee', paddingBottom:'8px', margin:'20px 0 12px'}}>Detalles de la Situación</h3>
             <p style={{margin:'4px 0'}}><strong>Tipo de Actividad:</strong> {reporte.tipo_actividad}</p>
             <p style={{margin:'4px 0'}}><strong>Edad Aproximada:</strong> {reporte.edad_aproximada}</p>
             <p style={{margin:'4px 0'}}><strong>No. de Menores:</strong> {reporte.numero_menores}</p>
             <p style={{margin:'4px 0'}}><strong>Horario:</strong> {reporte.horario}</p>
             <p style={{margin:'4px 0'}}><strong>Frecuencia:</strong> {reporte.frecuencia}</p>
             <p style={{margin:'4px 0'}}><strong>Nivel de Riesgo:</strong> {reporte.nivel_riesgo}</p>

             {reporte.evidencia_fotografica && (
               <div style={{marginTop:'15px'}}>
                 <strong>Evidencia Fotográfica:</strong><br/>
                 <img src={reporte.evidencia_fotografica} alt="Evidencia" style={{maxWidth: '100%', marginTop: '10px', borderRadius: '8px', border:'1px solid #ddd'}} />
               </div>
             )}
          </div>

          <div className="modal-section right-col">
             <h3 style={{borderBottom:'1px solid #eee', paddingBottom:'8px', marginBottom:'12px'}}>Gestión del Caso</h3>
             <p style={{margin:'4px 0'}}><strong>Estatus Actual:</strong> {reporte.estatus}</p>
             <p style={{margin:'4px 0'}}><strong>Procurador Responsable:</strong> {reporte.correo_procurador || 'Sin procurador'}</p>
             {reporte.detalles_cierre && (
               <p style={{margin:'4px 0'}}><strong>Motivo de cierre:</strong> {reporte.detalles_cierre}</p>
             )}

             <div className="notas-container" style={{marginTop: '20px'}}>
               <h4>Bitácora de Notas</h4>
               <div className="notas-list" style={{maxHeight:'150px', overflowY:'auto', background:'#f8f9fa', padding:'10px', borderRadius:'8px', marginBottom:'10px'}}>
                  {reporte.notas.length === 0 && <p style={{fontSize:'0.85rem', color:'#666', fontStyle:'italic'}}>No hay notas registradas.</p>}
                  {reporte.notas.map((n) => (
                    <div key={n.id_avance} style={{fontSize:'0.85rem', marginBottom:'8px'}}>
                      <strong>{n.fecha_registro}</strong>
                      <div>Privada: {n.descripcion_avance}</div>
                      {n.descripcion_publica && <div>Pública: {n.descripcion_publica}</div>}
                    </div>
                  ))}
               </div>
             </div>

             <div className="notas-container" style={{marginTop: '20px'}}>
               <h4>Bitácora de Cambios</h4>
               <div className="notas-list" style={{maxHeight:'200px', overflowY:'auto', background:'#f8f9fa', padding:'10px', borderRadius:'8px'}}>
                  {reporte.bitacora.length === 0 && <p style={{fontSize:'0.85rem', color:'#666', fontStyle:'italic'}}>No hay cambios registrados.</p>}
                  {reporte.bitacora.map((b, i) => (
                    <div key={i} style={{fontSize:'0.85rem', marginBottom:'8px'}}>
                      <strong>{b.fecha_cambio}</strong>
                      <div>Campo: {NOMBRES_CAMPO[b.campo_modificado] || b.campo_modificado}</div>
                      <div>De: {traducirValor(b.campo_modificado, b.valor_anterior)} → A: {traducirValor(b.campo_modificado, b.valor_nuevo)}</div>
                      <div>Responsable: {b.responsable_en_ese_momento || 'Sin procurador'}</div>
                    </div>
                  ))}
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
