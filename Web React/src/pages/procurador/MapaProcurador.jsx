import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import MapaCalor from '../../components/MapaCalor';

export default function MapaProcurador() {
  const [puntosMapa, setPuntosMapa] = useState([]);

  async function cargarPuntosProcurador() {
    try {
      // Endpoint que trae los reportes filtrados para el procurador
      const res = await fetch(`${API_URL}/procurador/mapa`, {
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
        <select defaultValue=""><option>Mi Municipio (Atizapán)</option></select>
        <select defaultValue=""><option>Rango de Edad</option></select>
        <select defaultValue=""><option>Nivel de Riesgo</option></select>
        <select defaultValue=""><option>Estatus</option></select>
        <button className="btn-black">Aplicar Filtros</button>
      </div>

      {/* Contenedor del Mapa de Calor interactivo */}
      <div style={{ height: '75vh', width: '100%', marginTop: '20px', borderRadius: '8px', overflow: 'hidden' }}>
        <MapaCalor puntos={puntosMapa} />
      </div>
    </div>
  );
}