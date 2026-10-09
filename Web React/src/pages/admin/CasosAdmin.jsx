import { useState, useEffect } from "react";
import { API_URL, encabezados } from "../../services/api_url";
import { claseEstatus } from "../procurador/estatus";
import DetalleCasoAdmin from "./DetalleCasoAdmin";

/**
 * Datos de un caso fusionado mostrados en la tabla de administración.
 * @typedef {Object} CasoAdmin
 * @property {number|string} id_caso Identificador del caso.
 * @property {string} fecha_creacion Fecha en que se creó el caso.
 * @property {string} estatus_caso Estatus actual del caso.
 * @property {string|null} responsable Nombre del procurador responsable, si existe.
 * @property {number|string} total_reportes Cantidad de reportes asociados.
 */

/**
 * Muestra los casos fusionados disponibles para administración y permite
 * consultar el detalle de cada caso.
 * @returns {JSX.Element} Vista de la tabla de casos y su detalle seleccionado.
 */
export default function CasosAdmin() {
  const [casos, setCasos] = useState([]);
  const [casoAbierto, setCasoAbierto] = useState(null);

  /**
   * Obtiene los casos desde la API y actualiza la tabla; informa si ocurre un error.
   * @returns {Promise<void>} Promesa que se resuelve al terminar la solicitud.
   */
  async function cargarCasos() {
    try {
      const res = await fetch(`${API_URL}/admin/casos`, {
        headers: encabezados(),
      });
      const data = await res.json();
      if (res.ok) {
        setCasos(data);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar con el servidor");
    }
  }

  useEffect(() => {
    cargarCasos();
  }, []);

  return (
    <div className="tablero-content">
      <div className="header-actions">
        <h2>Casos Fusionados</h2>
      </div>
      <div className="table-container">
        <table className="reports-table data-table">
          <thead>
            <tr>
              <th>ID Caso</th>
              <th>Fecha Creación</th>
              <th>Estatus</th>
              <th>Responsable</th>
              <th>Reportes Asociados</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {casos.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No hay casos fusionados.
                </td>
              </tr>
            ) : (
              casos.map((c) => (
                <tr key={c.id_caso}>
                  <td>{c.id_caso}</td>
                  <td>{c.fecha_creacion}</td>
                  <td>
                    <span className={`badge ${claseEstatus(c.estatus_caso)}`}>
                      {c.estatus_caso}
                    </span>
                  </td>
                  <td>{c.responsable || "Sin procurador"}</td>
                  <td>{c.total_reportes}</td>
                  <td>
                    <button
                      className="btn-action"
                      onClick={() => setCasoAbierto(c.id_caso)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {casoAbierto && (
        <DetalleCasoAdmin
          idCaso={casoAbierto}
          onClose={() => setCasoAbierto(null)}
        />
      )}
    </div>
  );
}
