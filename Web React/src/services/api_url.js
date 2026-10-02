import { leerSesion } from './sesion';

export const API_URL = 'http://localhost:3000';

// todos los fetch usan estos headers, si entra un procurador el backend lo identifica por su id
export function encabezados() {
  const headers = { 'Content-Type': 'application/json' };
  const sesion = leerSesion();

  if (sesion && sesion.rol === 'procurador') {
    headers['id-procurador'] = String(sesion.id);
  }

  return headers;
}
