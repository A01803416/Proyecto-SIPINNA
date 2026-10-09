import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';
import MapaCalor from '../../components/MapaCalor';

/**
 * Vista principal del mapa de calor para el panel del procurador.
 *
 * Este componente obtiene los puntos de reportes desde el backend y los envía al
 * componente de mapa de calor para visualizar la distribución geográfica de incidencias.
 * También renderiza un conjunto de filtros visuales del panel, aunque actualmente se
 * encuentran estáticos y no tienen lógica de filtrado implementada.
 *
 * @returns {JSX.Element} Panel completo con filtros y mapa de calor.
 */
export default function MapaProcurador() {
  const [puntosMapa, setPuntosMapa] = useState([]);

  /**
   * Carga los puntos geográficos que se muestran en el mapa de calor para el procurador.
   *
   * Realiza una petición al endpoint de mapa del procurador usando los encabezados
   * de autenticación configurados en la aplicación y guarda la respuesta en el estado.
   *
   * @async
   * @returns {Promise<void>} Promesa que finaliza cuando los puntos han sido cargados o
   * el error ha sido registrado en consola.
   */
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