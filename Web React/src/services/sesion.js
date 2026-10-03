const CLAVE = 'rieti_sesion';

// guarda lo que regresa el login: id, rol, correo y municipio
export function guardarSesion(datos) {
  localStorage.setItem(CLAVE, JSON.stringify(datos));
}

export function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE));
  } catch {
    return null;
  }
}

export function borrarSesion()
{
  localStorage.removeItem(CLAVE);
}
