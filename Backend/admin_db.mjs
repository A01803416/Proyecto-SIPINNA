/**
 * @file Consultas y llamadas a procedures del administrador: reportes,
 * bitácora, duplicados, fusiones, casos, mapa, métricas y altas de
 * municipios, procuradores y administradores. El administrador ve los datos
 * de todos los municipios.
 * @module admin_db
 */

// reportes

/**
 * Obtiene los reportes sueltos de todos los municipios, es decir, los que no
 * están fusionados en un caso; los fusionados se consultan desde los casos.
 * Se ordenan con los de peligro inmediato primero y después del más reciente
 * al más antiguo.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {Object} query Filtros opcionales, tal como llegan en la URL.
 * @param {string} [query.estatus] Solo los reportes con este estatus.
 * @param {string} [query.desde] Solo los registrados desde esta fecha, en formato AAAA-MM-DD.
 * @param {string} [query.hasta] Solo los registrados hasta esta fecha, incluido el día completo.
 * @param {string} [query.nivel_riesgo] Bajo, Medio o Alto.
 * @param {string} [query.peligro_inmediato] "true" o "1" para los que sí tienen
 * peligro inmediato; cualquier otro valor, para los que no.
 * @param {string} [query.posible_duplicado] Igual que peligro_inmediato, pero
 * para la marca de posible duplicado.
 * @param {string} [query.id_municipio] Solo los reportes de este municipio.
 * @returns {Promise<Object[]>} Arreglo de reportes con id_folio_reporte,
 * nombre_municipio, correo_procurador (null si el municipio no tiene
 * procurador), tipo_actividad, estatus, nivel_riesgo, peligro_inmediato,
 * posible_duplicado, fecha_registro e id_caso. peligro_inmediato y
 * posible_duplicado llegan como true o false.
 */
export async function getReportes(connection, query) {
  let sql = `
    SELECT r.id_folio_reporte, m.nombre_municipio, p.correo_procurador,
           r.tipo_actividad, r.estatus, r.nivel_riesgo, r.peligro_inmediato, r.posible_duplicado,
           r.fecha_registro, r.id_caso
    FROM Reporte r
    JOIN Municipio m ON r.id_municipio = m.id_municipio
    LEFT JOIN Procurador p ON r.id_procurador = p.id_procurador
    WHERE r.id_caso IS NULL`;
  const valores = [];

  if (query.estatus) {
    sql += ' AND r.estatus = ?';
    valores.push(query.estatus);
  }
  if (query.desde) {
    sql += ' AND r.fecha_registro >= ?';
    valores.push(query.desde);
  }
  // menor al dia siguiente para que entre todo el dia de hasta
  if (query.hasta) {
    sql += ' AND r.fecha_registro < DATE_ADD(?, INTERVAL 1 DAY)';
    valores.push(query.hasta);
  }
  if (query.nivel_riesgo) {
    sql += ' AND r.nivel_riesgo = ?';
    valores.push(query.nivel_riesgo);
  }
  // en la url llega el texto true o false y la columna guarda 1 o 0
  if (query.peligro_inmediato) {
    sql += ' AND r.peligro_inmediato = ?';
    valores.push(query.peligro_inmediato === 'true' || query.peligro_inmediato === '1' ? 1 : 0);
  }
  if (query.posible_duplicado) {
    sql += ' AND r.posible_duplicado = ?';
    valores.push(query.posible_duplicado === 'true' || query.posible_duplicado === '1' ? 1 : 0);
  }
  if (query.id_municipio) {
    sql += ' AND r.id_municipio = ?';
    valores.push(query.id_municipio);
  }

  sql += ' ORDER BY r.peligro_inmediato DESC, r.fecha_registro DESC';

  const [rows] = await connection.execute(sql, valores);

  // mysql regresa los boolean como 0 y 1, la pagina necesita true y false
  return rows.map((r) => {
    r.peligro_inmediato = r.peligro_inmediato === 1;
    r.posible_duplicado = r.posible_duplicado === 1;
    return r;
  });
}


/**
 * Obtiene el detalle de cualquier reporte, con el nombre de su municipio y el
 * correo de su procurador. No incluye el correo del ciudadano.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {string} folio Folio del reporte.
 * @returns {Promise<Object|null>} Todos los datos del reporte menos el correo
 * del ciudadano, más nombre_municipio y correo_procurador, con
 * peligro_inmediato y posible_duplicado como true o false, o null si el
 * reporte no existe.
 */
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

  const reporte = rows[0];
  reporte.peligro_inmediato = reporte.peligro_inmediato === 1;
  reporte.posible_duplicado = reporte.posible_duplicado === 1;
  return reporte;
}


/**
 * Obtiene las notas de avance de un reporte, de la más reciente a la más
 * antigua. Si el reporte está fusionado en un caso, también trae las notas
 * del caso.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {string} folio Folio del reporte.
 * @returns {Promise<Object[]>} Arreglo de notas con id_avance,
 * descripcion_avance, descripcion_publica, fecha_registro, id_folio_reporte e
 * id_caso.
 */
export async function getNotasReporte(connection, folio) {
  const sql = `
    SELECT n.id_avance, n.descripcion_avance, n.descripcion_publica, n.fecha_registro,
           n.id_folio_reporte, n.id_caso
    FROM Notas_Avance_Reporte n
    JOIN Reporte r ON n.id_folio_reporte = r.id_folio_reporte OR n.id_caso = r.id_caso
    WHERE r.id_folio_reporte = ?
    ORDER BY n.fecha_registro DESC`;
  const [rows] = await connection.execute(sql, [folio]);
  return rows;
}


/**
 * Obtiene la bitácora de un reporte: cada cambio de estatus, municipio,
 * procurador, caso o marca de duplicado, en el orden en que ocurrió.
 * La tabla Entrada no guarda quién hizo el cambio, así que el responsable se
 * reconstruye con los cambios de id_procurador de la misma bitácora: se toma
 * el procurador que tenía asignado el reporte en ese momento, y si nunca
 * cambió, el procurador actual del reporte.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {string} folio Folio del reporte.
 * @returns {Promise<Object[]>} Arreglo de entradas con fecha_cambio,
 * id_folio_reporte, campo_modificado, valor_anterior, valor_nuevo y
 * responsable_en_ese_momento, que es el correo del procurador o null si el
 * reporte no tenía procurador.
 */
export async function getBitacora(connection, folio) {
  const sql = `
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
  const [rows] = await connection.execute(sql, [folio]);
  return rows;
}


/**
 * Obtiene los reportes que algún procurador marcó como posible duplicado,
 * ordenados por municipio, colonia y fecha para que los parecidos queden juntos.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @returns {Promise<Object[]>} Arreglo de reportes con id_folio_reporte,
 * nombre_municipio, colonia, nombre_lugar, tipo_actividad, latitud, longitud,
 * fecha_registro e id_caso.
 */
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


/**
 * Fusiona dos reportes en un caso con el procedure sp_fusionar_reportes.
 * Si ninguno tenía caso, se crea uno nuevo en estatus Registrado con el
 * procurador del municipio como responsable. Si uno ya tenía caso, el otro se
 * suma a ese caso. Los dos reportes toman el estatus del caso, se les apaga la
 * marca de posible duplicado y sus notas pasan al caso.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {string} folio1 Folio del primer reporte.
 * @param {string} folio2 Folio del segundo reporte.
 * @returns {Promise<Object>} Un objeto { id_caso } con el caso donde quedaron
 * los dos reportes.
 * @throws {Error} Error 45000 del procedure: "No se puede fusionar un reporte
 * consigo mismo", "Uno de los folios no existe", "Solo se pueden fusionar
 * reportes del mismo municipio", "No se puede fusionar un reporte cerrado",
 * "Los reportes ya pertenecen al mismo caso" o "Ambos reportes ya pertenecen
 * a casos distintos".
 */
export async function fusionar(connection, folio1, folio2) {
  await connection.query('CALL sp_fusionar_reportes(?, ?)', [folio1 ?? null, folio2 ?? null]);
  const [rows] = await connection.execute(
    'SELECT id_caso FROM Reporte WHERE id_folio_reporte = ?', [folio1]);
  return { id_caso: rows[0].id_caso };
}


// casos

/**
 * Obtiene todos los casos, con su procurador responsable y cuántos reportes
 * tiene cada uno.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @returns {Promise<Object[]>} Arreglo de casos con id_caso, estatus_caso,
 * fecha_creacion, fecha_cierre, responsable (el correo del procurador, o null
 * si no tiene) y total_reportes.
 */
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


/**
 * Obtiene un caso de cualquier municipio.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idCaso Id del caso.
 * @returns {Promise<Object|null>} Un objeto con id_caso, estatus_caso,
 * fecha_creacion, fecha_cierre y total_reportes, o null si el caso no existe.
 */
export async function getCaso(connection, idCaso) {
  const sql = `
    SELECT c.id_caso, c.estatus_caso, c.fecha_creacion, c.fecha_cierre,
           COUNT(r.id_folio_reporte) AS total_reportes
    FROM Casos c
    JOIN Reporte r ON r.id_caso = c.id_caso
    WHERE c.id_caso = ?
    GROUP BY c.id_caso, c.estatus_caso, c.fecha_creacion, c.fecha_cierre`;
  const [rows] = await connection.execute(sql, [idCaso]);
  return rows[0] ?? null;
}


/**
 * Obtiene los reportes que forman un caso.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idCaso Id del caso.
 * @returns {Promise<Object[]>} Arreglo de reportes con id_folio_reporte,
 * tipo_actividad, estatus, nivel_riesgo, peligro_inmediato como true o false,
 * y fecha_registro.
 */
export async function getReportesCaso(connection, idCaso) {
  const sql = `
    SELECT r.id_folio_reporte, r.tipo_actividad, r.estatus, r.nivel_riesgo,
           r.peligro_inmediato, r.fecha_registro
    FROM Reporte r
    JOIN Casos c ON r.id_caso = c.id_caso
    WHERE c.id_caso = ?`;
  const [rows] = await connection.execute(sql, [idCaso]);

  return rows.map((r) => {
    r.peligro_inmediato = r.peligro_inmediato === 1;
    return r;
  });
}


/**
 * Obtiene las notas guardadas en un caso, de la más reciente a la más antigua.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idCaso Id del caso.
 * @returns {Promise<Object[]>} Arreglo de notas con id_avance,
 * descripcion_avance, descripcion_publica y fecha_registro.
 */
export async function getNotasCaso(connection, idCaso) {
  const sql = `
    SELECT n.id_avance, n.descripcion_avance, n.descripcion_publica, n.fecha_registro
    FROM Notas_Avance_Reporte n
    JOIN Casos c ON n.id_caso = c.id_caso
    WHERE c.id_caso = ?
    ORDER BY n.fecha_registro DESC`;
  const [rows] = await connection.execute(sql, [idCaso]);
  return rows;
}


// mapa y metricas

/**
 * Obtiene la ubicación de todos los reportes de todos los municipios para el
 * mapa, incluidos los fusionados.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @returns {Promise<Object[]>} Arreglo de reportes con id_folio_reporte,
 * latitud, longitud, estatus, peligro_inmediato como true o false, y
 * nombre_municipio.
 */
export async function getMapa(connection) {
  const sql = `
    SELECT r.id_folio_reporte, r.latitud, r.longitud, r.estatus, r.peligro_inmediato,
           m.nombre_municipio
    FROM Reporte r
    JOIN Municipio m ON r.id_municipio = m.id_municipio`;
  const [rows] = await connection.execute(sql);

  return rows.map((r) => {
    r.peligro_inmediato = r.peligro_inmediato === 1;
    return r;
  });
}


/**
 * Calcula las métricas de todos los reportes de todos los municipios,
 * incluidos los fusionados.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @returns {Promise<Object>} Un objeto con:
 * total_reportes;
 * reportes_por_municipio, un arreglo de { nombre_municipio, total } que
 * incluye los municipios sin reportes;
 * reportes_por_estatus, un arreglo de { estatus, total };
 * tiempo_promedio_atencion_por_municipio, un arreglo de
 * { nombre_municipio, reportes_cerrados, promedio_horas } donde promedio_horas
 * es el tiempo promedio entre el registro y el cierre, o null si el municipio
 * no tiene reportes cerrados;
 * reportes_nuevos, los que siguen en Registrado;
 * posibles_duplicados;
 * ninos_identificados, la suma de numero_menores;
 * y riesgo_alto, los de nivel de riesgo Alto.
 */
export async function getMetricas(connection) {
  const [filasTotal] = await connection.execute('SELECT COUNT(*) AS total_reportes FROM Reporte');

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

  const [filasConteos] = await connection.execute(`
    SELECT IFNULL(SUM(estatus = 'Registrado'), 0) AS reportes_nuevos,
           IFNULL(SUM(posible_duplicado), 0) AS posibles_duplicados,
           IFNULL(SUM(numero_menores), 0) AS ninos_identificados,
           IFNULL(SUM(nivel_riesgo = 'Alto'), 0) AS riesgo_alto
    FROM Reporte`);

  const conteos = filasConteos[0];

  return {
    total_reportes: filasTotal[0].total_reportes,
    reportes_por_municipio: porMunicipio,
    reportes_por_estatus: porEstatus,
    tiempo_promedio_atencion_por_municipio: tiempoPorMunicipio,
    reportes_nuevos: conteos.reportes_nuevos,
    posibles_duplicados: conteos.posibles_duplicados,
    ninos_identificados: conteos.ninos_identificados,
    riesgo_alto: conteos.riesgo_alto
  };
}


// gestion

/**
 * Obtiene todos los municipios con el procurador asignado a cada uno,
 * ordenados alfabéticamente por nombre.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @returns {Promise<Object[]>} Arreglo de municipios con id_municipio,
 * nombre_municipio, clave_municipio, id_procurador y correo_procurador. Los
 * dos últimos son null si el municipio no tiene procurador.
 */
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


/**
 * Da de alta un municipio con un INSERT directo. La clave se guarda en
 * mayúsculas porque forma parte del folio de sus reportes.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {string} nombre Nombre del municipio.
 * @param {string} clave Clave del municipio, por ejemplo ATZ en el folio
 * RIETI-ATZ-000123.
 * @returns {Promise<Object>} El municipio creado, con id_municipio,
 * nombre_municipio y clave_municipio.
 */
export async function crearMunicipio(connection, nombre, clave) {
  const claveMayusculas = typeof clave === 'string' ? clave.toUpperCase() : null;
  const sql = 'INSERT INTO Municipio (nombre_municipio, clave_municipio) VALUES (?, ?)';
  const [result] = await connection.execute(sql, [nombre ?? null, claveMayusculas]);
  return { id_municipio: result.insertId, nombre_municipio: nombre, clave_municipio: claveMayusculas };
}


/**
 * Obtiene todos los procuradores. Nunca regresa la contraseña.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @returns {Promise<Object[]>} Arreglo de procuradores con id_procurador,
 * correo_procurador e id_municipio (null si no tiene municipio asignado).
 */
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


/**
 * Da de alta un procurador con un INSERT directo, sin municipio. Si viene
 * idMunicipio, después se lo asigna con el procedure
 * sp_asignar_procurador_municipio, para que también reciba los reportes y
 * casos que ya existían en ese municipio. Si la asignación falla, el
 * procurador queda creado sin municipio.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {string} correo Correo del procurador.
 * @param {string} contrasena Contraseña del procurador, se guarda tal cual.
 * @param {number} [idMunicipio] Municipio que se le asigna.
 * @returns {Promise<Object>} El procurador creado, con id_procurador,
 * correo_procurador e id_municipio.
 * @throws {Error} Error 45000 del procedure: "El municipio no existe".
 */
export async function crearProcurador(connection, correo, contrasena, idMunicipio) {
  const sql = 'INSERT INTO Procurador (correo_procurador, contrasena_procurador) VALUES (?, ?)';
  const [result] = await connection.execute(sql, [correo ?? null, contrasena ?? null]);
  const idProcurador = result.insertId;

  if (idMunicipio !== undefined && idMunicipio !== null) {
    await connection.query('CALL sp_asignar_procurador_municipio(?, ?)', [idProcurador, idMunicipio]);
  }
  return await getProcurador(connection, idProcurador);
}


/**
 * Asigna o reasigna un procurador a un municipio con el procedure
 * sp_asignar_procurador_municipio. Si el municipio ya tenía procurador, ese
 * procurador se queda sin municipio. El municipio que deja el procurador se
 * queda sin responsable, y los reportes y casos del municipio nuevo pasan a
 * este procurador.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador.
 * @param {number} idMunicipio Id del municipio que se le asigna.
 * @returns {Promise<Object>} El procurador actualizado, con id_procurador,
 * correo_procurador e id_municipio.
 * @throws {Error} Error 45000 del procedure: "El procurador no existe",
 * "El municipio no existe" o "El procurador ya está asignado a ese municipio".
 */
export async function asignarMunicipio(connection, idProcurador, idMunicipio) {
  await connection.query('CALL sp_asignar_procurador_municipio(?, ?)', [idProcurador, idMunicipio ?? null]);
  return await getProcurador(connection, idProcurador);
}


/**
 * Obtiene todos los administradores. Nunca regresa la contraseña.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @returns {Promise<Object[]>} Arreglo de administradores con
 * id_administrador y correo_administrador.
 */
export async function getAdministradores(connection) {
  const sql = 'SELECT id_administrador, correo_administrador FROM Administrador';
  const [rows] = await connection.execute(sql);
  return rows;
}


/**
 * Da de alta un administrador con un INSERT directo.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {string} correo Correo del administrador.
 * @param {string} contrasena Contraseña del administrador, se guarda tal cual.
 * @returns {Promise<Object>} El administrador creado, con id_administrador y
 * correo_administrador.
 */
export async function crearAdministrador(connection, correo, contrasena) {
  const sql = 'INSERT INTO Administrador (correo_administrador, contrasena_administrador) VALUES (?, ?)';
  const [result] = await connection.execute(sql, [correo ?? null, contrasena ?? null]);
  return { id_administrador: result.insertId, correo_administrador: correo };
}
