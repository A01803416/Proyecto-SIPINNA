import { useState, useEffect } from "react";
import { API_URL, encabezados } from "../../services/api_url";
import { claseEstatus, claseRiesgo } from "../procurador/estatus";

// el estatus y las notas del caso los maneja el procurador, aqui solo se le pueden sumar reportes
export default function DetalleCasoAdmin({ idCaso, onClose }) {
  const [caso, setCaso] = useState(null);
  const [sueltos, setSueltos] = useState([]);
  const [mostrarSelect, setMostrarSelect] = useState(false);

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

  // el caso no trae su municipio, se toma del detalle de uno de sus reportes
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

      // la lista del admin solo trae reportes que no estan en ningun caso
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

  // se fusiona con un folio que ya esta en el caso y el procedure lo suma a ese caso
  async function agregarReporte(e) {
    const folioNuevo = e.target.value;
    if (!folioNuevo) return;
    if (!window.confirm(`¿Agregar ${folioNuevo} al caso ${caso.id_caso}?`)) {
      e.target.value = "";
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/fusiones`, {
        method: "POST",
        headers: encabezados(),
        body: JSON.stringify({
          folio1: folioNuevo,
          folio2: caso.reportes[0].id_folio_reporte,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMostrarSelect(false);
        cargarCaso();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar con el servidor");
    }
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

            {mostrarSelect ? (
              <div className="form-group" style={{ marginTop: "15px" }}>
                <label>Reporte a agregar:</label>
                <select
                  defaultValue=""
                  onChange={agregarReporte}
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
  );
}
