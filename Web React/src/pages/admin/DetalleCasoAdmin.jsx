import { useState, useEffect } from "react";
import { API_URL, encabezados } from "../../services/api_url";
import { claseEstatus, claseRiesgo } from "../procurador/estatus";
import Dialogos from "../../components/Dialogos";
import DescargaPDF from "../../components/DescargaPDF";

export default function DetalleCasoAdmin({ idCaso, onClose, onCambio, onVerReporte }) {
  const [caso, setCaso] = useState(null);
  const [sueltos, setSueltos] = useState([]);
  const [mostrarSelect, setMostrarSelect] = useState(false);

  // Estados para el diálogo de confirmación de fusión/asociación de reporte
  const [modalConfirmAbierto, setModalConfirmAbierto] = useState(false);
  const [folioAObtener, setFolioAObtener] = useState(null);
  const [targetSelect, setTargetSelect] = useState(null);

  async function cargarCaso() {
    try {
      const res = await fetch(`${API_URL}/admin/casos/${idCaso}`, {
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

  async function buscarSueltos() {
    const folioDelCaso = caso.reportes[0].id_folio_reporte;

    try {
      const resReporte = await fetch(
        `${API_URL}/admin/reportes/${folioDelCaso}`,
        {
          headers: encabezados(),
        },
      );
      const reporte = await resReporte.json();
      if (!resReporte.ok) {
        alert(reporte.message);
        return;
      }

      const res = await fetch(
        `${API_URL}/admin/reportes?id_municipio=${reporte.id_municipio}`,
        {
          headers: encabezados(),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setSueltos(data);
        setMostrarSelect(true);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar con el servidor");
    }
  }

  function solicitarAgregarReporte(e) {
    const folioNuevo = e.target.value;
    if (!folioNuevo) return;

    setFolioAObtener(folioNuevo);
    setTargetSelect(e.target);
    setModalConfirmAbierto(true);
  }

  async function ejecutarAgregarReporte() {
    setModalConfirmAbierto(false);
    try {
      const res = await fetch(`${API_URL}/admin/fusiones`, {
        method: "POST",
        headers: encabezados(),
        body: JSON.stringify({
          folio1: folioAObtener,
          folio2: caso.reportes[0].id_folio_reporte,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMostrarSelect(false);
        cargarCaso();
        onCambio();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar con el servidor");
    }
  }

  function cancelarAgregarReporte() {
    if (targetSelect) targetSelect.value = "";
    setModalConfirmAbierto(false);
  }

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
            <p class="subtitle">Sistema de Protección de Menores - Documento Oficial</p>
          </div>
          
          <div class="section-title">Datos del Caso</div>
          <div class="row"><strong>Estatus del Caso:</strong> <div class="val">${caso.estatus_caso || 'N/A'}</div></div>
          <div class="row"><strong>Fecha de Creación:</strong> <div class="val">${caso.fecha_creacion}</div></div>
          <div class="row"><strong>Fecha de Cierre:</strong> <div class="val">${caso.fecha_cierre || "Abierto"}</div></div>
          <div class="row"><strong>Reportes Asociados:</strong> <div class="val">${caso.total_reportes}</div></div>

          <div class="section-title">Reportes del Caso</div>
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

          <div class="section-title">Bitácora de Notas</div>
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
          <h2>Detalle de Caso: {caso.id_caso}</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button 
              onClick={imprimirCaso}
              style={{ background: "#333", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem" }}
            >
              Imprimir Caso
            </button>
            <button className="btn-close" onClick={onClose}>
              &times;
            </button>
          </div>
        </div>
        <div
          className="modal-body"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "25px",
          }}
        >
          <div className="modal-section left-col">
            <h3
              style={{
                borderBottom: "1px solid #eee",
                paddingBottom: "8px",
                marginBottom: "12px",
              }}
            >
              Datos del Caso
            </h3>
            <p style={{ margin: "4px 0" }}>
              <strong>Estatus:</strong> {caso.estatus_caso}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>Fecha de Creación:</strong> {caso.fecha_creacion}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>Fecha de Cierre:</strong> {caso.fecha_cierre || "Abierto"}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>Reportes Asociados:</strong> {caso.total_reportes}
            </p>

            <h3
              style={{
                borderBottom: "1px solid #eee",
                paddingBottom: "8px",
                margin: "20px 0 12px",
              }}
            >
              Reportes del Caso
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
                      <button className="btn-action" onClick={() => onVerReporte(r.id_folio_reporte)}>Ver</button>
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

            {mostrarSelect ? (
              <div className="form-group" style={{ marginTop: "15px" }}>
                <label>Reporte a agregar:</label>
                <select
                  defaultValue=""
                  onChange={solicitarAgregarReporte}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
                >
                  <option value="">Selecciona un reporte...</option>
                  {sueltos.map((r) => (
                    <option key={r.id_folio_reporte} value={r.id_folio_reporte}>
                      {r.id_folio_reporte} - {r.tipo_actividad} ({r.estatus})
                    </option>
                  ))}
                </select>
                {sueltos.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      fontStyle: "italic",
                    }}
                  >
                    No hay reportes sueltos en este municipio.
                  </p>
                )}
              </div>
            ) : (
              <button
                className="btn-black"
                style={{ marginTop: "15px" }}
                onClick={buscarSueltos}
              >
                Agregar reporte a este caso
              </button>
            )}
          </div>

          <div className="modal-section right-col">
            <div className="notas-container">
              <h4>Bitácora de Notas</h4>
              <div
                className="notas-list"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  background: "#f8f9fa",
                  padding: "10px",
                  borderRadius: "8px",
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
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Dialogo personalizado para confirmación de fusión */}
    <Dialogos
      isOpen={modalConfirmAbierto}
      title="Confirmar Fusión"
      message={`¿Deseas agregar el reporte ${folioAObtener} al caso ${caso.id_caso}?`}
      type="confirm"
      onConfirm={ejecutarAgregarReporte}
      onClose={cancelarAgregarReporte}
    />
    </>
  );
}