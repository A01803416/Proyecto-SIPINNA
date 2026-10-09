import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, encabezados } from '../services/api_url';
import { guardarSesion } from '../services/sesion';
import './Login.css';

/**
 * Renderiza el formulario de acceso para administrador o procurador.
 * @param {Object} props
 * @param {'admin'|'procurador'} props.role Determina el rol autenticado y el panel de destino.
 * @returns {import('react').JSX.Element} Formulario de inicio de sesión.
 */
export default function Login({ role }) {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const isAdmin = role === 'admin';
  const rol = isAdmin ? 'administrador' : 'procurador';

  const title = isAdmin ? 'Admin RIETI' : 'Procurador RIETI';
  const subtitle = isAdmin
    ? 'Panel de Administración Municipal RIETI.'
    : 'Panel de Procuraduría RIETI.';

  /**
   * Envía las credenciales, guarda la sesión y redirige al panel autorizado.
   * @param {import('react').FormEvent<HTMLFormElement>} e Evento de envío del formulario.
   * @returns {Promise<void>}
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: encabezados(),
        body: JSON.stringify({ correo, contrasena, rol })
      });
      const data = await response.json();

      if (response.ok) {
        guardarSesion(data);
        navigate(isAdmin ? '/admin' : '/procurador');
      } else {
        setError(data.message);
      }

    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');

    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-page-container">
      {/* Capa de desenfoque del fondo */}
      <div className="bg-blur-overlay"></div>

      {/* Menú superior */}
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
                <input
                  type="email"
                  className="input-box"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  className="input-box"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                />
              </div>

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="btn-animated btn-submit-large" disabled={cargando}>
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
