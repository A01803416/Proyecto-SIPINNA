import { armarFiltros, convertirBooleanos } from './general_db.mjs';


//nunca se ven reportes de otro municipio

// reportes

// solo reportes sueltos, los fusionados se ven desde casos
export async function getReportes(connection, idProcurador, query) {
  const { condiciones, valores } = armarFiltros(query);
  const sql = `
    SELECT id_folio_reporte, tipo_actividad, estatus, nivel_riesgo, peligro_inmediato,
           posible_duplicado, fecha_registro, id_caso
    FROM Reporte
    WHERE ${['id_procurador = ?', 'id_caso IS NULL', ...condiciones].join(' AND ')}
    ORDER BY peligro_inmediato DESC, fecha_registro DESC`;
  const [rows] = await connection.execute(sql, [idProcurador ?? null, ...valores]);
  return rows.map(convertirBooleanos);
}


// el procurador no debe ver el correo del ciudadano
export async function getReporte(connection, idProcurador, folio) {
  const sql = `
    SELECT r.id_folio_reporte, r.descripcion, r.tipo_actividad, r.edad_aproximada, r.numero_menores,
           r.horario, r.nombre_lugar, r.frecuencia, r.colonia, r.latitud, r.longitud,
           r.estatus, r.peligro_inmediato, r.posible_duplicado, r.nivel_riesgo, r.evidencia_fotografica,
           r.detalles_cierre, r.fecha_registro, r.fecha_cierre, r.id_municipio, r.id_procurador, r.id_caso,
           m.nombre_municipio
    FROM Reporte r
    JOIN Municipio m ON r.id_municipio = m.id_municipio
    WHERE r.id_folio_reporte = ? AND r.id_procurador = ?`;
  const [rows] = await connection.execute(sql, [folio, idProcurador ?? null]);
  if (rows.length === 0) return null;

  // tambien trae las notas del caso si el reporte esta fusionado
  const sqlNotas = `
    SELECT n.id_avance, n.descripcion_avance, n.descripcion_publica, n.fecha_registro,
           n.id_folio_reporte, n.id_caso
    FROM Notas_Avance_Reporte n
    JOIN Reporte r ON n.id_folio_reporte = r.id_folio_reporte OR n.id_caso = r.id_caso
    WHERE r.id_folio_reporte = ? AND r.id_procurador = ?
    ORDER BY n.fecha_registro DESC`;
  const [notas] = await connection.execute(sqlNotas, [folio, idProcurador ?? null]);

  return { ...convertirBooleanos(rows[0]), notas };
}


// procedures

export async function cambiarEstatus(connection, idProcurador, folio, estatus, motivo) {
  const sql = 'CALL sp_cambiar_estatus_reporte(?, ?, ?, ?)';
  await connection.execute(sql, [folio, idProcurador, estatus ?? null, motivo ?? null]);
}


export async function registrarNota(connection, idProcurador, folio, descripcionAvance, descripcionPublica) {
  const sql = 'CALL sp_registrar_nota(?, ?, ?, ?)';
  // una nota publica vacia se guarda como null para que el ciudadano no vea una nota en blanco
  await connection.execute(sql, [folio, idProcurador, descripcionAvance ?? null, descripcionPublica || null]);
}


export async function corregirMunicipio(connection, idProcurador, folio, idMunicipio) {
  const sql = 'CALL sp_corregir_municipio(?, ?, ?)';
  await connection.execute(sql, [folio, idProcurador, idMunicipio ?? null]);
}


export async function marcarDuplicado(connection, idProcurador, folio, valor) {
  const sql = 'CALL sp_marcar_posible_duplicado(?, ?, ?)';
  await connection.execute(sql, [folio, idProcurador, valor ?? null]);
}


// casos

export async function getCasos(connection, idProcurador) {
  const sql = `
    SELECT c.id_caso, c.estatus_caso, c.fecha_creacion, c.fecha_cierre,
           COUNT(r.id_folio_reporte) AS total_reportes
    FROM Casos c
    JOIN Reporte r ON r.id_caso = c.id_caso
    WHERE c.id_procurador_responsable = ?
    GROUP BY c.id_caso, c.estatus_caso, c.fecha_creacion, c.fecha_cierre`;
  const [rows] = await connection.execute(sql, [idProcurador ?? null]);
  return rows;
}


export async function getCaso(connection, idProcurador, idCaso) {
  const sql = `
    SELECT c.id_caso, c.estatus_caso, c.fecha_creacion, c.fecha_cierre,
           COUNT(r.id_folio_reporte) AS total_reportes
    FROM Casos c
    JOIN Reporte r ON r.id_caso = c.id_caso
    WHERE c.id_procurador_responsable = ? AND c.id_caso = ?
    GROUP BY c.id_caso, c.estatus_caso, c.fecha_creacion, c.fecha_cierre`;
  const [rows] = await connection.execute(sql, [idProcurador ?? null, idCaso]);
  if (rows.length === 0) return null;

  const sqlReportes = `
    SELECT r.id_folio_reporte, r.tipo_actividad, r.estatus, r.nivel_riesgo,
           r.peligro_inmediato, r.fecha_registro
    FROM Reporte r
    JOIN Casos c ON r.id_caso = c.id_caso
    WHERE c.id_caso = ? AND c.id_procurador_responsable = ?`;
  const [reportes] = await connection.execute(sqlReportes, [idCaso, idProcurador]);

  const sqlNotas = `
    SELECT n.id_avance, n.descripcion_avance, n.descripcion_publica, n.fecha_registro
    FROM Notas_Avance_Reporte n
    JOIN Casos c ON n.id_caso = c.id_caso
    WHERE c.id_caso = ? AND c.id_procurador_responsable = ?
    ORDER BY n.fecha_registro DESC`;
  const [notas] = await connection.execute(sqlNotas, [idCaso, idProcurador]);

  return { ...rows[0], reportes: reportes.map(convertirBooleanos), notas };
}


// cualquier folio del caso que sea del procurador
// no hay procedures de casos, se llama el del reporte y el trigger actualiza todo el caso
export async function getFolioDeCaso(connection, idProcurador, idCaso) {
  const sql = `
    SELECT r.id_folio_reporte
    FROM Reporte r
    JOIN Casos c ON r.id_caso = c.id_caso
    WHERE c.id_caso = ? AND c.id_procurador_responsable = ? AND r.id_procurador = ?
    LIMIT 1`;
  const [rows] = await connection.execute(sql, [idCaso, idProcurador ?? null, idProcurador ?? null]);
  return rows[0]?.id_folio_reporte ?? null;
}


// mapa y metricas

// aqui si entran los fusionados
export async function getMapa(connection, idProcurador) {
  const sql = `
    SELECT id_folio_reporte, latitud, longitud, estatus, peligro_inmediato
    FROM Reporte
    WHERE id_procurador = ?`;
  const [rows] = await connection.execute(sql, [idProcurador ?? null]);
  return rows.map(convertirBooleanos);
}


export async function getMetricas(connection, idProcurador) {
  const id = idProcurador ?? null;

  const [[total]] = await connection.execute(
    'SELECT COUNT(*) AS total_reportes FROM Reporte WHERE id_procurador = ?', [id]);

  const [porEstatus] = await connection.execute(
    'SELECT estatus, COUNT(*) AS total FROM Reporte WHERE id_procurador = ? GROUP BY estatus', [id]);

  const [[tiempo]] = await connection.execute(`
    SELECT COUNT(*) AS reportes_cerrados,
           ROUND(AVG(TIMESTAMPDIFF(MINUTE, fecha_registro, fecha_cierre)) / 60, 1) AS promedio_horas
    FROM Reporte
    WHERE id_procurador = ? AND fecha_cierre IS NOT NULL`, [id]);

  const [[conteos]] = await connection.execute(`
    SELECT IFNULL(SUM(estatus = 'Registrado'), 0) AS reportes_nuevos,
           IFNULL(SUM(posible_duplicado), 0) AS posibles_duplicados,
           IFNULL(SUM(numero_menores), 0) AS ninos_identificados,
           IFNULL(SUM(nivel_riesgo = 'Alto'), 0) AS riesgo_alto
    FROM Reporte
    WHERE id_procurador = ?`, [id]);

  return {
    total_reportes: total.total_reportes,
    reportes_por_estatus: porEstatus,
    tiempo_promedio_atencion: tiempo,
    ...conteos
  };
}
