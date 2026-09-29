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


// mysql regresa los boolean como 0 y 1, la pagina necesita true y false
export function convertirBooleanos(fila) {
  const copia = { ...fila };
  for (const campo of ['peligro_inmediato', 'posible_duplicado']) {
    if (campo in copia) copia[campo] = Boolean(copia[campo]);
  }
  return copia;
}


// arma las condiciones del listado de reportes con los filtros que vengan en la url
// el filtro de municipio solo lo usa el admin
export function armarFiltros(query, prefijo = '', conMunicipio = false) {
  const condiciones = [];
  const valores = [];
  const agregar = (condicion, valor) => {
    condiciones.push(condicion);
    valores.push(valor);
  };
  const viene = (valor) => valor !== undefined && valor !== '';
  // el texto true o false se pasa a 1 o 0 para compararlo con la columna
  const aBit = (valor) => (valor === 'true' || valor === '1' ? 1 : 0);

  if (viene(query.estatus)) agregar(`${prefijo}estatus = ?`, query.estatus);
  if (viene(query.desde)) agregar(`${prefijo}fecha_registro >= ?`, query.desde);
  // menor al dia siguiente para que entre todo el dia de hasta
  if (viene(query.hasta)) agregar(`${prefijo}fecha_registro < DATE_ADD(?, INTERVAL 1 DAY)`, query.hasta);
  if (viene(query.nivel_riesgo)) agregar(`${prefijo}nivel_riesgo = ?`, query.nivel_riesgo);
  if (viene(query.peligro_inmediato)) agregar(`${prefijo}peligro_inmediato = ?`, aBit(query.peligro_inmediato));
  if (viene(query.posible_duplicado)) agregar(`${prefijo}posible_duplicado = ?`, aBit(query.posible_duplicado));
  if (conMunicipio && viene(query.id_municipio)) agregar(`${prefijo}id_municipio = ?`, query.id_municipio);

  return { condiciones, valores };
}
