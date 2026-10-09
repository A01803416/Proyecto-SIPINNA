/**
 * @file Consultas y llamadas a procedures del procurador: reportes, casos,
 * mapa y métricas. Todas filtran por el id del procurador, así que nunca
 * regresan datos de otro municipio.
 * @module procurador_db
 */

// reportes

/**
 * Obtiene los reportes sueltos del procurador, es decir, los que no están
 * fusionados en un caso; los fusionados se consultan desde los casos.
 * Se ordenan con los de peligro inmediato primero y después del más reciente
 * al más antiguo.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que consulta.
 * @param {Object} query Filtros opcionales, tal como llegan en la URL.
 * @param {string} [query.estatus] Solo los reportes con este estatus.
 * @param {string} [query.desde] Solo los registrados desde esta fecha, en formato AAAA-MM-DD.
 * @param {string} [query.hasta] Solo los registrados hasta esta fecha, incluido el día completo.
 * @param {string} [query.nivel_riesgo] Bajo, Medio o Alto.
 * @param {string} [query.peligro_inmediato] "true" o "1" para los que sí tienen
 * peligro inmediato; cualquier otro valor, para los que no.
 * @param {string} [query.posible_duplicado] Igual que peligro_inmediato, pero
 * para la marca de posible duplicado.
 * @returns {Promise<Object[]>} Arreglo de reportes con id_folio_reporte,
 * tipo_actividad, estatus, nivel_riesgo, peligro_inmediato, posible_duplicado,
 * fecha_registro e id_caso. peligro_inmediato y posible_duplicado llegan como
 * true o false.
 */
export async function getReportes(connection, idProcurador, query) {
  let sql = `
    SELECT id_folio_reporte, tipo_actividad, estatus, nivel_riesgo, peligro_inmediato,
           posible_duplicado, fecha_registro, id_caso
    FROM Reporte
    WHERE id_procurador = ? AND id_caso IS NULL`;
  const valores = [idProcurador ?? null];

  if (query.estatus) {
    sql += ' AND estatus = ?';
    valores.push(query.estatus);
  }
  if (query.desde) {
    sql += ' AND fecha_registro >= ?';
    valores.push(query.desde);
  }
  // menor al dia siguiente para que entre todo el dia de hasta
  if (query.hasta) {
    sql += ' AND fecha_registro < DATE_ADD(?, INTERVAL 1 DAY)';
    valores.push(query.hasta);
  }
  if (query.nivel_riesgo) {
    sql += ' AND nivel_riesgo = ?';
    valores.push(query.nivel_riesgo);
  }
  // en la url llega el texto true o false y la columna guarda 1 o 0
  if (query.peligro_inmediato) {
    sql += ' AND peligro_inmediato = ?';
    valores.push(query.peligro_inmediato === 'true' || query.peligro_inmediato === '1' ? 1 : 0);
  }
  if (query.posible_duplicado) {
    sql += ' AND posible_duplicado = ?';
    valores.push(query.posible_duplicado === 'true' || query.posible_duplicado === '1' ? 1 : 0);
  }

  sql += ' ORDER BY peligro_inmediato DESC, fecha_registro DESC';

  const [rows] = await connection.execute(sql, valores);

  // mysql regresa los boolean como 0 y 1, la pagina necesita true y false
  return rows.map((r) => {
    r.peligro_inmediato = r.peligro_inmediato === 1;
    r.posible_duplicado = r.posible_duplicado === 1;
    return r;
  });
}


/**
 * Obtiene el detalle de un reporte del procurador, con el nombre de su
 * municipio. No incluye el correo del ciudadano. Las rutas de escritura
 * también la usan para revisar que el reporte sea del procurador antes de
 * llamar a un procedure.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que consulta.
 * @param {string} folio Folio del reporte.
 * @returns {Promise<Object|null>} Todos los datos del reporte menos el correo,
 * con peligro_inmediato y posible_duplicado como true o false, o null si el
 * reporte no existe o es de otro procurador.
 */
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

  const reporte = rows[0];
  reporte.peligro_inmediato = reporte.peligro_inmediato === 1;
  reporte.posible_duplicado = reporte.posible_duplicado === 1;
  return reporte;
}


/**
 * Obtiene las notas de avance de un reporte del procurador, de la más reciente
 * a la más antigua. Si el reporte está fusionado en un caso, también trae las
 * notas del caso.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que consulta.
 * @param {string} folio Folio del reporte.
 * @returns {Promise<Object[]>} Arreglo de notas con id_avance,
 * descripcion_avance, descripcion_publica, fecha_registro, id_folio_reporte e
 * id_caso. Vacío si el reporte no tiene notas o es de otro procurador.
 */
export async function getNotasReporte(connection, idProcurador, folio) {
  const sql = `
    SELECT n.id_avance, n.descripcion_avance, n.descripcion_publica, n.fecha_registro,
           n.id_folio_reporte, n.id_caso
    FROM Notas_Avance_Reporte n
    JOIN Reporte r ON n.id_folio_reporte = r.id_folio_reporte OR n.id_caso = r.id_caso
    WHERE r.id_folio_reporte = ? AND r.id_procurador = ?
    ORDER BY n.fecha_registro DESC`;
  const [rows] = await connection.execute(sql, [folio, idProcurador ?? null]);
  return rows;
}


// procedures

/**
 * Cambia el estatus de un reporte con el procedure sp_cambiar_estatus_reporte.
 * Sirve para cambiar de estatus, cerrar y reabrir. Cerrar es pasar a un
 * estatus final (Concluido, Archivado o Cancelado) y exige el motivo. Si el
 * reporte está fusionado en un caso, el cambio se aplica a todo el caso.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que hace el cambio.
 * @param {string} folio Folio del reporte.
 * @param {string} estatus Estatus nuevo, escrito igual que en el catálogo
 * oficial, por ejemplo En revisión.
 * @param {string} [motivo] Motivo de cierre. Solo se guarda si el estatus nuevo es final.
 * @returns {Promise<void>}
 * @throws {Error} Error 45000 del procedure: "El reporte no existe",
 * "El reporte no pertenece al municipio de este procurador",
 * "El estatus no pertenece al catálogo oficial", "El reporte ya tiene ese
 * estatus" o "Para cerrar un reporte se requiere el motivo de cierre".
 */
export async function cambiarEstatus(connection, idProcurador, folio, estatus, motivo) {
  const sql = 'CALL sp_cambiar_estatus_reporte(?, ?, ?, ?)';
  await connection.query(sql, [folio, idProcurador, estatus ?? null, motivo ?? null]);
}


/**
 * Registra una nota de avance con el procedure sp_registrar_nota. Si el
 * reporte está fusionado en un caso, la nota se guarda en el caso.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que escribe la nota.
 * @param {string} folio Folio del reporte.
 * @param {string} descripcionAvance Nota interna, solo la ve el personal.
 * @param {string} [descripcionPublica] Nota que puede ver el ciudadano. Si
 * llega vacía se guarda como null.
 * @returns {Promise<void>}
 * @throws {Error} Error 45000 del procedure: "El reporte no existe",
 * "El reporte no pertenece al municipio de este procurador" o
 * "La nota de avance no puede estar vacía".
 */
export async function registrarNota(connection, idProcurador, folio, descripcionAvance, descripcionPublica) {
  const sql = 'CALL sp_registrar_nota(?, ?, ?, ?)';
  // una nota publica vacia se guarda como null para que el ciudadano no vea una nota en blanco
  await connection.query(sql, [folio, idProcurador, descripcionAvance ?? null, descripcionPublica || null]);
}


/**
 * Cambia el municipio de un reporte mal catalogado con el procedure
 * sp_corregir_municipio. El reporte pasa al procurador del municipio nuevo,
 * o queda sin procurador si ese municipio no tiene uno. El folio no cambia.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que hace la corrección.
 * @param {string} folio Folio del reporte.
 * @param {number} idMunicipio Id del municipio correcto.
 * @returns {Promise<void>}
 * @throws {Error} Error 45000 del procedure: "El reporte no existe",
 * "El reporte no pertenece al municipio de este procurador",
 * "El municipio nuevo no existe", "El reporte ya pertenece a ese municipio" o
 * "No se puede corregir el municipio de un reporte fusionado en un caso".
 */
export async function corregirMunicipio(connection, idProcurador, folio, idMunicipio) {
  const sql = 'CALL sp_corregir_municipio(?, ?, ?)';
  await connection.query(sql, [folio, idProcurador, idMunicipio ?? null]);
}


/**
 * Prende o apaga la marca de posible duplicado de un reporte con el procedure
 * sp_marcar_posible_duplicado. La marca le avisa al administrador que revise
 * si debe fusionarlo.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que hace el cambio.
 * @param {string} folio Folio del reporte.
 * @param {boolean} valor true para marcarlo, false para desmarcarlo.
 * @returns {Promise<void>}
 * @throws {Error} Error 45000 del procedure: "El reporte no existe",
 * "El reporte no pertenece al municipio de este procurador",
 * "Se debe indicar si se marca o se desmarca el reporte",
 * "El reporte ya tiene ese valor de posible duplicado",
 * "El reporte ya pertenece a un caso fusionado" o
 * "No se puede marcar como duplicado un reporte cerrado".
 */
export async function marcarDuplicado(connection, idProcurador, folio, valor) {
  const sql = 'CALL sp_marcar_posible_duplicado(?, ?, ?)';
  await connection.query(sql, [folio, idProcurador, valor ?? null]);
}


// casos

/**
 * Obtiene los casos de los que el procurador es responsable, con cuántos
 * reportes tiene cada uno.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que consulta.
 * @returns {Promise<Object[]>} Arreglo de casos con id_caso, estatus_caso,
 * fecha_creacion, fecha_cierre y total_reportes.
 */
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


/**
 * Obtiene un caso del que el procurador es responsable.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que consulta.
 * @param {number|string} idCaso Id del caso.
 * @returns {Promise<Object|null>} Un objeto con id_caso, estatus_caso,
 * fecha_creacion, fecha_cierre y total_reportes, o null si el caso no existe
 * o es de otro procurador.
 */
export async function getCaso(connection, idProcurador, idCaso) {
  const sql = `
    SELECT c.id_caso, c.estatus_caso, c.fecha_creacion, c.fecha_cierre,
           COUNT(r.id_folio_reporte) AS total_reportes
    FROM Casos c
    JOIN Reporte r ON r.id_caso = c.id_caso
    WHERE c.id_procurador_responsable = ? AND c.id_caso = ?
    GROUP BY c.id_caso, c.estatus_caso, c.fecha_creacion, c.fecha_cierre`;
  const [rows] = await connection.execute(sql, [idProcurador ?? null, idCaso]);
  return rows[0] ?? null;
}


/**
 * Obtiene los reportes que forman un caso del procurador.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que consulta.
 * @param {number|string} idCaso Id del caso.
 * @returns {Promise<Object[]>} Arreglo de reportes con id_folio_reporte,
 * tipo_actividad, estatus, nivel_riesgo, peligro_inmediato como true o false,
 * y fecha_registro. Vacío si el caso es de otro procurador.
 */
export async function getReportesCaso(connection, idProcurador, idCaso) {
  const sql = `
    SELECT r.id_folio_reporte, r.tipo_actividad, r.estatus, r.nivel_riesgo,
           r.peligro_inmediato, r.fecha_registro
    FROM Reporte r
    JOIN Casos c ON r.id_caso = c.id_caso
    WHERE c.id_caso = ? AND c.id_procurador_responsable = ?`;
  const [rows] = await connection.execute(sql, [idCaso, idProcurador]);

  return rows.map((r) => {
    r.peligro_inmediato = r.peligro_inmediato === 1;
    return r;
  });
}


/**
 * Obtiene las notas guardadas en un caso del procurador, de la más reciente a
 * la más antigua.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que consulta.
 * @param {number|string} idCaso Id del caso.
 * @returns {Promise<Object[]>} Arreglo de notas con id_avance,
 * descripcion_avance, descripcion_publica y fecha_registro. Vacío si el caso
 * no tiene notas o es de otro procurador.
 */
export async function getNotasCaso(connection, idProcurador, idCaso) {
  const sql = `
    SELECT n.id_avance, n.descripcion_avance, n.descripcion_publica, n.fecha_registro
    FROM Notas_Avance_Reporte n
    JOIN Casos c ON n.id_caso = c.id_caso
    WHERE c.id_caso = ? AND c.id_procurador_responsable = ?
    ORDER BY n.fecha_registro DESC`;
  const [rows] = await connection.execute(sql, [idCaso, idProcurador]);
  return rows;
}


/**
 * Obtiene el folio de cualquier reporte de un caso del procurador. No hay
 * procedures de casos: para cambiar el estatus de un caso o agregarle una
 * nota se llama al procedure del reporte con este folio, y como el reporte
 * está fusionado, el cambio se aplica a todo el caso.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que consulta.
 * @param {number|string} idCaso Id del caso.
 * @returns {Promise<string|null>} El folio de uno de los reportes del caso, o
 * null si el caso no existe o es de otro procurador.
 */
export async function getFolioDeCaso(connection, idProcurador, idCaso) {
  const sql = `
    SELECT r.id_folio_reporte
    FROM Reporte r
    JOIN Casos c ON r.id_caso = c.id_caso
    WHERE c.id_caso = ? AND c.id_procurador_responsable = ? AND r.id_procurador = ?
    LIMIT 1`;
  const [rows] = await connection.execute(sql, [idCaso, idProcurador ?? null, idProcurador ?? null]);
  return rows.length > 0 ? rows[0].id_folio_reporte : null;
}


// mapa y metricas

/**
 * Obtiene la ubicación de todos los reportes del procurador para el mapa.
 * A diferencia del listado, aquí sí se incluyen los reportes fusionados.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que consulta.
 * @returns {Promise<Object[]>} Arreglo de reportes con id_folio_reporte,
 * latitud, longitud, estatus y peligro_inmediato como true o false.
 */
export async function getMapa(connection, idProcurador) {
  const sql = `
    SELECT id_folio_reporte, latitud, longitud, estatus, peligro_inmediato
    FROM Reporte
    WHERE id_procurador = ?`;
  const [rows] = await connection.execute(sql, [idProcurador ?? null]);

  return rows.map((r) => {
    r.peligro_inmediato = r.peligro_inmediato === 1;
    return r;
  });
}


/**
 * Calcula las métricas de todos los reportes del procurador, incluidos los
 * fusionados.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {number|string} idProcurador Id del procurador que consulta.
 * @returns {Promise<Object>} Un objeto con:
 * total_reportes;
 * reportes_por_estatus, un arreglo de { estatus, total };
 * tiempo_promedio_atencion, un objeto { reportes_cerrados, promedio_horas }
 * donde promedio_horas es el tiempo promedio entre el registro y el cierre,
 * o null si no hay reportes cerrados;
 * reportes_nuevos, los que siguen en Registrado;
 * posibles_duplicados;
 * ninos_identificados, la suma de numero_menores;
 * y riesgo_alto, los de nivel de riesgo Alto.
 */
export async function getMetricas(connection, idProcurador) {
  const id = idProcurador ?? null;

  const [filasTotal] = await connection.execute(
    'SELECT COUNT(*) AS total_reportes FROM Reporte WHERE id_procurador = ?', [id]);

  const [porEstatus] = await connection.execute(
    'SELECT estatus, COUNT(*) AS total FROM Reporte WHERE id_procurador = ? GROUP BY estatus', [id]);

  const [filasTiempo] = await connection.execute(`
    SELECT COUNT(*) AS reportes_cerrados,
           ROUND(AVG(TIMESTAMPDIFF(MINUTE, fecha_registro, fecha_cierre)) / 60, 1) AS promedio_horas
    FROM Reporte
    WHERE id_procurador = ? AND fecha_cierre IS NOT NULL`, [id]);

  const [filasConteos] = await connection.execute(`
    SELECT IFNULL(SUM(estatus = 'Registrado'), 0) AS reportes_nuevos,
           IFNULL(SUM(posible_duplicado), 0) AS posibles_duplicados,
           IFNULL(SUM(numero_menores), 0) AS ninos_identificados,
           IFNULL(SUM(nivel_riesgo = 'Alto'), 0) AS riesgo_alto
    FROM Reporte
    WHERE id_procurador = ?`, [id]);

  const conteos = filasConteos[0];

  return {
    total_reportes: filasTotal[0].total_reportes,
    reportes_por_estatus: porEstatus,
    tiempo_promedio_atencion: filasTiempo[0],
    reportes_nuevos: conteos.reportes_nuevos,
    posibles_duplicados: conteos.posibles_duplicados,
    ninos_identificados: conteos.ninos_identificados,
    riesgo_alto: conteos.riesgo_alto
  };
}
