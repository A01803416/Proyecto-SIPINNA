import { useState, useEffect } from "react";
import { API_URL, encabezados } from "../../services/api_url";
import { ESTATUS, esCierre, claseEstatus, claseRiesgo } from "./estatus";
import DetalleReporte from "./DetalleReporte";
import Dialogos from "../../components/Dialogos";
import DescargaPDF from "../../components/DescargaPDF";

/**
 * Muestra y permite gestionar un caso: su estatus, sus notas y sus reportes,
 * cuyo detalle se abre desde aquí. También permite imprimir el caso.
 * @param {Object} props
 * @param {number|string} props.idCaso Identificador del caso que se consulta.
 * @param {() => void} props.onClose Cierra el modal del caso.
 * @param {() => (void|Promise<void>)} props.onCambio Avisa que hubo un cambio para actualizar la lista de casos.
 * @returns {import('react').ReactNode} Modal del caso, o null mientras carga.
 */
export default function DetalleCaso({ idCaso, onClose, onCambio }) {
  const [caso, setCaso] = useState(null);
  const [notaPrivada, setNotaPrivada] = useState("");
  const [notaPublica, setNotaPublica] = useState("");
  const [folioAbierto, setFolioAbierto] = useState(null);

  // Estados para el modal de diálogo de cierre
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [estatusPendiente, setEstatusPendiente] = useState("");
  const [motivoCierre, setMotivoCierre] = useState("");

  /**
   * Obtiene los datos del caso con sus reportes y notas.
   * @returns {Promise<void>}
   */
  async function cargarCaso() {
    try {
      const res = await fetch(`${API_URL}/procurador/casos/${idCaso}`, {
        headers: encabezados(),
      });
      const data = await res.json();
      if (res.ok) {
        setCaso(data);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar con el servidor");
    }
  }

  useEffect(() => {
    cargarCaso();
  }, [idCaso]);

  /**
   * Cambia el estatus elegido; si es de cierre, primero pide el motivo.
   * @param {import('react').ChangeEvent<HTMLSelectElement>} e Evento del selector de estatus.
   * @returns {Promise<void>}
   */
  async function cambiarEstatus(e) {
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
   * Guarda el nuevo estatus del caso.
   * @param {string} estatus Estatus nuevo.
   * @param {string|null} motivo Motivo de cierre, o null si el estatus no es de cierre.
   * @returns {Promise<void>}
   */
  async function guardarEstatus(estatus, motivo) {
    try {
      const res = await fetch(`${API_URL}/procurador/casos/${idCaso}/estatus`, {
        method: "PUT",
        headers: encabezados(),
        body: JSON.stringify({ estatus, motivo }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar con el servidor");
    }

    cargarCaso();
    onCambio();
  }

  /**
   * Cierra el caso con el motivo escrito en la ventana de cierre.
   * @returns {void}
   */
  function confirmarCierre() {
    setModalCierreAbierto(false);
    guardarEstatus(estatusPendiente, motivoCierre);
  }

  /**
   * Agrega una nota de avance al caso, con su parte privada y su parte pública.
   * @returns {Promise<void>}
   */
  async function agregarNota() {
    try {
      const res = await fetch(`${API_URL}/procurador/casos/${idCaso}/notas`, {
        method: "POST",
        headers: encabezados(),
        body: JSON.stringify({
          descripcion_avance: notaPrivada,
          descripcion_publica: notaPublica,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotaPrivada("");
        setNotaPublica("");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar con el servidor");
    }

    cargarCaso();
    onCambio();
  }

  /**
   * Abre una versión imprimible de un reporte del caso.
   * @param {number|string} folio Folio del reporte.
   * @returns {Promise<void>}
   */
  async function descargarReporte(folio) {
    const ventana = window.open('', '_blank');
    try {
      const res = await fetch(`${API_URL}/procurador/reportes/${folio}`, {
        headers: encabezados()
      });
      const data = await res.json();

      if (!res.ok) {
        ventana.close();
        alert(data.message);
        return;
      }

      const r = data;
      const fechaActual = new Date().toLocaleString('es-MX');

      ventana.document.write(`
        <html>
          <head>
            <title>Reporte ${r.id_folio_reporte}</title>
            <style>
              @page { margin: 0; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                padding: 50px 40px; 
                margin: 0;
                font-size: 14px; 
                line-height: 1.6; 
                color: #333; 
              }
              .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 30px; }
              .row { margin-bottom: 12px; border-bottom: 1px solid #ddd; padding-bottom: 8px; display: flex; }
              strong { width: 180px; flex-shrink: 0; color: #000; }
              .val { flex-grow: 1; }
              .title { font-size: 26px; font-weight: bold; margin: 0; color: #000; text-transform: uppercase; }
              .subtitle { font-size: 14px; color: #666; margin: 8px 0 0 0; }

              .pie-pagina-limpio {
                position: fixed;
                bottom: 30px;
                left: 40px;
                right: 40px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
                color: #666;
                font-family: Arial, sans-serif;
                border-top: 1px solid #eee;
                padding-top: 8px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 class="title">EXPEDIENTE RIETI: ${r.id_folio_reporte}</h2>
              <p class="subtitle">RIETI · SIPINNA Atizapán</p>
            </div>
            <div class="row"><strong>Fecha de registro:</strong> <div class="val">${r.fecha_registro}</div></div>
            <div class="row"><strong>Municipio:</strong> <div class="val">${r.nombre_municipio}</div></div>
            <div class="row"><strong>Colonia:</strong> <div class="val">${r.colonia || 'No especificada'}</div></div>
            <div class="row"><strong>Lugar:</strong> <div class="val">${r.nombre_lugar || 'N/A'}</div></div>
            <div class="row"><strong>Actividad detectada:</strong> <div class="val">${r.tipo_actividad}</div></div>
            <div class="row"><strong>Descripción de los hechos:</strong> <div class="val">${r.descripcion}</div></div>
            <div class="row"><strong>Edad aproximada:</strong> <div class="val">${r.edad_aproximada}</div></div>
            <div class="row"><strong>Número de niñas, niños o adolescentes:</strong> <div class="val">${r.numero_menores}</div></div>
            <div class="row"><strong>Nivel de riesgo:</strong> <div class="val">${r.nivel_riesgo}</div></div>
            <div class="row"><strong>Estatus actual:</strong> <div class="val">${r.estatus}</div></div>

            <div class="pie-pagina-limpio">
              <div>Generado: ${fechaActual} - Folio: ${r.id_folio_reporte}</div>
              <div>Página 1 de 1</div>
            </div>

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

  /**
   * Abre una versión imprimible del caso con sus reportes y notas.
   * @returns {void}
   */
  function imprimirCaso() {
    const ventana = window.open('', '_blank');
    const fechaActual = new Date().toLocaleString('es-MX');

    ventana.document.write(`
      <html>
        <head>
          <title>Caso ${caso.id_caso}</title>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 50px 40px; 
              margin: 0;
              font-size: 14px; 
              line-height: 1.6; 
              color: #333; 
            }
            .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 30px; }
            .title { font-size: 26px; font-weight: bold; margin: 0; color: #000; text-transform: uppercase; }
            .subtitle { font-size: 14px; color: #666; margin: 8px 0 0 0; }
            .section-title { font-size: 18px; font-weight: bold; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
            .row { margin-bottom: 8px; display: flex; }
            strong { width: 180px; flex-shrink: 0; color: #000; }
            .val { flex-grow: 1; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; color: #000; }
            .nota { background: #f8f9fa; padding: 12px; margin-bottom: 10px; border-left: 4px solid #333; }
            .nota-fecha { font-weight: bold; margin-bottom: 5px; color: #000; }

            .pie-pagina-limpio {
              position: fixed;
              bottom: 30px;
              left: 40px;
              right: 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #666;
              font-family: Arial, sans-serif;
              border-top: 1px solid #eee;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 class="title">EXPEDIENTE DE CASO: ${caso.id_caso}</h2>
            <p class="subtitle">RIETI · SIPINNA Atizapán</p>
          </div>
          
          <div class="section-title">Datos del caso</div>
          <div class="row"><strong>Estatus del caso:</strong> <div class="val">${caso.estatus_caso || 'N/A'}</div></div>
          <div class="row"><strong>Fecha de creación:</strong> <div class="val">${caso.fecha_creacion}</div></div>
          <div class="row"><strong>Fecha de cierre:</strong> <div class="val">${caso.fecha_cierre || "Abierto"}</div></div>
          <div class="row"><strong>Reportes asociados:</strong> <div class="val">${caso.total_reportes}</div></div>

          <div class="section-title">Reportes del caso</div>
          <table>
            <thead>
              <tr><th>Folio</th><th>Actividad</th><th>Riesgo</th><th>Estatus</th></tr>
            </thead>
            <tbody>
              ${caso.reportes.map(r => `
                <tr>
                  <td>${r.id_folio_reporte}</td>
                  <td>${r.tipo_actividad}</td>
                  <td>${r.nivel_riesgo}</td>
                  <td>${r.estatus}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Bitácora de notas</div>
          ${caso.notas.length === 0 ? '<p>No hay notas registradas.</p>' : ''}
          ${caso.notas.map(n => `
            <div class="nota">
              <div class="nota-fecha">${n.fecha_registro}</div>
              <div style="margin-bottom: 4px;"><strong>Privada:</strong> ${n.descripcion_avance}</div>${n.descripcion_publica ? `<div><strong>Pública:</strong> ${n.descripcion_publica}</div>` : ''}
            </div>
          `).join('')}

          <div class="pie-pagina-limpio">
            <div>Generado: ${fechaActual} - Caso ID: ${caso.id_caso}</div>
            <div>Página 1 de 1</div>
          </div>

          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); };
          </script>
        </body>
      </html>
    `);
    ventana.document.close();
  }

  if (!caso) return null;

  return (
    <>
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "850px", width: "95%" }}
      >
        <div className="modal-header">
          <h2>Detalle de caso: {caso.id_caso}</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button 
              onClick={imprimirCaso}
              style={{ background: "#333", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem" }}
            >
              Imprimir caso
            </button>
            <button className="btn-close" onClick={onClose}>
              &times;
            </button>
          </div>
        </div>
        <div className="modal-body modal-body-detalle">
          <div className="modal-section left-col">
            <h3
              style={{
                borderBottom: "1px solid #eee",
                paddingBottom: "8px",
                marginBottom: "12px",
              }}
            >
              Datos del caso
            </h3>
            <p style={{ margin: "4px 0" }}>
              <strong>Fecha de creación:</strong> {caso.fecha_creacion}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>Fecha de cierre:</strong> {caso.fecha_cierre || "Abierto"}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>Reportes asociados:</strong> {caso.total_reportes}
            </p>

            <h3
              style={{
                borderBottom: "1px solid #eee",
                paddingBottom: "8px",
                margin: "20px 0 12px",
              }}
            >
              Reportes del caso
            </h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Actividad</th>
                  <th>Riesgo</th>
                  <th>Estatus</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {caso.reportes.map((r) => (
                  <tr
                    key={r.id_folio_reporte}
                    style={{
                      background: r.peligro_inmediato ? "#fff5f5" : "inherit",
                    }}
                  >
                    <td>{r.id_folio_reporte}</td>
                    <td>{r.tipo_actividad}</td>
                    <td>
                      <span className={`badge ${claseRiesgo(r.nivel_riesgo)}`}>
                        {r.nivel_riesgo}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${claseEstatus(r.estatus)}`}>
                        {r.estatus}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button className="btn-action" onClick={() => setFolioAbierto(r.id_folio_reporte)}>Ver</button>
                      <button className="btn-action-icon" onClick={() => descargarReporte(r.id_folio_reporte)}
                                        title="Descargar PDF"
                                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}
                                  >
                                        <DescargaPDF size={18} />
                                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal-section right-col">
            <h3
              style={{
                borderBottom: "1px solid #eee",
                paddingBottom: "8px",
                marginBottom: "12px",
              }}
            >
              Gestión del caso
            </h3>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Estatus del caso:</label>
              <select
                value={caso.estatus_caso}
                onChange={cambiarEstatus}
                style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
              >
                {ESTATUS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            <div className="notas-container" style={{ marginTop: "20px" }}>
              <h4>Bitácora de notas</h4>
              <div
                className="notas-list"
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  background: "#f8f9fa",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              >
                {caso.notas.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      fontStyle: "italic",
                    }}
                  >
                    No hay notas registradas.
                  </p>
                )}
                {caso.notas.map((n) => (
                  <div
                    key={n.id_avance}
                    style={{ fontSize: "0.85rem", marginBottom: "8px" }}
                  >
                    <strong>{n.fecha_registro}</strong>
                    <div>Privada: {n.descripcion_avance}</div>
                    {n.descripcion_publica && (
                      <div>Pública: {n.descripcion_publica}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="add-note-box">
                <textarea
                  value={notaPrivada}
                  onChange={(e) => setNotaPrivada(e.target.value)}
                  placeholder="Nota interna (privada, obligatoria)"
                  style={{
                    width: "100%",
                    minHeight: "60px",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    resize: "vertical",
                  }}
                ></textarea>
                <textarea
                  value={notaPublica}
                  onChange={(e) => setNotaPublica(e.target.value)}
                  placeholder="Mensaje al ciudadano (público, opcional)"
                  style={{
                    width: "100%",
                    minHeight: "60px",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    resize: "vertical",
                    marginTop: "8px",
                  }}
                ></textarea>
                <button
                  onClick={agregarNota}
                  className="btn-save"
                  style={{
                    marginTop: "8px",
                    width: "100%",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Agregar nota
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {folioAbierto && (
      <DetalleReporte
        folio={folioAbierto}
        onClose={() => setFolioAbierto(null)}
        onCambio={() => {
          cargarCaso();
          onCambio();
        }}
      />
    )}

    {/* Dialogo personalizado para el motivo de cierre */}
    <Dialogos
      isOpen={modalCierreAbierto}
      title="Motivo de cierre del caso"
      message="Escribe detalladamente el motivo por el cual se cierra el caso:"
      type="prompt"
      inputValue={motivoCierre}
      onInputChange={setMotivoCierre}
      onConfirm={confirmarCierre}
      onClose={() => setModalCierreAbierto(false)}
      confirmDisabled={motivoCierre.trim() === ''}
    />
    </>
  );
}