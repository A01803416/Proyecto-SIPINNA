import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import MapaCalor from '../../components/MapaCalor';
import { leerSesion } from '../../services/sesion';

/**
 * Muestra el mapa de calor de los reportes del municipio del procurador, con
 * filtros por nivel de riesgo y estatus.
 * @returns {JSX.Element} Filtros y mapa de calor.
 */
export default function MapaProcurador() {
  const [puntosMapa, setPuntosMapa] = useState([]);

  // el municipio viene en la sesion desde el login
  const sesion = leerSesion();
  const textoMunicipio = sesion && sesion.municipio
    ? `Mi Municipio (${sesion.municipio.nombre_municipio})`
    : 'Sin municipio asignado';

  // Estados para filtrar por riesgo y estatus
  const [riesgoSel, setRiesgoSel] = useState("");
  const [estatusSel, setEstatusSel] = useState("");

  /**
   * Obtiene los puntos del mapa del procurador con los filtros elegidos.
   * @returns {Promise<void>}
   */
  async function cargarPuntosProcurador() {
    try {
      // Construir parámetros de consulta para la URL
      const params = new URLSearchParams();
      if (riesgoSel) params.append('nivel_riesgo', riesgoSel);
      if (estatusSel) params.append('estatus', estatusSel);

      const url = `${API_URL}/procurador/mapa?${params.toString()}`;

      const res = await fetch(url, {
        headers: encabezados()
      });
      const data = await res.json();
      if (res.ok) {
        setPuntosMapa(data);
      }
    } catch (err) {
      console.error("Error al cargar el mapa del procurador:", err);
    }
  }

  useEffect(() => {
    cargarPuntosProcurador();
  }, []);

  return (
    <div className="full-map-widget">
      <div className="map-filters-full">
        {/* Indicador de Municipio Fijo */}
        <select disabled>
          <option>{textoMunicipio}</option>
        </select>

        {/* Filtro Nivel de Riesgo */}
        <select value={riesgoSel} onChange={(e) => setRiesgoSel(e.target.value)}>
          <option value="">Nivel de Riesgo</option>
          <option value="Bajo">Bajo</option>
          <option value="Medio">Medio</option>
          <option value="Alto">Alto</option>
        </select>

        {/* Filtro Estatus Actualizado */}
        <select value={estatusSel} onChange={(e) => setEstatusSel(e.target.value)}>
          <option value="">Estatus (Todos)</option>
          <option value="Registrado">Registrado</option>
          <option value="En revisión">En revisión</option>
          <option value="En seguimiento">En seguimiento</option>
          <option value="Canalizado">Canalizado</option>
          <option value="Concluido">Concluido</option>
          <option value="Archivado">Archivado</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Reincidente">Reincidente</option>
        </select>

        {/* Botón Aplicar Filtros */}
        <button className="btn-black" onClick={cargarPuntosProcurador}>
          Aplicar Filtros
        </button>
      </div>

      <div style={{ height: '75vh', width: '100%', marginTop: '20px', borderRadius: '8px', overflow: 'hidden' }}>
        <MapaCalor puntos={puntosMapa} />
      </div>
    </div>
  );
}