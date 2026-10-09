import { Navigate } from 'react-router-dom';
import { leerSesion } from '../services/sesion';

/**
 * Restringe el contenido a usuarios con una sesión activa y el rol requerido.
 * Si la sesión falta o el rol no coincide, redirige al login correspondiente
 * y reemplaza la entrada actual del historial de navegación.
 * @param {Object} props
 * @param {'administrador'|'procurador'} props.rol Rol requerido para acceder.
 * @param {import('react').ReactNode} props.children Contenido protegido.
 * @returns {import('react').ReactNode} El contenido o una redirección al login.
 */
export default function ProtectedRoute({ rol, children }) {
  const sesion = leerSesion();
  const login = rol === 'administrador' ? '/login-admin' : '/login-procurador';

  if (!sesion || sesion.rol !== rol) {
    return <Navigate to={login} replace />;
  }

  return children;
}
