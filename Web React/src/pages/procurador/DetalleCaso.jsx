import { useState, useEffect } from "react";
import { API_URL, encabezados } from "../../services/api_url";
import { ESTATUS, esCierre, claseEstatus, claseRiesgo } from "./estatus";

export default function DetalleCaso({ idCaso, onClose, onCambio, onVerReporte }) {
  const [caso, setCaso] = useState(null);
  const [notaPrivada, setNotaPrivada] = useState("");
  const [notaPublica, setNotaPublica] = useState("");

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

  async function cambiarEstatus(e) {
    const estatus = e.target.value;
    let motivo = null;

    if (esCierre(estatus)) {
      motivo = window.prompt("Escribe el motivo de cierre del caso:");
      if (motivo === null) return;
    }

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

  // --- Cambio 2: Descargar un reporte individual ---
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

  // --- Cambio 4: Imprimir todo el caso ---
  function imprimirCaso() {
    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <html>
        <head>
          <title>Caso ${caso.id_caso}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; font-size: 14px; line-height: 1.6; color: #333; }
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
                      <button className="btn-action-icon" onClick={() => descargarReporte(r.id_folio_reporte)}>↓</button>
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
              Gestión del Caso
            </h3>
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Estatus del Caso:</label>
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
              <h4>Bitácora de Notas</h4>
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
                  Agregar Nota
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}