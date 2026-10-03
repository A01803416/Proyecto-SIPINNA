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

// con estos estatus el reporte se cierra y el backend pide motivo
export function esCierre(estatus) {
  return estatus === 'Concluido' || estatus === 'Archivado' || estatus === 'Cancelado';
}

export function claseEstatus(estatus) {
  if (estatus === 'Registrado') return 'status-citizen';
  if (estatus === 'Canalizado') return 'status-canalized';
  return 'status-valid';
}

// no hay clase para riesgo bajo, se usa la verde
export function claseRiesgo(nivel) {
  if (nivel === 'Alto') return 'risk-high';
  if (nivel === 'Medio') return 'risk-medium';
  return 'status-valid';
}
