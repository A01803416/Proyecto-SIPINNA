import { useState, useEffect } from "react";
import { API_URL, encabezados } from "../../services/api_url";
import { claseEstatus } from "./estatus";
import DetalleCaso from "./DetalleCaso";

/**
 * Muestra los casos fusionados disponibles para el procurador y permite abrir
 * el detalle de un caso para consultarlo o actualizarlo.
 * @returns {import('react').JSX.Element} Tabla de casos y detalle seleccionado.
 */
export default function CasosProcurador() {
  const [casos, setCasos] = useState([]);
  const [casoAbierto, setCasoAbierto] = useState(null);

  /**
   * Solicita los casos al servidor y actualiza la tabla si la respuesta es exitosa.
   * Muestra un aviso si el servidor responde con error o no está disponible.
   * @returns {Promise<void>}
   */
  async function cargarCasos() {
    try {
      const res = await fetch(`${API_URL}/procurador/casos`, {
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
              <th>Reportes Asociados</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {casos.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
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
        <DetalleCaso
          idCaso={casoAbierto}
          onClose={() => setCasoAbierto(null)}
          onCambio={cargarCasos}
        />
      )}
    </div>
  );
}
