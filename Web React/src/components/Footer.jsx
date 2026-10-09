import './Footer.css';

/**
 * Renderiza el pie de página con un carrusel animado de logotipos municipales.
 * Usa los recursos muni1.png a muni15.png y duplica la secuencia para permitir
 * que la animación CSS la desplace de forma continua.
 * @returns {import('react').JSX.Element} El pie de página con los logotipos.
 */
export default function Footer() {
const municipios = Array.from({ length: 15 }, (_, i) => i + 1);

    return (
    <footer className="footer">
        <p className="footer-title">Alianza con 15 Municipios</p>
    
        <div className="carousel-container">
        <div className="carousel-track">
            {municipios.map((num) => (
            <img key={`muni-${num}`} src={`muni${num}.png`} alt={`Municipio ${num}`} className="carousel-logo" />
            ))}
            {municipios.map((num) => (
            <img key={`muni-dup-${num}`} src={`muni${num}.png`} alt={`Municipio ${num}`} className="carousel-logo" />
            ))}
        </div>
        </div>
    </footer>
    );
}