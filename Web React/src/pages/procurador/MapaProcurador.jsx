import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import MapaCalor from '../../components/MapaCalor';
import { leerSesion } from '../../services/sesion';

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

        {/* Filtro Estatus */}
        <select value={estatusSel} onChange={(e) => setEstatusSel(e.target.value)}>
          <option value="">Estatus</option>
          <option value="Nuevo">Nuevo</option>
          <option value="Registrado">Registrado</option>
          <option value="Cerrado">Cerrado</option>
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