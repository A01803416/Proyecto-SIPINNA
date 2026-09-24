import './Hero.css';

export const Hero = () => {
  return (
    <main className="hero-section">
      <div className="content-left">
        <div className="text-wrapper">
          <h1>Registrar<br />Trabajo Infantil</h1>
          <p>
            Si usted vio o quiere registrar a niños en situación de calle trabajando.
          </p>
          <a href="/reporte" className="btn-reporte">Iniciar Reporte</a>
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
};