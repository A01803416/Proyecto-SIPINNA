import './QuienesSomos.css';

/**
 * Presenta la misión, la colaboración intermunicipal y el compromiso ciudadano
 * de RIETI, junto con su logotipo institucional.
 * @returns {import('react').JSX.Element} Página informativa de RIETI.
 */
export default function QuienesSomos() {
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
            <h2>¿Qué es RIETI?</h2>
            <p>
              La Ruta Intermunicipal para la Erradicación del Trabajo Infantil (RIETI) es una iniciativa impulsada por el Sistema de Protección Integral de Niñas, Niños y Adolescentes (SIPINNA) de Atizapán de Zaragoza, en alianza con 15 municipios del Estado de México. Esta plataforma apoya su labor, permitiendo que la ciudadanía reporte posibles casos de trabajo infantil y que las autoridades municipales les den seguimiento.
            </p>

            <h2>Colaboración Intermunicipal</h2>
            <p>
              Cada reporte se dirige a la procuraduría del municipio donde ocurre, para que pueda atenderlo, registrar su avance y, cuando corresponda, canalizarlo a otras instituciones. Los municipios participantes son Atizapán de Zaragoza, Naucalpan de Juárez, Tlalnepantla de Baz, Cuautitlán Izcalli, Villa del Carbón, Nicolás Romero, Isidro Fabela, Huixquilucan, Tepotzotlán, Teoloyucan, Cuautitlán, Jilotzingo, Ecatepec, Tultitlán y Melchor Ocampo.
            </p>

            <h2>Participación Ciudadana</h2>
            <p>
              Cualquier persona puede reportar desde la aplicación móvil una situación en la que vea a niñas, niños o adolescentes trabajando, ya sea en la vía pública o en un establecimiento. El reporte puede hacerse de forma anónima o con seguimiento, para consultar después su avance. Para proteger su identidad, pedimos no fotografiar a las niñas, niños o adolescentes.
            </p>
          </div>
        </section>

        {/* Tarjeta derecha: Logo institucional */}
        <section className="about-card-right">
          <img
            src="/Logo_RIETI_sin_fondo.png"
            alt="Logo RIETI"
            className="about-logo-small"
          />
        </section>
      </main>
    </div>
  );
}