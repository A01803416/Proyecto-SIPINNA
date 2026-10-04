import { useState, useEffect } from "react";
import { API_URL, encabezados } from "../../services/api_url";
import { ESTATUS, esCierre, claseEstatus, claseRiesgo } from "./estatus";

export default function DetalleCaso({ idCaso, onClose, onCambio }) {
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

  // el estatus del caso se copia a todos sus reportes
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
          <div>
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
