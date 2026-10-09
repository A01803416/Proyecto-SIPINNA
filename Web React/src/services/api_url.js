import { leerSesion } from './sesion';

/** URL base del backend de la aplicación. @type {string} */
export const API_URL = 'http://localhost:8080';

// todos los fetch usan estos headers, si entra un procurador el backend lo identifica por su id
/**
 * Construye los encabezados JSON de las solicitudes al backend.
 * Si la sesión corresponde a un procurador, incluye su identificador en
 * el encabezado `id-procurador`.
 * @returns {Record<string, string>} Encabezados HTTP para las solicitudes.
 */
export function encabezados() {
  const headers = { 'Content-Type': 'application/json' };
  const sesion = leerSesion();

  if (sesion && sesion.rol === 'procurador') {
    headers['id-procurador'] = String(sesion.id);
  }

  return headers;
}
