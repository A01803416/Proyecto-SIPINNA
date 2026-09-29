import express from 'express';
import cors from 'cors';
import { connect, loginProcurador, loginAdministrador, getMunicipios } from './general_db.mjs';
import * as procurador from './procurador_db.mjs';
import * as admin from './admin_db.mjs';

const app = express();
const port = process.env.PORT ?? 8080;

app.use(cors());
app.use(express.json());


// los errores de los procedures llegan con su mensaje tal cual a la pagina
function manejarError(res, err) {
  if (err.sqlState === '45000') {
    res.status(400).json({ message: err.sqlMessage });
  } else {
    const { name, message } = err;
    res.status(500).json({ name, message });
  }
}


// general

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


// procurador
// todas identifican al procurador con el header id-procurador

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


app.get('/procurador/reportes/:folio', async (req, res) => {
  const folio = req.params.folio;
  const idProcurador = req.get('id-procurador');
  let connection;

  try {
    connection = await connect();
    const result = await procurador.getReporte(connection, idProcurador, folio);
    if (result) {
      res.json(result);
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


// en las escrituras primero se revisa que el reporte sea suyo
// asi responde igual si no existe o si es de otro municipio
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


app.get('/procurador/casos/:id', async (req, res) => {
  const idCaso = req.params.id;
  const idProcurador = req.get('id-procurador');
  let connection;

  try {
    connection = await connect();
    const result = await procurador.getCaso(connection, idProcurador, idCaso);
    if (result) {
      res.json(result);
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


// con cualquier folio del caso, el procedure detecta que esta fusionado y cambia todo el caso
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


app.get('/admin/reportes/:folio', async (req, res) => {
  const folio = req.params.folio;
  let connection;

  try {
    connection = await connect();
    const result = await admin.getReporte(connection, folio);
    if (result) {
      res.json(result);
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


app.get('/admin/casos/:id', async (req, res) => {
  const idCaso = req.params.id;
  let connection;

  try {
    connection = await connect();
    const result = await admin.getCaso(connection, idCaso);
    if (result) {
      res.json(result);
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
  res.status(404).json({ message: `Not Found: ${ req.originalUrl }` });
});


if (process.env.AWS_LAMBDA_FUNCTION_NAME === undefined) {
  app.listen(port, () => {
    console.log(`Servidor esperando en: http://localhost:${ port }`);
  });
}

export default app;
