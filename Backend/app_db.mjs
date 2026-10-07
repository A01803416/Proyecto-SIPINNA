// consultas de la app movil del ciudadano

// pide folio y correo juntos para que nadie vea reportes ajenos
// si el reporte esta en un caso tambien cuentan las notas del caso
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


// llamamos al procedure para registrar el reporte
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
