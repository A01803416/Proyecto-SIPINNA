import { useState, useEffect } from "react";
import { API_URL, encabezados } from "../../services/api_url";
import DetalleReporteAdmin from "./DetalleReporteAdmin";

/**
 * @typedef {Object} ReporteDuplicadoAdmin
 * @property {number|string} id_folio_reporte Folio del reporte.
 * @property {string} nombre_municipio Municipio donde se registró.
 * @property {string|null} [colonia] Colonia donde se registró.
 * @property {string|null} [nombre_lugar] Referencia del lugar.
 * @property {string} tipo_actividad Actividad detectada en el reporte.
 * @property {string} fecha_registro Fecha de registro del reporte.
 */

// reportes que los procuradores marcaron como posible duplicado
// vienen ordenados por municipio y colonia para encontrar las parejas facil
/**
 * Lista los reportes marcados como posibles duplicados y permite seleccionar
 * dos para fusionarlos en un mismo caso.
 * @returns {JSX.Element} Tabla de reportes duplicados y controles de fusión.
 */
export default function DuplicadosAdmin() {
  const [duplicados, setDuplicados] = useState([]);
  const [folioAbierto, setFolioAbierto] = useState(null);
  const [seleccionados, setSeleccionados] = useState([]);

  /**
   * Obtiene de la API los reportes marcados como posibles duplicados.
   * @returns {Promise<void>} Promesa que se resuelve al terminar la solicitud.
   */
  async function cargarDuplicados() {
    try {
      const res = await fetch(`${API_URL}/admin/duplicados`, {
        headers: encabezados(),
      });
      const data = await res.json();
      if (res.ok) {
        setDuplicados(data);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar con el servidor");
    }
  }

  useEffect(() => {
    cargarDuplicados();
  }, []);

  // la fusion es siempre de dos reportes, no se deja elegir un tercero
  /**
   * Agrega o quita un folio de la selección, que admite como máximo dos.
   * @param {number|string} folio Folio del reporte que se selecciona o deselecciona.
   * @returns {void}
   */
  function seleccionar(folio) {
    if (seleccionados.includes(folio)) {
      setSeleccionados(seleccionados.filter((f) => f !== folio));
    } else if (seleccionados.length === 2) {
      alert("Solo puedes elegir 2 reportes para fusionar.");
    } else {
      setSeleccionados([...seleccionados, folio]);
    }
  }

  /**
   * Envía los dos reportes seleccionados para fusionarlos en un caso.
   * Si la operación tiene éxito, limpia la selección y actualiza la lista.
   * @returns {Promise<void>} Promesa que se resuelve al terminar la fusión.
   */
  async function fusionar() {
    const folio1 = seleccionados[0];
    const folio2 = seleccionados[1];
    if (!window.confirm(`¿Fusionar ${folio1} y ${folio2} en un mismo caso?`))
      return;

    try {
      const res = await fetch(`${API_URL}/admin/fusiones`, {
        method: "POST",
        headers: encabezados(),
        body: JSON.stringify({ folio1, folio2 }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Reportes fusionados en el caso ${data.id_caso}.`);
        setSeleccionados([]);
        cargarDuplicados();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar con el servidor");
    }
  }

  return (
    <div className="full-table-widget">
      <div
        className="report-filters-header"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h2>Posibles Duplicados</h2>
        {seleccionados.length === 2 && (
          <button
            className="btn-black"
            style={{ background: "#dc3545" }}
            onClick={fusionar}
          >
            Fusionar {seleccionados.length} Casos
          </button>
        )}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Fusionar</th>
            <th>Folio</th>
            <th>Municipio</th>
            <th>Colonia</th>
            <th>Lugar</th>
            <th>Actividad</th>
            <th>Fecha</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {duplicados.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                No hay reportes marcados como posible duplicado.
              </td>
            </tr>
          )}
          {duplicados.map((r) => (
            <tr key={r.id_folio_reporte}>
              <td>
                <input
                  type="checkbox"
                  checked={seleccionados.includes(r.id_folio_reporte)}
                  onChange={() => seleccionar(r.id_folio_reporte)}
                />
              </td>
              <td>{r.id_folio_reporte}</td>
              <td>{r.nombre_municipio}</td>
              <td>{r.colonia || "No especificada"}</td>
              <td>{r.nombre_lugar || "N/A"}</td>
              <td>{r.tipo_actividad}</td>
              <td>{r.fecha_registro.slice(0, 10)}</td>
              <td>
                <button
                  className="btn-action"
                  onClick={() => setFolioAbierto(r.id_folio_reporte)}
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {folioAbierto && (
        <DetalleReporteAdmin
          folio={folioAbierto}
          onClose={() => setFolioAbierto(null)}
        />
      )}
    </div>
  );
}
