import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import MapaCalor from '../../components/MapaCalor';

/**
 * Componente de administración para visualizar un mapa de calor con filtros por municipio,
 * nivel de riesgo y estatus.
 *
 * @component
 * @returns {JSX.Element} Vista del panel administrativo con filtros y mapa de calor.
 */
export default function MapaAdmin() {
  const [puntosMapa, setPuntosMapa] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  // Estados para guardar la selección de los filtros
  const [municipioSel, setMunicipioSel] = useState("");
  const [riesgoSel, setRiesgoSel] = useState("");
  const [estatusSel, setEstatusSel] = useState("");

  async function cargarDatos() {
    try {
      // Construir los parámetros de búsqueda para la URL
      const params = new URLSearchParams();
      if (municipioSel) params.append('id_municipio', municipioSel);
      if (riesgoSel) params.append('nivel_riesgo', riesgoSel);
      if (estatusSel) params.append('estatus', estatusSel);

      const url = `${API_URL}/admin/mapa?${params.toString()}`;

      // Obtener puntos de calor filtrados
      const resMapa = await fetch(url, { headers: encabezados() });
      const dataMapa = await resMapa.json();
      if (resMapa.ok) {
        setPuntosMapa(dataMapa);
      }

      // Obtener la lista de municipios la primera vez
      if (municipios.length === 0) {
        const resMunicipios = await fetch(`${API_URL}/municipios`, { headers: encabezados() });
        const dataMunicipios = await resMunicipios.json();
        if (resMunicipios.ok) setMunicipios(dataMunicipios);
      }
    } catch (err) {
      console.error("Error al conectar con el servidor: ", err);
    }
  }

  // Carga inicial de datos al abrir la pantalla
  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="full-map-widget">
      <div className="map-filters-full">
        {/* Filtro Municipio */}
        <select value={municipioSel} onChange={(e) => setMunicipioSel(e.target.value)}>
          <option value="">Todos los Municipios</option>
          {municipios.map((m) => (
            <option key={m.id_municipio} value={m.id_municipio}>
              {m.nombre_municipio}
            </option>
          ))}
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
        <button className="btn-black" onClick={cargarDatos}>
          Aplicar Filtros
        </button>
      </div>

      <div style={{ height: '75vh', width: '100%', marginTop: '20px', borderRadius: '8px', overflow: 'hidden' }}>
        <MapaCalor puntos={puntosMapa} />
      </div>
    </div>
  );
}