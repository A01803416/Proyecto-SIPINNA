import { Navigate } from 'react-router-dom';
import { leerSesion } from '../services/sesion';

// sin sesion o con otro rol se regresa al login que corresponde a la ruta
export default function ProtectedRoute({ rol, children }) {
  const sesion = leerSesion();
  const login = rol === 'administrador' ? '/login-admin' : '/login-procurador';

  if (!sesion || sesion.rol !== rol) {
    return <Navigate to={login} replace />;
  }

  return children;
}
