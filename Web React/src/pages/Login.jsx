import './Login.css';

export const Login = ({ role = 'admin' }) => {
  const isAdmin = role === 'admin';

  const title = isAdmin ? 'Admin RIETI' : 'Procurador RIETI';
  const subtitle = isAdmin
    ? 'Panel de Administración Municipal RIETI.'
    : 'Panel de Procuraduría RIETI.';
  const destination = isAdmin ? '/admin' : '/procurador';

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulación de navegación hacia el panel correspondiente
    window.location.href = destination;
  };

  return (
    <div className="login-page-container">
      {/* Capa de desenfoque del fondo */}
      <div className="bg-blur-overlay"></div>

      {/* Menú superior con efecto cristal */}
      <header className="navbar-login">
        <div className="nav-left">
          <span className="logo">RIETI</span>
          <a href="/" className="btn-animated">← Regresar al Inicio</a>
        </div>
      </header>

      {/* Contenedor principal de autenticación */}
      <main className="login-main">
        <div className="auth-container">
          {/* Lado Izquierdo */}
          <div className="auth-left">
            <h2>Bienvenido</h2>
            <p>{subtitle}</p>

            <div className="auth-logo-box">
              <img
                src="/logorieti.jpeg"
                alt="Logo RIETI"
                className="auth-logo-img"
              />
            </div>
          </div>

          {/* Lado Derecho */}
          <div className="auth-right">
            <h3>{title}</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Correo electrónico</label>
                <input type="email" className="input-box" required />
              </div>
              <div className="input-group">
                <label>Contraseña</label>
                <input type="password" className="input-box" required />
              </div>
              <button type="submit" className="btn-animated btn-submit-large">
                Ingresar
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};