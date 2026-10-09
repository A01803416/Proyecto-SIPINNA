/** Clave usada para almacenar la sesión en `localStorage`. @type {string} */
const CLAVE = 'rieti_sesion';

// guarda lo que regresa el login: id, rol, correo y municipio
/**
 * Serializa y guarda en `localStorage` los datos devueltos por el inicio de sesión.
 * @param {Object} datos Datos de sesión del usuario autenticado.
 * @returns {void}
 */
export function guardarSesion(datos) {
  localStorage.setItem(CLAVE, JSON.stringify(datos));
}

/**
 * Lee y convierte a objeto los datos de sesión almacenados.
 * @returns {Object|null} Datos de sesión, o null si no se pueden interpretar.
 */
export function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE));
  } catch {
    return null;
  }
}

/** Elimina de `localStorage` los datos de la sesión actual. @returns {void} */
export function borrarSesion()
{
  localStorage.removeItem(CLAVE);
}
