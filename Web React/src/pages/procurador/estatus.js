/**
 * Valores de estatus permitidos para los reportes y casos de Procuraduría.
 * @type {string[]}
 */
export const ESTATUS = [
  'Registrado',
  'En revisión',
  'En seguimiento',
  'Canalizado',
  'Concluido',
  'Archivado',
  'Cancelado',
  'Reincidente'
];

/**
 * Indica si el estatus seleccionado cierra el reporte o caso.
 * El backend requiere un motivo para estos estatus.
 * @param {string} estatus Estatus que se va a evaluar.
 * @returns {boolean} `true` si el estatus es de cierre.
 */
export function esCierre(estatus) {
  return estatus === 'Concluido' || estatus === 'Archivado' || estatus === 'Cancelado';
}

/**
 * Obtiene la clase CSS asociada al estatus para mostrar su indicador visual.
 * @param {string} estatus Estatus que se va a representar.
 * @returns {string} Nombre de la clase CSS aplicable.
 */
export function claseEstatus(estatus) {
  if (estatus === 'Registrado') return 'status-citizen';
  if (estatus === 'Canalizado') return 'status-canalized';
  return 'status-valid';
}

/**
 * Obtiene la clase CSS asociada al nivel de riesgo.
 * El nivel bajo y los valores no reconocidos usan la clase verde general.
 * @param {string} nivel Nivel de riesgo que se va a representar.
 * @returns {string} Nombre de la clase CSS aplicable.
 */
export function claseRiesgo(nivel) {
  if (nivel === 'Alto') return 'risk-high';
  if (nivel === 'Medio') return 'risk-medium';
  return 'status-valid';
}
