import { useState, useEffect } from "react";
import { API_URL, encabezados } from "../../services/api_url";
import DetalleReporteAdmin from "./DetalleReporteAdmin";
import Dialogos from "../../components/Dialogos";

/**
 * Muestra los reportes marcados como posible duplicado y permite elegir dos
 * para fusionarlos en un caso.
 * @returns {JSX.Element} Tabla de posibles duplicados.
 */
export default function DuplicadosAdmin() {
  const [duplicados, setDuplicados] = useState([]);
  const [folioAbierto, setFolioAbierto] = useState(null);
  const [seleccionados, setSeleccionados] = useState([]);

  // Estado para el modal de fusión
  const [modalFusionAbierto, setModalFusionAbierto] = useState(false);

  // texto de la ventana de aviso, vacio cuando esta cerrada
  const [aviso, setAviso] = useState("");

  /**
   * Obtiene los reportes marcados como posible duplicado.
   * @returns {Promise<void>}
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

  /**
   * Agrega o quita un reporte de la selección para fusionar, que admite como máximo dos.
   * @param {number|string} folio Folio del reporte.
   * @returns {void}
   */
  function seleccionar(folio) {
    if (seleccionados.includes(folio)) {
      setSeleccionados(seleccionados.filter((f) => f !== folio));
    } else if (seleccionados.length === 2) {
      setAviso("Solo puedes elegir 2 reportes para fusionar.");
    } else {
      setSeleccionados([...seleccionados, folio]);
    }
  }

  /**
   * Pide confirmación para fusionar los dos reportes seleccionados.
   * @returns {void}
   */
  function solicitarFusion() {
    setModalFusionAbierto(true);
  }

  /**
   * Fusiona los dos reportes seleccionados en un caso.
   * @returns {Promise<void>}
   */
  async function ejecutarFusion() {
    setModalFusionAbierto(false);
    const folio1 = seleccionados[0];
    const folio2 = seleccionados[1];

    try {
      const res = await fetch(`${API_URL}/admin/fusiones`, {
        method: "POST",
        headers: encabezados(),
        body: JSON.stringify({ folio1, folio2 }),
      });
      const data = await res.json();
      if (res.ok) {
        setAviso(`Reportes fusionados en el caso ${data.id_caso}.`);
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
            onClick={solicitarFusion}
          >
            Fusionar {seleccionados.length} Reportes
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

      {/* Modal de Fusión */}
      <Dialogos
        isOpen={modalFusionAbierto}
        title="Confirmar Fusión"
        message={`¿Estás seguro de fusionar los reportes ${seleccionados[0]} y ${seleccionados[1]} en un mismo caso?`}
        type="confirm"
        onConfirm={ejecutarFusion}
        onClose={() => setModalFusionAbierto(false)}
      />

      {/* Ventana de aviso */}
      <Dialogos
        isOpen={aviso !== ""}
        title="Aviso"
        message={aviso}
        type="aviso"
        confirmText="Aceptar"
        onConfirm={() => setAviso("")}
        onClose={() => setAviso("")}
      />
    </div>
  );
}