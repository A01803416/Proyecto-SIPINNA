import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import MapaCalor from '../../components/MapaCalor';

/**
 * Componente del panel del procurador para visualizar los casos de su municipio en un mapa de calor.
 *
 * La vista muestra un selector fijo de municipio y dos filtros adicionales: nivel de riesgo y estatus.
 * Al montar el componente, o al presionar "Aplicar Filtros", consulta la API de procurador con los
 * parámetros seleccionados y actualiza los puntos que se renderizan en el mapa.
 *
 * @component
 * @returns {JSX.Element} Vista con filtros y mapa de calor del procurador.
 *
 * @example
 * return <MapaProcurador />
 */
export default function MapaProcurador() {
  const [puntosMapa, setPuntosMapa] = useState([]);

  // Estados para filtrar por riesgo y estatus
  const [riesgoSel, setRiesgoSel] = useState("");
  const [estatusSel, setEstatusSel] = useState("");

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
        <select disabled defaultValue="atizapan">
          <option value="atizapan">Mi Municipio (Atizapán de Zaragoza)</option>
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