export default function MapaProcurador() {
  return (
    <div className="full-map-widget">
      <div className="map-filters-full">
        <select defaultValue="">
          <option>Todos los Municipios</option>
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
      <div className="map-iframe-container-full">
        <iframe
          width="100%"
          height="100%"
          scrolling="no"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-99.28%2C19.53%2C-99.24%2C19.57&amp;layer=mapnik"
          style={{ border: "none" }}
          title="Mapa Completo"
        ></iframe>
      </div>
    </div>
  );
}
