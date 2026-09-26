import './Footer.css';

export const Footer = () =>{
  // Creamos un arreglo del 1 al 15 para cargar las imágenes de los mnunicipios dinámicamente
const municipios = Array.from({ length: 15 }, (_, i) => i + 1);

    return (
    <footer className="footer">
        <p className="footer-title">Alianza con 15 Municipios</p>
    
        <div className="carousel-container">
        <div className="carousel-track">
          {/* Primer set de 16 logos municipales */}
            {municipios.map((num) => (
            <img key={`muni-${num}`} src={`muni${num}.png`} alt={`Municipio ${num}`} className="carousel-logo" />
            ))}
          {/* Segundo set duplicado para el loop infinito de los logos municipales */}
            {municipios.map((num) => (
            <img key={`muni-dup-${num}`} src={`muni${num}.png`} alt={`Municipio ${num}`} className="carousel-logo" />
            ))}
        </div>
        </div>
    </footer>
    );
};