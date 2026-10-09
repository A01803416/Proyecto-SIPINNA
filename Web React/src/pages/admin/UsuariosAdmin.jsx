import { useState, useEffect } from 'react';
import { API_URL, encabezados } from '../../services/api_url';

/**
 * @typedef {Object} MunicipioAdmin
 * @property {number} id_municipio Identificador del municipio.
 * @property {string} nombre_municipio Nombre del municipio.
 * @property {string} clave_municipio Clave oficial del municipio.
 * @property {number|null} [id_procurador] Identificador del procurador asignado.
 * @property {string|null} [correo_procurador] Correo del procurador asignado.
 */

/**
 * @typedef {Object} ProcuradorAdmin
 * @property {number} id_procurador Identificador del procurador.
 * @property {string} correo_procurador Correo institucional del procurador.
 * @property {number|null} id_municipio Identificador del municipio asignado, si existe.
 */

/**
 * @typedef {Object} AdministradorAdmin
 * @property {number} id_administrador Identificador del administrador.
 * @property {string} correo_administrador Correo institucional del administrador.
 */

/**
 * Panel para crear usuarios y municipios, reasignar procuradores y consultar
 * los registros actuales de municipios, procuradores y administradores.
 * @returns {JSX.Element} Interfaz de administración de usuarios y municipios.
 */
export default function UsuariosAdmin() {
  const [municipios, setMunicipios] = useState([]);
  const [procuradores, setProcuradores] = useState([]);
  const [administradores, setAdministradores] = useState([]);

  // alta de usuario
  const [correo, setCorreo] = useState('');
  const [rolUsuario, setRolUsuario] = useState('Procurador Municipal');
  const [municipioAsignado, setMunicipioAsignado] = useState('');
  const [contrasena, setContrasena] = useState('');

  // alta de municipio
  const [nombreMunicipio, setNombreMunicipio] = useState('');
  const [claveMunicipio, setClaveMunicipio] = useState('');

  // reasignacion
  const [procuradorElegido, setProcuradorElegido] = useState('');
  const [municipioNuevo, setMunicipioNuevo] = useState('');

  /**
   * Carga los catálogos de municipios, procuradores y administradores.
   * @returns {Promise<void>} Promesa que se resuelve al completar las solicitudes.
   */
  async function cargarDatos() {
    try {
      const resMunicipios = await fetch(`${API_URL}/admin/municipios`, {
        headers: encabezados()
      });
      const dataMunicipios = await resMunicipios.json();
      if (resMunicipios.ok) {
        setMunicipios(dataMunicipios);
      } else {
        alert(dataMunicipios.message);
      }

      const resProcuradores = await fetch(`${API_URL}/admin/procuradores`, {
        headers: encabezados()
      });
      const dataProcuradores = await resProcuradores.json();
      if (resProcuradores.ok) {
        setProcuradores(dataProcuradores);
      } else {
        alert(dataProcuradores.message);
      }

      const resAdmins = await fetch(`${API_URL}/admin/administradores`, {
        headers: encabezados()
      });
      const dataAdmins = await resAdmins.json();
      if (resAdmins.ok) {
        setAdministradores(dataAdmins);
      } else {
        alert(dataAdmins.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  /**
   * Busca el nombre de un municipio por su identificador.
   * @param {number} idMunicipio Identificador del municipio.
   * @returns {string} Nombre del municipio o "Sin municipio" si no existe.
   */
  function nombreDeMunicipio(idMunicipio) {
    const encontrados = municipios.filter((m) => m.id_municipio === idMunicipio);
    return encontrados.length > 0 ? encontrados[0].nombre_municipio : 'Sin municipio';
  }

  // si el municipio ya tiene procurador, el nuevo lo desplaza y hay que avisar antes
  /**
   * Confirma si se puede asignar un procurador al municipio, avisando cuando
   * la asignación reemplazará a otro procurador.
   * @param {number} idMunicipio Identificador del municipio que se asignará.
   * @param {number|null} idProcurador Identificador del procurador que se asignará, o null al crear uno.
   * @returns {boolean} Indica si se puede continuar con la asignación.
   */
  function confirmarReemplazo(idMunicipio, idProcurador) {
    const encontrados = municipios.filter((m) => m.id_municipio === idMunicipio);
    if (encontrados.length === 0) return true;

    const municipio = encontrados[0];
    if (!municipio.correo_procurador || municipio.id_procurador === idProcurador) {
      return true;
    }
    return window.confirm(
      `${municipio.nombre_municipio} ya tiene como procurador a ${municipio.correo_procurador}. ` +
      'Se le quitará el municipio y sus reportes pasarán al nuevo procurador. ¿Continuar?'
    );
  }

  /**
   * Registra un procurador o administrador según el rol seleccionado.
   * @returns {Promise<void>} Promesa que se resuelve al completar la creación.
   */
  async function crearUsuario() {
    try {
      let res;

      if (rolUsuario === 'Procurador Municipal') {
        const idMunicipio = municipioAsignado ? Number(municipioAsignado) : null;
        if (idMunicipio && !confirmarReemplazo(idMunicipio, null)) return;

        res = await fetch(`${API_URL}/admin/procuradores`, {
          method: 'POST',
          headers: encabezados(),
          body: JSON.stringify({ correo, contrasena, id_municipio: idMunicipio })
        });
      } else {
        res = await fetch(`${API_URL}/admin/administradores`, {
          method: 'POST',
          headers: encabezados(),
          body: JSON.stringify({ correo, contrasena })
        });
      }

      const data = await res.json();
      if (res.ok) {
        alert('Usuario creado con éxito.');
        setCorreo('');
        setMunicipioAsignado('');
        setContrasena('');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }

    cargarDatos();
  }

  /**
   * Registra un municipio con el nombre y la clave capturados en el formulario.
   * @returns {Promise<void>} Promesa que se resuelve al completar el registro.
   */
  async function crearMunicipio() {
    try {
      const res = await fetch(`${API_URL}/admin/municipios`, {
        method: 'POST',
        headers: encabezados(),
        body: JSON.stringify({ nombre_municipio: nombreMunicipio, clave_municipio: claveMunicipio })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Municipio ${data.nombre_municipio} registrado con la clave ${data.clave_municipio}.`);
        setNombreMunicipio('');
        setClaveMunicipio('');
        cargarDatos();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  }

  /**
   * Asigna el municipio seleccionado al procurador elegido, previa confirmación
   * si el municipio ya tiene otro responsable.
   * @returns {Promise<void>} Promesa que se resuelve al completar la reasignación.
   */
  async function reasignarProcurador() {
    if (!procuradorElegido || !municipioNuevo) {
      alert('Elige un procurador y un municipio.');
      return;
    }
    const idProcurador = Number(procuradorElegido);
    const idMunicipio = Number(municipioNuevo);
    if (!confirmarReemplazo(idMunicipio, idProcurador)) return;

    try {
      const res = await fetch(`${API_URL}/admin/procuradores/${idProcurador}/municipio`, {
        method: 'PUT',
        headers: encabezados(),
        body: JSON.stringify({ id_municipio: idMunicipio })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Procurador reasignado con éxito.');
        setProcuradorElegido('');
        setMunicipioNuevo('');
        cargarDatos();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar con el servidor');
    }
  }

  return (
  <div className="users-widget-container" style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>

    <div className="users-widget" style={{background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #eee'}}>
      <h2>Registrar Nuevo Usuario Oficial</h2>
      <form className="users-form">
        <div className="form-row">
          <div className="input-group">
            <label>Correo electrónico institucional</label>
            <input type="email" className="input-box-clean" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Rol del Usuario</label>
            <select className="input-box-clean" value={rolUsuario} onChange={(e) => setRolUsuario(e.target.value)}>
              <option value="Administrador Regional">Administrador Regional</option>
              <option value="Procurador Municipal">Procurador Municipal</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="input-group">
            <label>Municipio Asignado (solo Procurador)</label>
            <select className="input-box-clean" value={municipioAsignado} onChange={(e) => setMunicipioAsignado(e.target.value)} disabled={rolUsuario === 'Administrador Regional'}>
              <option value="">Sin municipio por ahora</option>
              {municipios.map((m) => <option key={m.id_municipio} value={m.id_municipio}>{m.nombre_municipio}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input type="password" className="input-box-clean" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
          </div>
        </div>
        <button type="button" className="btn-black btn-large" onClick={crearUsuario}>Crear Usuario</button>
      </form>
    </div>

    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
        <div className="users-widget" style={{background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #eee'}}>
          <h2>Dar de alta Nuevo Municipio</h2>
          <form className="users-form">
            <div className="input-group" style={{marginBottom: '12px'}}>
              <label>Nombre del Municipio</label>
              <input type="text" className="input-box-clean" placeholder="Ej. Tultitlán" value={nombreMunicipio} onChange={(e) => setNombreMunicipio(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Clave del Municipio</label>
              <input type="text" className="input-box-clean" placeholder="Ej. TUL" value={claveMunicipio} onChange={(e) => setClaveMunicipio(e.target.value)} />
            </div>
            <button type="button" className="btn-black" style={{marginTop: '12px'}} onClick={crearMunicipio}>Registrar Municipio</button>
          </form>
        </div>

        <div className="users-widget" style={{background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #eee'}}>
          <h2>Reasignar Procurador</h2>
          <form className="users-form">
            <div className="input-group" style={{marginBottom: '12px'}}>
              <label>Procurador Actual</label>
              <select className="input-box-clean" value={procuradorElegido} onChange={(e) => setProcuradorElegido(e.target.value)}>
                <option value="">Selecciona procurador...</option>
                {procuradores.map((p) => (
                  <option key={p.id_procurador} value={p.id_procurador}>
                    {p.correo_procurador} ({nombreDeMunicipio(p.id_municipio)})
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{marginBottom: '12px'}}>
              <label>Nuevo Municipio</label>
              <select className="input-box-clean" value={municipioNuevo} onChange={(e) => setMunicipioNuevo(e.target.value)}>
                <option value="">Selecciona municipio...</option>
                {municipios.map((m) => <option key={m.id_municipio} value={m.id_municipio}>{m.nombre_municipio}</option>)}
              </select>
            </div>
            <button type="button" className="btn-black" onClick={reasignarProcurador}>Aplicar Reasignación</button>
          </form>
        </div>
    </div>

    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
        <div className="users-widget" style={{background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #eee'}}>
          <h2>Municipios</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Clave</th>
                <th>Procurador</th>
              </tr>
            </thead>
            <tbody>
              {municipios.map((m) => (
                <tr key={m.id_municipio}>
                  <td>{m.nombre_municipio}</td>
                  <td>{m.clave_municipio}</td>
                  <td>{m.correo_procurador || 'Sin procurador'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="users-widget" style={{background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #eee'}}>
          <h2>Procuradores</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Correo</th>
                <th>Municipio</th>
              </tr>
            </thead>
            <tbody>
              {procuradores.map((p) => (
                <tr key={p.id_procurador}>
                  <td>{p.correo_procurador}</td>
                  <td>{nombreDeMunicipio(p.id_municipio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>

    <div className="users-widget" style={{background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #eee'}}>
      <h2>Administradores</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Correo</th>
          </tr>
        </thead>
        <tbody>
          {administradores.map((a) => (
            <tr key={a.id_administrador}>
              <td>{a.correo_administrador}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
}
