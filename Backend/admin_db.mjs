import { armarFiltros, convertirBooleanos } from './general_db.mjs';


// el administrador ve todos los municipios

// reportes

// solo reportes sueltos, los fusionados se ven en casos
export async function getReportes(connection, query) {
  const { condiciones, valores } = armarFiltros(query, 'r.', true);
  const sql = `
    SELECT r.id_folio_reporte, m.nombre_municipio, p.correo_procurador,
           r.tipo_actividad, r.estatus, r.nivel_riesgo, r.peligro_inmediato, r.posible_duplicado,
           r.fecha_registro, r.id_caso
    FROM Reporte r
    JOIN Municipio m ON r.id_municipio = m.id_municipio
    LEFT JOIN Procurador p ON r.id_procurador = p.id_procurador
    WHERE ${['r.id_caso IS NULL', ...condiciones].join(' AND ')}
    ORDER BY r.peligro_inmediato DESC, r.fecha_registro DESC`;
  const [rows] = await connection.execute(sql, valores);
  return rows.map(convertirBooleanos);
}


// detalle con sus notas y su bitacora, sin el correo del ciudadano
export async function getReporte(connection, folio) {
  const sql = `
    SELECT r.id_folio_reporte, r.descripcion, r.tipo_actividad, r.edad_aproximada, r.numero_menores,
           r.horario, r.nombre_lugar, r.frecuencia, r.colonia, r.latitud, r.longitud,
           r.estatus, r.peligro_inmediato, r.posible_duplicado, r.nivel_riesgo, r.evidencia_fotografica,
           r.detalles_cierre, r.fecha_registro, r.fecha_cierre, r.id_municipio, r.id_procurador, r.id_caso,
           m.nombre_municipio, p.correo_procurador
    FROM Reporte r
    JOIN Municipio m ON r.id_municipio = m.id_municipio
    LEFT JOIN Procurador p ON r.id_procurador = p.id_procurador
    WHERE r.id_folio_reporte = ?`;
  const [rows] = await connection.execute(sql, [folio]);
  if (rows.length === 0) return null;

  const sqlNotas = `
    SELECT n.id_avance, n.descripcion_avance, n.descripcion_publica, n.fecha_registro,
           n.id_folio_reporte, n.id_caso
    FROM Notas_Avance_Reporte n
    JOIN Reporte r ON n.id_folio_reporte = r.id_folio_reporte OR n.id_caso = r.id_caso
    WHERE r.id_folio_reporte = ?
    ORDER BY n.fecha_registro DESC`;
  const [notas] = await connection.execute(sqlNotas, [folio]);



  // entrada no guarda autor, el responsable sale con el id dle rpocurador
  const sqlBitacora = `
    SELECT h.fecha_cambio, h.id_folio_reporte, h.campo_modificado, h.valor_anterior, h.valor_nuevo,
           p.correo_procurador AS responsable_en_ese_momento
    FROM (
        SELECT e.id_entrada, e.fecha_cambio, b.id_folio_reporte, e.campo_modificado,
               e.valor_anterior, e.valor_nuevo,
               CASE
                   WHEN EXISTS (SELECT 1 FROM Entrada ea
                                WHERE ea.id_bitacora = e.id_bitacora
                                  AND ea.campo_modificado = 'id_procurador'
                                  AND ea.id_entrada < e.id_entrada)
                   THEN (SELECT ea.valor_nuevo FROM Entrada ea
                         WHERE ea.id_bitacora = e.id_bitacora
                           AND ea.campo_modificado = 'id_procurador'
                           AND ea.id_entrada < e.id_entrada
                         ORDER BY ea.id_entrada DESC LIMIT 1)
                   WHEN EXISTS (SELECT 1 FROM Entrada ed
                                WHERE ed.id_bitacora = e.id_bitacora
                                  AND ed.campo_modificado = 'id_procurador'
                                  AND ed.id_entrada >= e.id_entrada)
                   THEN (SELECT ed.valor_anterior FROM Entrada ed
                         WHERE ed.id_bitacora = e.id_bitacora
                           AND ed.campo_modificado = 'id_procurador'
                           AND ed.id_entrada >= e.id_entrada
                         ORDER BY ed.id_entrada ASC LIMIT 1)
                   ELSE CAST(r.id_procurador AS CHAR)
               END AS id_responsable
        FROM Entrada e
        JOIN Bitacora b ON e.id_bitacora = b.id_bitacora
        JOIN Reporte r ON b.id_folio_reporte = r.id_folio_reporte
    ) h
    LEFT JOIN Procurador p ON p.id_procurador = h.id_responsable
    WHERE h.id_folio_reporte = ?
    ORDER BY h.id_entrada`;
  const [bitacora] = await connection.execute(sqlBitacora, [folio]);

  return { ...convertirBooleanos(rows[0]), notas, bitacora };
}


export async function getDuplicados(connection) {
  const sql = `
    SELECT r.id_folio_reporte, m.nombre_municipio, r.colonia, r.nombre_lugar,
           r.tipo_actividad, r.latitud, r.longitud, r.fecha_registro, r.id_caso
    FROM Reporte r
    JOIN Municipio m ON r.id_municipio = m.id_municipio
    WHERE r.posible_duplicado = TRUE
    ORDER BY m.nombre_municipio, r.colonia, r.fecha_registro`;
  const [rows] = await connection.execute(sql);
  return rows;
}


// regresa el caso donde quedaron los dos reportes
export async function fusionar(connection, folio1, folio2) {
  await connection.execute('CALL sp_fusionar_reportes(?, ?)', [folio1 ?? null, folio2 ?? null]);
  const [rows] = await connection.execute(
    'SELECT id_caso FROM Reporte WHERE id_folio_reporte = ?', [folio1]);
  return { id_caso: rows[0].id_caso };
}


// casos

export async function getCasos(connection) {
  const sql = `
    SELECT c.id_caso, c.estatus_caso, c.fecha_creacion, c.fecha_cierre,
           p.correo_procurador AS responsable,
           COUNT(r.id_folio_reporte) AS total_reportes
    FROM Casos c
    LEFT JOIN Procurador p ON c.id_procurador_responsable = p.id_procurador
    LEFT JOIN Reporte r ON r.id_caso = c.id_caso
    GROUP BY c.id_caso, c.estatus_caso, c.fecha_creacion, c.fecha_cierre, p.correo_procurador`;
  const [rows] = await connection.execute(sql);
  return rows;
}


// las consultas de casos del procurador sin su condicion
export async function getCaso(connection, idCaso) {
  const sql = `
    SELECT c.id_caso, c.estatus_caso, c.fecha_creacion, c.fecha_cierre,
           COUNT(r.id_folio_reporte) AS total_reportes
    FROM Casos c
    JOIN Reporte r ON r.id_caso = c.id_caso
    WHERE c.id_caso = ?
    GROUP BY c.id_caso, c.estatus_caso, c.fecha_creacion, c.fecha_cierre`;
  const [rows] = await connection.execute(sql, [idCaso]);
  if (rows.length === 0) return null;

  const sqlReportes = `
    SELECT r.id_folio_reporte, r.tipo_actividad, r.estatus, r.nivel_riesgo,
           r.peligro_inmediato, r.fecha_registro
    FROM Reporte r
    JOIN Casos c ON r.id_caso = c.id_caso
    WHERE c.id_caso = ?`;
  const [reportes] = await connection.execute(sqlReportes, [idCaso]);

  const sqlNotas = `
    SELECT n.id_avance, n.descripcion_avance, n.descripcion_publica, n.fecha_registro
    FROM Notas_Avance_Reporte n
    JOIN Casos c ON n.id_caso = c.id_caso
    WHERE c.id_caso = ?
    ORDER BY n.fecha_registro DESC`;
  const [notas] = await connection.execute(sqlNotas, [idCaso]);

  return { ...rows[0], reportes: reportes.map(convertirBooleanos), notas };
}


// mapa y metricas

export async function getMapa(connection) {
  const sql = `
    SELECT r.id_folio_reporte, r.latitud, r.longitud, r.estatus, r.peligro_inmediato,
           m.nombre_municipio
    FROM Reporte r
    JOIN Municipio m ON r.id_municipio = m.id_municipio`;
  const [rows] = await connection.execute(sql);
  return rows.map(convertirBooleanos);
}


export async function getMetricas(connection) {
  const [[total]] = await connection.execute('SELECT COUNT(*) AS total_reportes FROM Reporte');

  const [porMunicipio] = await connection.execute(`
    SELECT m.nombre_municipio, COUNT(r.id_folio_reporte) AS total
    FROM Municipio m
    LEFT JOIN Reporte r ON r.id_municipio = m.id_municipio
    GROUP BY m.id_municipio, m.nombre_municipio`);

  const [porEstatus] = await connection.execute(
    'SELECT estatus, COUNT(*) AS total FROM Reporte GROUP BY estatus');

  const [tiempoPorMunicipio] = await connection.execute(`
    SELECT m.nombre_municipio,
           COUNT(r.fecha_cierre) AS reportes_cerrados,
           ROUND(AVG(TIMESTAMPDIFF(MINUTE, r.fecha_registro, r.fecha_cierre)) / 60, 1) AS promedio_horas
    FROM Municipio m
    LEFT JOIN Reporte r ON r.id_municipio = m.id_municipio
    GROUP BY m.id_municipio, m.nombre_municipio`);

  const [[conteos]] = await connection.execute(`
    SELECT IFNULL(SUM(estatus = 'Registrado'), 0) AS reportes_nuevos,
           IFNULL(SUM(posible_duplicado), 0) AS posibles_duplicados,
           IFNULL(SUM(numero_menores), 0) AS ninos_identificados,
           IFNULL(SUM(nivel_riesgo = 'Alto'), 0) AS riesgo_alto
    FROM Reporte`);

  return {
    total_reportes: total.total_reportes,
    reportes_por_municipio: porMunicipio,
    reportes_por_estatus: porEstatus,
    tiempo_promedio_atencion_por_municipio: tiempoPorMunicipio,
    ...conteos
  };
}


// gestion

export async function getMunicipios(connection) {
  const sql = `
    SELECT m.id_municipio, m.nombre_municipio, m.clave_municipio,
           p.id_procurador, p.correo_procurador
    FROM Municipio m
    LEFT JOIN Procurador p ON p.id_municipio = m.id_municipio
    ORDER BY m.nombre_municipio`;
  const [rows] = await connection.execute(sql);
  return rows;
}


// la clave se guarda en mayusculas porque forma el folio
export async function crearMunicipio(connection, nombre, clave) {
  const claveMayusculas = typeof clave === 'string' ? clave.toUpperCase() : null;
  const sql = 'INSERT INTO Municipio (nombre_municipio, clave_municipio) VALUES (?, ?)';
  const [result] = await connection.execute(sql, [nombre ?? null, claveMayusculas]);
  return { id_municipio: result.insertId, nombre_municipio: nombre, clave_municipio: claveMayusculas };
}


export async function getProcuradores(connection) {
  const sql = 'SELECT id_procurador, correo_procurador, id_municipio FROM Procurador';
  const [rows] = await connection.execute(sql);
  return rows;
}


async function getProcurador(connection, idProcurador) {
  const sql = 'SELECT id_procurador, correo_procurador, id_municipio FROM Procurador WHERE id_procurador = ?';
  const [rows] = await connection.execute(sql, [idProcurador]);
  return rows[0] ?? null;
}


// primero se crea sin municipio y luego se asigna con el procedure
// asi le pasan los reportes y casos que ya existian en ese municipio
export async function crearProcurador(connection, correo, contrasena, idMunicipio) {
  const sql = 'INSERT INTO Procurador (correo_procurador, contrasena_procurador) VALUES (?, ?)';
  const [result] = await connection.execute(sql, [correo ?? null, contrasena ?? null]);
  const idProcurador = result.insertId;

  if (idMunicipio !== undefined && idMunicipio !== null) {
    await connection.execute('CALL sp_asignar_procurador_municipio(?, ?)', [idProcurador, idMunicipio]);
  }
  return await getProcurador(connection, idProcurador);
}


export async function asignarMunicipio(connection, idProcurador, idMunicipio) {
  await connection.execute('CALL sp_asignar_procurador_municipio(?, ?)', [idProcurador, idMunicipio ?? null]);
  return await getProcurador(connection, idProcurador);
}


export async function getAdministradores(connection) {
  const sql = 'SELECT id_administrador, correo_administrador FROM Administrador';
  const [rows] = await connection.execute(sql);
  return rows;
}


export async function crearAdministrador(connection, correo, contrasena) {
  const sql = 'INSERT INTO Administrador (correo_administrador, contrasena_administrador) VALUES (?, ?)';
  const [result] = await connection.execute(sql, [correo ?? null, contrasena ?? null]);
  return { id_administrador: result.insertId, correo_administrador: correo };
}
