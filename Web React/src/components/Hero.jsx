import './Hero.css';

/**
 * Presenta la invitación a registrar casos de trabajo infantil y descargar
 * la aplicación, junto con un mockup visual de un teléfono.
 * @returns {import('react').JSX.Element} Sección principal de presentación.
 */
export default function Hero() {
  return (
    <main className="hero-section">
      <div className="content-left">
        <div className="text-wrapper">
          <h1>Registrar<br />Trabajo Infantil</h1>
          <p>
            ¿Viste un caso de trabajo infantil? Descarga la app para reportarlo de forma segura y anónima.
          </p>
        </div>
      </div>

      <div className="content-right">
        <div className="phone-group">
          <div className="phone-mockup">
            <div className="phone-screen"></div>
            <div className="phone-home-btn"></div>
          </div>
          <button className="btn-descarga">Descargar ↓</button>
        </div>
      </div>
    </main>
  );
}