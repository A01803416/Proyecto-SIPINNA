/**
 * @file Consultas de la app móvil del ciudadano: consultar el estado de un
 * reporte y registrar un reporte nuevo.
 * @module app_db
 */

/**
 * Busca un reporte por su folio y el correo con el que se registró. Se piden
 * los dos juntos para que nadie pueda ver reportes ajenos; los reportes
 * anónimos no tienen correo y por eso nunca se encuentran.
 * Además trae la nota pública más reciente del reporte. Si el reporte ya está
 * fusionado en un caso, también se toman en cuenta las notas del caso.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {string} folio Folio del reporte, por ejemplo RIETI-ATZ-000001.
 * @param {string} correo Correo con el que se registró el reporte.
 * @returns {Promise<Object|null>} Un objeto con id_folio_reporte, estatus,
 * fecha_registro y ultima_nota_publica (null si no hay ninguna nota pública),
 * o null si no existe un reporte con ese folio y ese correo.
 */
export async function consultarReporte(connection, folio, correo) {
  const sql = `
    SELECT r.id_folio_reporte, r.estatus, r.fecha_registro,
           (SELECT n.descripcion_publica
            FROM Notas_Avance_Reporte n
            WHERE (n.id_folio_reporte = r.id_folio_reporte OR n.id_caso = r.id_caso)
              AND n.descripcion_publica IS NOT NULL
            ORDER BY n.fecha_registro DESC
            LIMIT 1) AS ultima_nota_publica
    FROM Reporte r
    WHERE r.id_folio_reporte = ? AND r.correo = ?`;
  const [rows] = await connection.execute(sql, [folio ?? null, correo ?? null]);
  return rows[0] ?? null;
}


/**
 * Registra un reporte nuevo con el procedure sp_registrar_reporte y regresa
 * el folio que generó. El procedure deja el folio en la variable @folio, que
 * se lee después con SELECT @folio en la misma conexión.
 * El procedure guarda el reporte con estatus Registrado, se lo asigna al
 * procurador del municipio, guarda el correo en minúsculas y sin espacios
 * (vacío se guarda como NULL) y toma peligro_inmediato como FALSE si llega
 * nulo. Los campos que no vienen en datos se mandan como NULL.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {Object} datos Datos del reporte, tal como llegan en el cuerpo de la petición.
 * @param {string} datos.descripcion Descripción de lo que se observó.
 * @param {string} datos.tipo_actividad Tipo de actividad, por ejemplo Venta de dulces.
 * @param {string} datos.edad_aproximada Edad aproximada, por ejemplo "9".
 * @param {number} datos.numero_menores Número de menores involucrados.
 * @param {string} datos.horario Horario en que ocurre.
 * @param {string} [datos.nombre_lugar] Nombre o referencia del lugar.
 * @param {string} datos.frecuencia Frecuencia con que ocurre.
 * @param {string} [datos.colonia] Colonia.
 * @param {number} datos.latitud Latitud del lugar.
 * @param {number} datos.longitud Longitud del lugar.
 * @param {string} [datos.correo] Correo del ciudadano; vacío o nulo si es anónimo.
 * @param {boolean} [datos.peligro_inmediato] Si los menores están en peligro inmediato.
 * @param {string} [datos.nivel_riesgo] Bajo, Medio o Alto.
 * @param {number} datos.id_municipio Municipio donde ocurre.
 * @param {string|null} ligaFoto Liga pública de la foto en S3, o null si no hay foto.
 * @returns {Promise<string>} El folio del reporte nuevo, por ejemplo RIETI-ATZ-000008.
 * @throws {Error} Error 45000 del procedure: "El municipio no existe" o
 * "El número de menores debe ser mayor a cero".
 */
export async function registrarReporte(connection, datos, ligaFoto) {
  const sql = 'CALL sp_registrar_reporte(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @folio)';
  await connection.query(sql, [
    datos.descripcion ?? null,
    datos.tipo_actividad ?? null,
    datos.edad_aproximada ?? null,
    datos.numero_menores ?? null,
    datos.horario ?? null,
    datos.nombre_lugar ?? null,
    datos.frecuencia ?? null,
    datos.colonia ?? null,
    datos.latitud ?? null,
    datos.longitud ?? null,
    datos.correo ?? null,
    datos.peligro_inmediato ?? null,
    datos.nivel_riesgo ?? null,
    ligaFoto ?? null,
    datos.id_municipio ?? null
  ]);

  const [rows] = await connection.query('SELECT @folio AS folio');
  return rows[0].folio;
}
