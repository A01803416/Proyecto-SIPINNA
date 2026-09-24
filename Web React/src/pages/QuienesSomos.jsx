import './QuienesSomos.css';

export const QuienesSomos = () => {
  return (
    <div className="about-page-container">
      {/* Capa de desenfoque de fondo */}
      <div className="bg-blur-overlay"></div>

      {/* Barra de navegación superior */}
      <header className="navbar-about">
        <div className="nav-left">
          <span className="logo">RIETI</span>
          <a href="/" className="btn-animated">← Regresar al Inicio</a>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="about-section">
        {/* Tarjeta izquierda: Información y misión */}
        <section className="about-card-left">
          <div className="about-header">
            <h1>¿Quiénes Somos?</h1>
          </div>
          <div className="about-text">
            <h2>Nuestra Misión</h2>
            <p>
              El Registro e Identificación Estratégica del Trabajo Infantil (RIETI) es una plataforma diseñada para coordinar esfuerzos municipales e institucionales en la detección, atención y erradicación del trabajo infantil en el Estado de México.
            </p>

            <h2>Colaboración Intermunicipal</h2>
            <p>
              En alianza con los municipios participantes y el Sistema de Protección Integral de Niñas, Niños y Adolescentes (SIPINNA), canalizamos reportes de manera ágil hacia las procuradurías municipales correspondientes para garantizar la restitución de sus derechos.
            </p>

            <h2>Compromiso Ciudadano</h2>
            <p>
              Fomentamos la participación de la sociedad facilitando un canal confidencial y seguro para reportar situaciones de riesgo en vía pública o establecimientos, protegiendo siempre la integridad y privacidad de la niñez.
            </p>
          </div>
        </section>

        {/* Tarjeta derecha: Logo institucional */}
        <section className="about-card-right">
          <img
            src="/logorieti.jpeg"
            alt="Logo RIETI"
            className="about-logo-small"
          />
        </section>
      </main>
    </div>
  );
};