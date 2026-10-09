/**
 * @file Conexión a la base de datos y consultas que no son de un rol en particular:
 * el inicio de sesión y el catálogo de municipios.
 * @module general_db
 */

import mysql from 'mysql2/promise';


/**
 * Abre una conexión nueva a la base de datos proteccion_menores con los datos
 * de las variables de entorno MYSQL_HOST, MYSQL_USER y MYSQL_PASSWORD.
 * Cada petición abre su propia conexión y la cierra al terminar.
 * Las fechas llegan como texto y los DECIMAL como números.
 *
 * @returns {Promise<Object>} La conexión abierta de mysql2.
 * @throws {Error} Si no se puede conectar con MySQL.
 */
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

/**
 * Busca al procurador cuyo correo y contraseña coinciden exactamente.
 * La contraseña se compara en texto plano y nunca se regresa.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {string} correo Correo del procurador.
 * @param {string} contrasena Contraseña del procurador.
 * @returns {Promise<Object|null>} Un objeto con id_procurador, correo_procurador,
 * id_municipio y nombre_municipio (los dos últimos son null si no tiene municipio
 * asignado), o null si el correo o la contraseña no coinciden.
 */
export async function loginProcurador(connection, correo, contrasena) {
  const sql = `
    SELECT p.id_procurador, p.correo_procurador, p.id_municipio, m.nombre_municipio
    FROM Procurador p
    LEFT JOIN Municipio m ON p.id_municipio = m.id_municipio
    WHERE p.correo_procurador = ? AND p.contrasena_procurador = ?`;
  const [rows] = await connection.execute(sql, [correo ?? null, contrasena ?? null]);
  return rows[0] ?? null;
}


/**
 * Busca al administrador cuyo correo y contraseña coinciden exactamente.
 * La contraseña se compara en texto plano y nunca se regresa.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @param {string} correo Correo del administrador.
 * @param {string} contrasena Contraseña del administrador.
 * @returns {Promise<Object|null>} Un objeto con id_administrador y
 * correo_administrador, o null si el correo o la contraseña no coinciden.
 */
export async function loginAdministrador(connection, correo, contrasena) {
  const sql = `
    SELECT id_administrador, correo_administrador
    FROM Administrador
    WHERE correo_administrador = ? AND contrasena_administrador = ?`;
  const [rows] = await connection.execute(sql, [correo ?? null, contrasena ?? null]);
  return rows[0] ?? null;
}


// lista de municipios

/**
 * Obtiene todos los municipios, ordenados alfabéticamente por nombre.
 *
 * @param {Object} connection Conexión abierta con connect().
 * @returns {Promise<Object[]>} Arreglo de municipios, cada uno con id_municipio,
 * nombre_municipio y clave_municipio.
 */
export async function getMunicipios(connection) {
  const sql = `
    SELECT id_municipio, nombre_municipio, clave_municipio
    FROM Municipio
    ORDER BY nombre_municipio`;
  const [rows] = await connection.execute(sql);
  return rows;
}
