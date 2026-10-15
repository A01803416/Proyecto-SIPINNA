import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import { ESTATUS, esCierre } from './estatus';
import Dialogos from '../../components/Dialogos';

/**
 * Muestra y permite gestionar un reporte: su estatus, la marca de posible
 * duplicado, su municipio y sus notas de avance.
 * @param {Object} props
 * @param {number|string} props.folio Folio del reporte que se consulta.
 * @param {() => void} props.onClose Cierra el modal del reporte.
 * @param {() => (void|Promise<void>)} props.onCambio Avisa que hubo un cambio para actualizar la lista.
 * @returns {import('react').ReactNode} Modal del reporte, o null mientras carga.
 */
export default function DetalleReporte({ folio, onClose, onCambio }) {
  const [reporte, setReporte] = useState(null);
  const [municipios, setMunicipios] = useState([]);
  const [notaPrivada, setNotaPrivada] = useState('');
  const [notaPublica, setNotaPublica] = useState('');

  // Modales de Diálogo
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [motivoCierre, setMotivoCierre] = useState("");
  const [estatusPendiente, setEstatusPendiente] = useState("");

  const [modalTransferirAbierto, setModalTransferirAbierto] = useState(false);
  const [municipioDestino, setMunicipioDestino] = useState(null);
  const [nombreMunicipioDestino, setNombreMunicipioDestino] = useState("");

  /**
   * Obtiene los datos del reporte y sus notas.
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
   * Obtiene la lista de municipios a los que se puede transferir el reporte.
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
   * Cambia el estatus elegido; si es de cierre, primero pide el motivo.
   * @param {import('react').ChangeEvent<HTMLSelectElement>} e Evento del selector de estatus.
   * @returns {void}
   */
  function cambiarEstatus(e) {
    const estatus = e.target.value;

    if (esCierre(estatus)) {
      setEstatusPendiente(estatus);
      setMotivoCierre("");
      setModalCierreAbierto(true);
      return;
    }

    guardarEstatus(estatus, null);
  }

  /**
   * Guarda el nuevo estatus del reporte.
   * @param {string} estatus Estatus nuevo.
   * @param {string|null} motivo Motivo de cierre, o null si el estatus no es de cierre.
   * @returns {Promise<void>}
   */
  async function guardarEstatus(estatus, motivo) {
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
   * Cierra el reporte con el motivo escrito en la ventana de cierre.
   * @returns {void}
   */
  function confirmarCierre() {
    if (!motivoCierre.trim()) {
      alert("El motivo de cierre es obligatorio.");
      return;
    }
    setModalCierreAbierto(false);
    guardarEstatus(estatusPendiente, motivoCierre);
  }

  /**
   * Marca o desmarca el reporte como posible duplicado.
   * @param {import('react').ChangeEvent<HTMLInputElement>} e Evento de la casilla.
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
   * Pide confirmación para transferir el reporte al municipio elegido.
   * @param {import('react').ChangeEvent<HTMLSelectElement>} e Evento del selector de municipio.
   * @returns {void}
   */
  function solicitarTransferencia(e) {
    const idMunicipio = Number(e.target.value);
    const elegidos = municipios.filter((m) => m.id_municipio === idMunicipio);
    const nombre = elegidos.length > 0 ? elegidos[0].nombre_municipio : '';

    setMunicipioDestino(idMunicipio);
    setNombreMunicipioDestino(nombre);
    setModalTransferirAbierto(true);
  }

  /**
   * Transfiere el reporte al municipio confirmado y cierra el modal.
   * @returns {Promise<void>}
   */
  async function ejecutarTransferencia() {
    setModalTransferirAbierto(false);
    try {
      const res = await fetch(`${API_URL}/procurador/reportes/${folio}/municipio`, {
        method: 'PUT',
        headers: encabezados(),
        body: JSON.stringify({ id_municipio: municipioDestino })
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
   * Agrega una nota de avance con su parte privada y su parte pública.
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
               <select value={reporte.id_municipio} onChange={solicitarTransferencia} disabled={reporte.id_caso !== null} style={{width:'100%', padding:'8px', borderRadius:'4px'}}>
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

      {/* Modal para el Motivo de Cierre */}
      <Dialogos
        isOpen={modalCierreAbierto}
        title="Motivo de Cierre"
        message="Escribe detalladamente el motivo por el cual se cierra el reporte:"
        type="prompt"
        inputValue={motivoCierre}
        onInputChange={setMotivoCierre}
        onConfirm={confirmarCierre}
        onClose={() => setModalCierreAbierto(false)}
      />

      {/* Modal para Transferencia de Municipio */}
      <Dialogos
        isOpen={modalTransferirAbierto}
        title="Transferir Reporte"
        message={`El reporte pasará a ${nombreMunicipioDestino} y ya no podrás verlo en tu panel. ¿Continuar con la transferencia?`}
        type="confirm"
        onConfirm={ejecutarTransferencia}
        onClose={() => setModalTransferirAbierto(false)}
      />
    </div>
  );
}