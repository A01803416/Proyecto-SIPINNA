import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import { ESTATUS, esCierre } from './estatus';

/**
 * Muestra y permite gestionar un reporte, su estatus, municipio y bitácora.
 * @param {Object} props
 * @param {number|string} props.folio Folio del reporte que se consulta.
 * @param {() => void} props.onClose Cierra el modal del reporte.
 * @param {() => (void|Promise<void>)} props.onCambio Notifica cambios para actualizar la lista de reportes.
 * @returns {import('react').ReactNode} Modal del reporte o null mientras carga.
 */
export default function DetalleReporte({ folio, onClose, onCambio }) {
  const [reporte, setReporte] = useState(null);
  const [municipios, setMunicipios] = useState([]);
  const [notaPrivada, setNotaPrivada] = useState('');
  const [notaPublica, setNotaPublica] = useState('');

  /**
   * Solicita los datos del reporte actual y actualiza el estado del modal.
   * @returns {Promise<void>}
   */
  async function cargarReporte() {
    try {
      const res = await fetch(`${API_URL}/procurador/reportes/${folio}`, {
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

  /**
   * Obtiene la lista de municipios disponible para transferir el reporte.
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
    cargarReporte();
  }, [folio]);

  useEffect(() => {
    cargarMunicipios();
  }, []);

  /**
   * Actualiza el estatus del reporte y solicita un motivo si se va a cerrar.
   * @param {import('react').ChangeEvent<HTMLSelectElement>} e Evento del selector de estatus.
   * @returns {Promise<void>}
   */
  async function cambiarEstatus(e) {
    const estatus = e.target.value;
    let motivo = null;

    if (esCierre(estatus)) {
      motivo = window.prompt('Escribe el motivo de cierre del reporte:');
      if (motivo === null) return;
    }

    try {
      const res = await fetch(`${API_URL}/procurador/reportes/${folio}/estatus`, {
        method: 'PUT',
        headers: encabezados(),
        body: JSON.stringify({ estatus, motivo })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }

    cargarReporte();
    onCambio();
  }

  /**
   * Cambia la marca de posible duplicado del reporte.
   * @param {import('react').ChangeEvent<HTMLInputElement>} e Evento del checkbox.
   * @returns {Promise<void>}
   */
  async function marcarDuplicado(e) {
    try {
      const res = await fetch(`${API_URL}/procurador/reportes/${folio}/duplicado`, {
        method: 'PUT',
        headers: encabezados(),
        body: JSON.stringify({ valor: e.target.checked })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }

    cargarReporte();
    onCambio();
  }

  /**
   * Transfiere el reporte al municipio seleccionado; al confirmar la operación,
   * actualiza la lista y cierra el modal porque deja de pertenecer al procurador.
   * @param {import('react').ChangeEvent<HTMLSelectElement>} e Evento del selector de municipio.
   * @returns {Promise<void>}
   */
  async function corregirMunicipio(e) {
    const idMunicipio = Number(e.target.value);
    const elegidos = municipios.filter((m) => m.id_municipio === idMunicipio);
    const nombre = elegidos.length > 0 ? elegidos[0].nombre_municipio : '';

    if (!window.confirm(`El reporte pasará a ${nombre} y ya no podrás verlo. ¿Continuar?`)) return;

    try {
      const res = await fetch(`${API_URL}/procurador/reportes/${folio}/municipio`, {
        method: 'PUT',
        headers: encabezados(),
        body: JSON.stringify({ id_municipio: idMunicipio })
      });
      const data = await res.json();
      if (res.ok) {
        onCambio();
        onClose();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  }

  /**
   * Envía las notas privada y pública y limpia los campos si el registro tiene éxito.
   * @returns {Promise<void>}
   */
  async function agregarNota() {
    try {
      const res = await fetch(`${API_URL}/procurador/reportes/${folio}/notas`, {
        method: 'POST',
        headers: encabezados(),
        body: JSON.stringify({ descripcion_avance: notaPrivada, descripcion_publica: notaPublica })
      });
      const data = await res.json();
      if (res.ok) {
        setNotaPrivada('');
        setNotaPublica('');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }

    cargarReporte();
    onCambio();
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
             <div className="form-group" style={{marginBottom:'15px'}}>
                <label>Estatus Actual:</label>
                <select value={reporte.estatus} onChange={cambiarEstatus} style={{width:'100%', padding:'8px', borderRadius:'4px'}}>
                  {ESTATUS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
                {reporte.detalles_cierre && (
                  <p style={{margin:'6px 0 0', fontSize:'0.85rem'}}><strong>Motivo de cierre:</strong> {reporte.detalles_cierre}</p>
                )}
             </div>

             <div className="form-group" style={{marginBottom:'15px', display:'flex', alignItems:'center', gap:'10px', background:'#fff3cd', padding:'10px', borderRadius:'4px'}}>
                <input type="checkbox" id="dupCheck" checked={reporte.posible_duplicado} onChange={marcarDuplicado} disabled={reporte.id_caso !== null} style={{width:'auto'}} />
                <label htmlFor="dupCheck" style={{margin:0, fontWeight:'bold', color:'#856404'}}>Marcar como Posible Duplicado</label>
             </div>

             <div className="form-group" style={{marginBottom:'15px'}}>
               <label>Corregir Municipio (Transferir):</label>
               <select value={reporte.id_municipio} onChange={corregirMunicipio} disabled={reporte.id_caso !== null} style={{width:'100%', padding:'8px', borderRadius:'4px'}}>
                 {municipios.map((m) => <option key={m.id_municipio} value={m.id_municipio}>{m.nombre_municipio}</option>)}
               </select>
             </div>

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

               <div className="add-note-box">
                 <textarea
                   value={notaPrivada}
                   onChange={(e) => setNotaPrivada(e.target.value)}
                   placeholder="Nota interna (privada, obligatoria)"
                   style={{width:'100%', minHeight:'60px', padding:'8px', borderRadius:'4px', border:'1px solid #ccc', resize:'vertical'}}
                 ></textarea>
                 <textarea
                   value={notaPublica}
                   onChange={(e) => setNotaPublica(e.target.value)}
                   placeholder="Mensaje al ciudadano (público, opcional)"
                   style={{width:'100%', minHeight:'60px', padding:'8px', borderRadius:'4px', border:'1px solid #ccc', resize:'vertical', marginTop:'8px'}}
                 ></textarea>
                 <button onClick={agregarNota} className="btn-save" style={{marginTop:'8px', width:'100%', background:'#28a745', color:'white', border:'none', padding:'10px', borderRadius:'4px', cursor:'pointer'}}>Agregar Nota</button>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
