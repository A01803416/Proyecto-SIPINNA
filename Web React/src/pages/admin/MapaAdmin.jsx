import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import MapaCalor from '../../components/MapaCalor';

export default function MapaAdmin() {
  const [puntosMapa, setPuntosMapa] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  async function cargarDatos() {
    try {
      // Obtenemos los puntos de calor de la BD
      const resMapa = await fetch(`${API_URL}/admin/mapa`, {
        headers: encabezados()
      });
      const dataMapa = await resMapa.json();
      if (resMapa.ok) {
        setPuntosMapa(dataMapa);
      }

      // Obtenemos lista de los municipios
      const resMunicipios = await fetch(`${API_URL}/municipios`, {
        headers: encabezados()
      });
      const dataMunicipios = await resMunicipios.json();
      if (resMunicipios.ok) {
        setMunicipios(dataMunicipios);
      }
    } catch (err) {
      console.error("Error al conectar con el servidor: ", err);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="full-map-widget">
      <div className="map-filters-full">
        <select defaultValue="">
          <option value="">Todos los Municipios</option>
          {municipios.map((m) => (
            <option key={m.id_municipio} value={m.id_municipio}>
              {m.nombre_municipio}
            </option>
          ))}
        </select>
        <select defaultValue="">
          <option>Rango de Edad</option>
        </select>
        <select defaultValue="">
          <option>Nivel de Riesgo</option>
        </select>
        <select defaultValue="">
          <option>Estatus</option>
        </select>
        <button className="btn-black">Aplicar Filtros</button>
      </div>

      {    }
      <div style={{ height: '75vh', width: '100%', marginTop: '20px', borderRadius: '8px', overflow: 'hidden' }}>
        <MapaCalor puntos={puntosMapa} />
      </div>
    </div>
  );
}