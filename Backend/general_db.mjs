import mysql from 'mysql2/promise';


export async function connect() {
  return await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'proteccion_menores',
    dateStrings: true,
    decimalNumbers: true
  });
}


// login

export async function loginProcurador(connection, correo, contrasena) {
  const sql = `
    SELECT p.id_procurador, p.correo_procurador, p.id_municipio, m.nombre_municipio
    FROM Procurador p
    LEFT JOIN Municipio m ON p.id_municipio = m.id_municipio
    WHERE p.correo_procurador = ? AND p.contrasena_procurador = ?`;
  const [rows] = await connection.execute(sql, [correo ?? null, contrasena ?? null]);
  return rows[0] ?? null;
}


export async function loginAdministrador(connection, correo, contrasena) {
  const sql = `
    SELECT id_administrador, correo_administrador
    FROM Administrador
    WHERE correo_administrador = ? AND contrasena_administrador = ?`;
  const [rows] = await connection.execute(sql, [correo ?? null, contrasena ?? null]);
  return rows[0] ?? null;
}


// lista de municipios

export async function getMunicipios(connection) {
  const sql = `
    SELECT id_municipio, nombre_municipio, clave_municipio
    FROM Municipio
    ORDER BY nombre_municipio`;
  const [rows] = await connection.execute(sql);
  return rows;
}
