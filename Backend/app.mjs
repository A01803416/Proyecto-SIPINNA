/**
 * @file Aplicación de Express con todas las rutas del backend: inicio de
 * sesión, app móvil del ciudadano, procurador y administrador. Cada ruta abre
 * su propia conexión a la base de datos y la cierra al terminar.
 * Las rutas del procurador lo identifican con el encabezado id-procurador; si
 * falta, no encuentran ningún dato. Las rutas del administrador no verifican
 * quién hace la petición.
 * @module app
 */

import express from 'express';
import cors from 'cors';
import { connect, loginProcurador, loginAdministrador, getMunicipios } from './general_db.mjs';
import * as procurador from './procurador_db.mjs';
import * as admin from './admin_db.mjs';
import * as appDb from './app_db.mjs';
import * as fotos from './fotos_s3.mjs';

const app = express();
const port = process.env.PORT ?? 8080;

app.use(cors());
// como vamos a mandar las fotos desde la app le subo para que podamos mandar json mas grandes
app.use(express.json({ limit: '5mb' }));


/**
 * Responde a un error atrapado en cualquier ruta. Los errores 45000 de los
 * procedures traen un mensaje en español pensado para el usuario, así que se
 * responden con código 400 y ese mensaje en message. Cualquier otro error se
 * responde con código 500 y el name y message del error.
 *
 * @param {Object} res Respuesta de Express.
 * @param {Error} err Error que se atrapó en la ruta.
 * @returns {void}
 */
function manejarError(res, err) {
  if (err.sqlState === '45000') {
    res.status(400).json({ message: err.sqlMessage });
  } else {
    const { name, message } = err;
    res.status(500).json({ name, message });
  }
}


// general

/**
 * POST /login
 *
 * Inicia la sesión de un procurador o de un administrador.
 *
 * Cuerpo: { correo, contrasena, rol }, donde rol es "procurador" o "administrador".
 *
 * Respuestas:
 * - 200: si es procurador, { id, rol, correo, municipio }, donde municipio es
 *   { id_municipio, nombre_municipio } o null si no tiene uno asignado.
 *   Si es administrador, { id, rol, correo }.
 * - 400: el rol no es "procurador" ni "administrador".
 * - 401: el correo o la contraseña son incorrectos.
 * - 500: cualquier otro error.
 *
 * @see module:general_db.loginProcurador
 * @see module:general_db.loginAdministrador
 */
app.post('/login', async (req, res) => {
  const { correo, contrasena, rol } = req.body ?? {};
  let connection;

  try {
    connection = await connect();

    if (rol === 'procurador') {
      const result = await loginProcurador(connection, correo, contrasena);
      if (result) {
        res.json({
          id: result.id_procurador,
          rol,
          correo: result.correo_procurador,
          municipio: result.id_municipio
            ? { id_municipio: result.id_municipio, nombre_municipio: result.nombre_municipio }
            : null
        });
      } else {
        res.status(401).json({ message: 'Correo o contraseña incorrectos' });
      }

    } else if (rol === 'administrador') {
      const result = await loginAdministrador(connection, correo, contrasena);
      if (result) {
        res.json({ id: result.id_administrador, rol, correo: result.correo_administrador });
      } else {
        res.status(401).json({ message: 'Correo o contraseña incorrectos' });
      }

    } else {
      res.status(400).json({ message: 'El rol debe ser "procurador" o "administrador"' });
    }

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /municipios
 *
 * Regresa el catálogo de municipios, ordenado por nombre.
 *
 * Respuestas:
 * - 200: arreglo de { id_municipio, nombre_municipio, clave_municipio }.
 * - 500: cualquier error.
 *
 * @see module:general_db.getMunicipios
 */
app.get('/municipios', async (req, res) => {
  let connection;

  try {
    connection = await connect();
    const result = await getMunicipios(connection);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


// para la app

/**
 * POST /reportes
 *
 * Registra un reporte nuevo desde la app móvil. Si viene una foto y existe la
 * variable de entorno BUCKET_FOTOS, la foto se sube a S3 y su liga se guarda
 * en el reporte; si no, el reporte se guarda sin foto.
 *
 * Cuerpo: { id_municipio, latitud, longitud, colonia, nombre_lugar,
 * tipo_actividad, descripcion, numero_menores, edad_aproximada, horario,
 * frecuencia, nivel_riesgo, peligro_inmediato, correo, foto }. correo puede
 * venir vacío o nulo si el reporte es anónimo, y foto es la imagen en base64.
 *
 * Respuestas:
 * - 201: { folio } si el reporte trae correo. Si es anónimo, { ok: true }, sin
 *   el folio, porque sin correo nadie podría consultarlo.
 * - 400: el procedure rechazó el reporte; el motivo viene en message.
 * - 500: cualquier otro error.
 *
 * @see module:app_db.registrarReporte
 * @see module:fotos_s3.guardarFoto
 */
app.post('/reportes', async (req, res) => {
  const datos = req.body ?? {};
  const correo = datos.correo;
  let connection;

  try {
    connection = await connect();
    let ligaFoto = null;
    // puse este if para que, ademas de que en caso de que el reporte llegue sin foto funcione, tambien podamos seguir haciendo pruebas en local sin que exista el bucket
    if (datos.foto && process.env.BUCKET_FOTOS) {
      ligaFoto = await fotos.guardarFoto(datos.foto);
    }
    const folio = await appDb.registrarReporte(connection, datos, ligaFoto);
    if (correo && correo.trim() !== '') {
      res.status(201).json({ folio });
    } else {
      res.status(201).json({ ok: true });
    }

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * POST /reportes/consulta
 *
 * Consulta el estado de un reporte desde la app móvil, con el folio y el
 * correo con el que se registró.
 *
 * Cuerpo: { folio, correo }.
 *
 * Respuestas:
 * - 200: { id_folio_reporte, estatus, fecha_registro, ultima_nota_publica }.
 * - 404: "Folio o correo incorrectos". Es el mismo mensaje si falla el folio o
 *   el correo, para no dar pistas a quien intente adivinar.
 * - 500: cualquier otro error.
 *
 * @see module:app_db.consultarReporte
 */
app.post('/reportes/consulta', async (req, res) => {
  const { folio, correo } = req.body ?? {};
  let connection;

  try {
    connection = await connect();
    const result = await appDb.consultarReporte(connection, folio, correo);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: 'Folio o correo incorrectos' });
    }

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


// procurador
// todas identifican al procurador con el header id-procurador

/**
 * GET /procurador/reportes
 *
 * Regresa los reportes sueltos del procurador, es decir, los que no están
 * fusionados en un caso.
 *
 * Encabezado: id-procurador.
 * Query, todos opcionales: estatus, desde, hasta, nivel_riesgo,
 * peligro_inmediato y posible_duplicado.
 *
 * Respuestas:
 * - 200: arreglo de reportes.
 * - 500: cualquier error.
 *
 * @see module:procurador_db.getReportes
 */
app.get('/procurador/reportes', async (req, res) => {
  const idProcurador = req.get('id-procurador');
  let connection;

  try {
    connection = await connect();
    const result = await procurador.getReportes(connection, idProcurador, req.query);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /procurador/reportes/:folio
 *
 * Regresa el detalle de un reporte del procurador con sus notas de avance.
 *
 * Parámetro de la ruta: folio.
 * Encabezado: id-procurador.
 *
 * Respuestas:
 * - 200: el reporte, sin el correo del ciudadano, con un arreglo notas.
 * - 404: "El reporte no existe", si no existe o es de otro procurador.
 * - 500: cualquier otro error.
 *
 * @see module:procurador_db.getReporte
 * @see module:procurador_db.getNotasReporte
 */
app.get('/procurador/reportes/:folio', async (req, res) => {
  const folio = req.params.folio;
  const idProcurador = req.get('id-procurador');
  let connection;

  try {
    connection = await connect();
    const reporte = await procurador.getReporte(connection, idProcurador, folio);
    if (reporte) {
      const notas = await procurador.getNotasReporte(connection, idProcurador, folio);
      reporte.notas = notas;
      res.json(reporte);
    } else {
      res.status(404).json({ message: 'El reporte no existe' });
    }

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * PUT /procurador/reportes/:folio/estatus
 *
 * Cambia el estatus de un reporte del procurador; también sirve para cerrarlo
 * y reabrirlo. Antes de llamar al procedure revisa que el reporte sea suyo,
 * así responde igual si no existe o si es de otro municipio.
 *
 * Parámetro de la ruta: folio.
 * Encabezado: id-procurador.
 * Cuerpo: { estatus, motivo }. motivo solo es obligatorio si el estatus nuevo
 * es de cierre.
 *
 * Respuestas:
 * - 200: { ok: true }.
 * - 400: el procedure rechazó el cambio; el motivo viene en message.
 * - 404: "El reporte no existe", si no existe o es de otro procurador.
 * - 500: cualquier otro error.
 *
 * @see module:procurador_db.cambiarEstatus
 */
app.put('/procurador/reportes/:folio/estatus', async (req, res) => {
  const folio = req.params.folio;
  const idProcurador = req.get('id-procurador');
  const { estatus, motivo } = req.body ?? {};
  let connection;

  try {
    connection = await connect();
    const reporte = await procurador.getReporte(connection, idProcurador, folio);
    if (reporte) {
      await procurador.cambiarEstatus(connection, idProcurador, folio, estatus, motivo);
      res.json({ ok: true });
    } else {
      res.status(404).json({ message: 'El reporte no existe' });
    }

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * POST /procurador/reportes/:folio/notas
 *
 * Agrega una nota de avance a un reporte del procurador. Antes de llamar al
 * procedure revisa que el reporte sea suyo.
 *
 * Parámetro de la ruta: folio.
 * Encabezado: id-procurador.
 * Cuerpo: { descripcion_avance, descripcion_publica }. descripcion_publica es
 * opcional y es la única que puede ver el ciudadano.
 *
 * Respuestas:
 * - 201: { ok: true }.
 * - 400: el procedure rechazó la nota; el motivo viene en message.
 * - 404: "El reporte no existe", si no existe o es de otro procurador.
 * - 500: cualquier otro error.
 *
 * @see module:procurador_db.registrarNota
 */
app.post('/procurador/reportes/:folio/notas', async (req, res) => {
  const folio = req.params.folio;
  const idProcurador = req.get('id-procurador');
  const { descripcion_avance, descripcion_publica } = req.body ?? {};
  let connection;

  try {
    connection = await connect();
    const reporte = await procurador.getReporte(connection, idProcurador, folio);
    if (reporte) {
      await procurador.registrarNota(connection, idProcurador, folio, descripcion_avance, descripcion_publica);
      res.status(201).json({ ok: true });
    } else {
      res.status(404).json({ message: 'El reporte no existe' });
    }

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * PUT /procurador/reportes/:folio/municipio
 *
 * Corrige el municipio de un reporte del procurador. El reporte pasa al
 * procurador del municipio nuevo. Antes de llamar al procedure revisa que el
 * reporte sea suyo.
 *
 * Parámetro de la ruta: folio.
 * Encabezado: id-procurador.
 * Cuerpo: { id_municipio }.
 *
 * Respuestas:
 * - 200: { ok: true }.
 * - 400: el procedure rechazó el cambio; el motivo viene en message.
 * - 404: "El reporte no existe", si no existe o es de otro procurador.
 * - 500: cualquier otro error.
 *
 * @see module:procurador_db.corregirMunicipio
 */
app.put('/procurador/reportes/:folio/municipio', async (req, res) => {
  const folio = req.params.folio;
  const idProcurador = req.get('id-procurador');
  const { id_municipio } = req.body ?? {};
  let connection;

  try {
    connection = await connect();
    const reporte = await procurador.getReporte(connection, idProcurador, folio);
    if (reporte) {
      await procurador.corregirMunicipio(connection, idProcurador, folio, id_municipio);
      res.json({ ok: true });
    } else {
      res.status(404).json({ message: 'El reporte no existe' });
    }

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * PUT /procurador/reportes/:folio/duplicado
 *
 * Marca o desmarca un reporte del procurador como posible duplicado. Antes de
 * llamar al procedure revisa que el reporte sea suyo.
 *
 * Parámetro de la ruta: folio.
 * Encabezado: id-procurador.
 * Cuerpo: { valor }, true para marcarlo y false para desmarcarlo.
 *
 * Respuestas:
 * - 200: { ok: true }.
 * - 400: el procedure rechazó el cambio; el motivo viene en message.
 * - 404: "El reporte no existe", si no existe o es de otro procurador.
 * - 500: cualquier otro error.
 *
 * @see module:procurador_db.marcarDuplicado
 */
app.put('/procurador/reportes/:folio/duplicado', async (req, res) => {
  const folio = req.params.folio;
  const idProcurador = req.get('id-procurador');
  const { valor } = req.body ?? {};
  let connection;

  try {
    connection = await connect();
    const reporte = await procurador.getReporte(connection, idProcurador, folio);
    if (reporte) {
      await procurador.marcarDuplicado(connection, idProcurador, folio, valor);
      res.json({ ok: true });
    } else {
      res.status(404).json({ message: 'El reporte no existe' });
    }

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /procurador/casos
 *
 * Regresa los casos de los que el procurador es responsable.
 *
 * Encabezado: id-procurador.
 *
 * Respuestas:
 * - 200: arreglo de casos.
 * - 500: cualquier error.
 *
 * @see module:procurador_db.getCasos
 */
app.get('/procurador/casos', async (req, res) => {
  const idProcurador = req.get('id-procurador');
  let connection;

  try {
    connection = await connect();
    const result = await procurador.getCasos(connection, idProcurador);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /procurador/casos/:id
 *
 * Regresa el detalle de un caso del procurador con sus reportes y sus notas.
 *
 * Parámetro de la ruta: id, el id del caso.
 * Encabezado: id-procurador.
 *
 * Respuestas:
 * - 200: el caso, con un arreglo reportes y un arreglo notas.
 * - 404: "El caso no existe", si no existe o es de otro procurador.
 * - 500: cualquier otro error.
 *
 * @see module:procurador_db.getCaso
 * @see module:procurador_db.getReportesCaso
 * @see module:procurador_db.getNotasCaso
 */
app.get('/procurador/casos/:id', async (req, res) => {
  const idCaso = req.params.id;
  const idProcurador = req.get('id-procurador');
  let connection;

  try {
    connection = await connect();
    const caso = await procurador.getCaso(connection, idProcurador, idCaso);
    if (caso) {
      const reportes = await procurador.getReportesCaso(connection, idProcurador, idCaso);
      const notas = await procurador.getNotasCaso(connection, idProcurador, idCaso);
      caso.reportes = reportes;
      caso.notas = notas;
      res.json(caso);
    } else {
      res.status(404).json({ message: 'El caso no existe' });
    }

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * PUT /procurador/casos/:id/estatus
 *
 * Cambia el estatus de un caso del procurador. Como no hay procedures de
 * casos, toma cualquier folio del caso y llama al procedure del reporte; el
 * procedure detecta que el reporte está fusionado y cambia todo el caso.
 *
 * Parámetro de la ruta: id, el id del caso.
 * Encabezado: id-procurador.
 * Cuerpo: { estatus, motivo }. motivo solo es obligatorio si el estatus nuevo
 * es de cierre.
 *
 * Respuestas:
 * - 200: { ok: true }.
 * - 400: el procedure rechazó el cambio; el motivo viene en message.
 * - 404: "El caso no existe", si no existe o es de otro procurador.
 * - 500: cualquier otro error.
 *
 * @see module:procurador_db.getFolioDeCaso
 * @see module:procurador_db.cambiarEstatus
 */
app.put('/procurador/casos/:id/estatus', async (req, res) => {
  const idCaso = req.params.id;
  const idProcurador = req.get('id-procurador');
  const { estatus, motivo } = req.body ?? {};
  let connection;

  try {
    connection = await connect();
    const folio = await procurador.getFolioDeCaso(connection, idProcurador, idCaso);
    if (folio) {
      await procurador.cambiarEstatus(connection, idProcurador, folio, estatus, motivo);
      res.json({ ok: true });
    } else {
      res.status(404).json({ message: 'El caso no existe' });
    }

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * POST /procurador/casos/:id/notas
 *
 * Agrega una nota de avance a un caso del procurador. Igual que el cambio de
 * estatus, usa cualquier folio del caso y el procedure guarda la nota en el caso.
 *
 * Parámetro de la ruta: id, el id del caso.
 * Encabezado: id-procurador.
 * Cuerpo: { descripcion_avance, descripcion_publica }. descripcion_publica es
 * opcional y es la única que puede ver el ciudadano.
 *
 * Respuestas:
 * - 201: { ok: true }.
 * - 400: el procedure rechazó la nota; el motivo viene en message.
 * - 404: "El caso no existe", si no existe o es de otro procurador.
 * - 500: cualquier otro error.
 *
 * @see module:procurador_db.getFolioDeCaso
 * @see module:procurador_db.registrarNota
 */
app.post('/procurador/casos/:id/notas', async (req, res) => {
  const idCaso = req.params.id;
  const idProcurador = req.get('id-procurador');
  const { descripcion_avance, descripcion_publica } = req.body ?? {};
  let connection;

  try {
    connection = await connect();
    const folio = await procurador.getFolioDeCaso(connection, idProcurador, idCaso);
    if (folio) {
      await procurador.registrarNota(connection, idProcurador, folio, descripcion_avance, descripcion_publica);
      res.status(201).json({ ok: true });
    } else {
      res.status(404).json({ message: 'El caso no existe' });
    }

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /procurador/mapa
 *
 * Regresa la ubicación de todos los reportes del procurador, incluidos los
 * fusionados, para pintarlos en el mapa.
 *
 * Encabezado: id-procurador.
 *
 * Respuestas:
 * - 200: arreglo de { id_folio_reporte, latitud, longitud, estatus, peligro_inmediato }.
 * - 500: cualquier error.
 *
 * @see module:procurador_db.getMapa
 */
app.get('/procurador/mapa', async (req, res) => {
  const idProcurador = req.get('id-procurador');
  let connection;

  try {
    connection = await connect();
    const result = await procurador.getMapa(connection, idProcurador);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /procurador/metricas
 *
 * Regresa las métricas de los reportes del procurador.
 *
 * Encabezado: id-procurador.
 *
 * Respuestas:
 * - 200: objeto con las métricas.
 * - 500: cualquier error.
 *
 * @see module:procurador_db.getMetricas
 */
app.get('/procurador/metricas', async (req, res) => {
  const idProcurador = req.get('id-procurador');
  let connection;

  try {
    connection = await connect();
    const result = await procurador.getMetricas(connection, idProcurador);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


// administrador

/**
 * GET /admin/reportes
 *
 * Regresa los reportes sueltos de todos los municipios, es decir, los que no
 * están fusionados en un caso.
 *
 * Query, todos opcionales: estatus, desde, hasta, nivel_riesgo,
 * peligro_inmediato, posible_duplicado e id_municipio.
 *
 * Respuestas:
 * - 200: arreglo de reportes.
 * - 500: cualquier error.
 *
 * @see module:admin_db.getReportes
 */
app.get('/admin/reportes', async (req, res) => {
  let connection;

  try {
    connection = await connect();
    const result = await admin.getReportes(connection, req.query);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /admin/reportes/:folio
 *
 * Regresa el detalle de cualquier reporte con sus notas de avance y su bitácora.
 *
 * Parámetro de la ruta: folio.
 *
 * Respuestas:
 * - 200: el reporte, sin el correo del ciudadano, con un arreglo notas y un
 *   arreglo bitacora.
 * - 404: "El reporte no existe".
 * - 500: cualquier otro error.
 *
 * @see module:admin_db.getReporte
 * @see module:admin_db.getNotasReporte
 * @see module:admin_db.getBitacora
 */
app.get('/admin/reportes/:folio', async (req, res) => {
  const folio = req.params.folio;
  let connection;

  try {
    connection = await connect();
    const reporte = await admin.getReporte(connection, folio);
    if (reporte) {
      const notas = await admin.getNotasReporte(connection, folio);
      const bitacora = await admin.getBitacora(connection, folio);
      reporte.notas = notas;
      reporte.bitacora = bitacora;
      res.json(reporte);
    } else {
      res.status(404).json({ message: 'El reporte no existe' });
    }

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /admin/duplicados
 *
 * Regresa los reportes que algún procurador marcó como posible duplicado.
 *
 * Respuestas:
 * - 200: arreglo de reportes.
 * - 500: cualquier error.
 *
 * @see module:admin_db.getDuplicados
 */
app.get('/admin/duplicados', async (req, res) => {
  let connection;

  try {
    connection = await connect();
    const result = await admin.getDuplicados(connection);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * POST /admin/fusiones
 *
 * Fusiona dos reportes en un caso.
 *
 * Cuerpo: { folio1, folio2 }.
 *
 * Respuestas:
 * - 201: { id_caso }, el caso donde quedaron los dos reportes.
 * - 400: el procedure rechazó la fusión; el motivo viene en message.
 * - 500: cualquier otro error.
 *
 * @see module:admin_db.fusionar
 */
app.post('/admin/fusiones', async (req, res) => {
  const { folio1, folio2 } = req.body ?? {};
  let connection;

  try {
    connection = await connect();
    const result = await admin.fusionar(connection, folio1, folio2);
    res.status(201).json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /admin/casos
 *
 * Regresa todos los casos con su procurador responsable.
 *
 * Respuestas:
 * - 200: arreglo de casos.
 * - 500: cualquier error.
 *
 * @see module:admin_db.getCasos
 */
app.get('/admin/casos', async (req, res) => {
  let connection;

  try {
    connection = await connect();
    const result = await admin.getCasos(connection);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /admin/casos/:id
 *
 * Regresa el detalle de cualquier caso con sus reportes y sus notas.
 *
 * Parámetro de la ruta: id, el id del caso.
 *
 * Respuestas:
 * - 200: el caso, con un arreglo reportes y un arreglo notas.
 * - 404: "El caso no existe".
 * - 500: cualquier otro error.
 *
 * @see module:admin_db.getCaso
 * @see module:admin_db.getReportesCaso
 * @see module:admin_db.getNotasCaso
 */
app.get('/admin/casos/:id', async (req, res) => {
  const idCaso = req.params.id;
  let connection;

  try {
    connection = await connect();
    const caso = await admin.getCaso(connection, idCaso);
    if (caso) {
      const reportes = await admin.getReportesCaso(connection, idCaso);
      const notas = await admin.getNotasCaso(connection, idCaso);
      caso.reportes = reportes;
      caso.notas = notas;
      res.json(caso);
    } else {
      res.status(404).json({ message: 'El caso no existe' });
    }

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /admin/mapa
 *
 * Regresa la ubicación de todos los reportes de todos los municipios,
 * incluidos los fusionados, para pintarlos en el mapa.
 *
 * Respuestas:
 * - 200: arreglo de { id_folio_reporte, latitud, longitud, estatus,
 *   peligro_inmediato, nombre_municipio }.
 * - 500: cualquier error.
 *
 * @see module:admin_db.getMapa
 */
app.get('/admin/mapa', async (req, res) => {
  let connection;

  try {
    connection = await connect();
    const result = await admin.getMapa(connection);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /admin/metricas
 *
 * Regresa las métricas de todos los municipios.
 *
 * Respuestas:
 * - 200: objeto con las métricas.
 * - 500: cualquier error.
 *
 * @see module:admin_db.getMetricas
 */
app.get('/admin/metricas', async (req, res) => {
  let connection;

  try {
    connection = await connect();
    const result = await admin.getMetricas(connection);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /admin/municipios
 *
 * Regresa todos los municipios con el procurador asignado a cada uno.
 *
 * Respuestas:
 * - 200: arreglo de { id_municipio, nombre_municipio, clave_municipio,
 *   id_procurador, correo_procurador }.
 * - 500: cualquier error.
 *
 * @see module:admin_db.getMunicipios
 */
app.get('/admin/municipios', async (req, res) => {
  let connection;

  try {
    connection = await connect();
    const result = await admin.getMunicipios(connection);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * POST /admin/municipios
 *
 * Da de alta un municipio. La clave se guarda en mayúsculas.
 *
 * Cuerpo: { nombre_municipio, clave_municipio }.
 *
 * Respuestas:
 * - 201: { id_municipio, nombre_municipio, clave_municipio }.
 * - 500: cualquier error.
 *
 * @see module:admin_db.crearMunicipio
 */
app.post('/admin/municipios', async (req, res) => {
  const { nombre_municipio, clave_municipio } = req.body ?? {};
  let connection;

  try {
    connection = await connect();
    const result = await admin.crearMunicipio(connection, nombre_municipio, clave_municipio);
    res.status(201).json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /admin/procuradores
 *
 * Regresa todos los procuradores, sin su contraseña.
 *
 * Respuestas:
 * - 200: arreglo de { id_procurador, correo_procurador, id_municipio }.
 * - 500: cualquier error.
 *
 * @see module:admin_db.getProcuradores
 */
app.get('/admin/procuradores', async (req, res) => {
  let connection;

  try {
    connection = await connect();
    const result = await admin.getProcuradores(connection);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * POST /admin/procuradores
 *
 * Da de alta un procurador y, si viene id_municipio, se lo asigna.
 *
 * Cuerpo: { correo, contrasena, id_municipio }. id_municipio es opcional.
 *
 * Respuestas:
 * - 201: { id_procurador, correo_procurador, id_municipio }.
 * - 400: el procedure rechazó la asignación del municipio; el motivo viene en
 *   message. En ese caso el procurador sí queda creado, pero sin municipio.
 * - 500: cualquier otro error.
 *
 * @see module:admin_db.crearProcurador
 */
app.post('/admin/procuradores', async (req, res) => {
  const { correo, contrasena, id_municipio } = req.body ?? {};
  let connection;

  try {
    connection = await connect();
    const result = await admin.crearProcurador(connection, correo, contrasena, id_municipio);
    res.status(201).json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * PUT /admin/procuradores/:id/municipio
 *
 * Asigna o reasigna un procurador a un municipio.
 *
 * Parámetro de la ruta: id, el id del procurador.
 * Cuerpo: { id_municipio }.
 *
 * Respuestas:
 * - 200: el procurador actualizado, { id_procurador, correo_procurador, id_municipio }.
 * - 400: el procedure rechazó la asignación; el motivo viene en message.
 * - 500: cualquier otro error.
 *
 * @see module:admin_db.asignarMunicipio
 */
app.put('/admin/procuradores/:id/municipio', async (req, res) => {
  const idProcurador = req.params.id;
  const { id_municipio } = req.body ?? {};
  let connection;

  try {
    connection = await connect();
    const result = await admin.asignarMunicipio(connection, idProcurador, id_municipio);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * GET /admin/administradores
 *
 * Regresa todos los administradores, sin su contraseña.
 *
 * Respuestas:
 * - 200: arreglo de { id_administrador, correo_administrador }.
 * - 500: cualquier error.
 *
 * @see module:admin_db.getAdministradores
 */
app.get('/admin/administradores', async (req, res) => {
  let connection;

  try {
    connection = await connect();
    const result = await admin.getAdministradores(connection);
    res.json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


/**
 * POST /admin/administradores
 *
 * Da de alta un administrador.
 *
 * Cuerpo: { correo, contrasena }.
 *
 * Respuestas:
 * - 201: { id_administrador, correo_administrador }.
 * - 500: cualquier error.
 *
 * @see module:admin_db.crearAdministrador
 */
app.post('/admin/administradores', async (req, res) => {
  const { correo, contrasena } = req.body ?? {};
  let connection;

  try {
    connection = await connect();
    const result = await admin.crearAdministrador(connection, correo, contrasena);
    res.status(201).json(result);

  } catch (err) {
    manejarError(res, err);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
});


// cierre

app.use((req, res) => {
  res.status(404).json({ message: `Not Found: ${req.originalUrl}` });
});

// para cuando probemos las cosas localmente
if (process.env.AWS_LAMBDA_FUNCTION_NAME === undefined) {
  app.listen(port, () => {
    console.log(`Servidor esperando en: http://localhost:${port}`);
  });
}

export default app;
