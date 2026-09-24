import './Reporte.css';

export const Reporte = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Reporte enviado con éxito. Gracias por colaborar.');
  };

  return (
    <div className="report-page-container">
      {/* Capa de desenfoque sobre el fondo */}
      <div className="bg-blur-overlay"></div>

      {/* Navbar de Reporte */}
      <header className="navbar-report">
        <div className="nav-left">
          <span className="logo">RIETI</span>
          <a href="/" className="btn-animated">← Regresar al Inicio</a>
        </div>
      </header>

      <main className="report-main">
        {/* Sección del Mapa */}
        <section className="map-section">
          <div className="map-wrapper">
            <iframe
              width="100%"
              height="100%"
              scrolling="no"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-99.28%2C19.53%2C-99.24%2C19.57&amp;layer=mapnik&amp;marker=19.554%2C-99.26"
              style={{ border: 'none' }}
              title="Mapa de reporte"
            ></iframe>
          </div>
        </section>

        {/* Sección del Formulario con marco limpio */}
        <section className="form-section">
          <div className="form-inner-scroll">
            <div className="form-header">
              <h1>Reporte Ciudadano</h1>
            </div>

            <form className="report-form" onSubmit={handleSubmit}>
              <div id="email-container">
                <input
                  type="email"
                  id="correo-input"
                  placeholder="Ingresa tu correo electrónico"
                  className="input-line"
                  required
                />
                <small className="email-note">
                  * Tu correo es obligatorio para validar el reporte, pero se mantendrá estrictamente confidencial.
                </small>
              </div>

              <div className="form-bottom-grid">
                <select className="input-line dropdown" defaultValue="" required>
                  <option value="" disabled>Selecciona Municipio...</option>
                  <option value="Atizapan">Atizapán</option>
                  <option value="Naucalpan">Naucalpan</option>
                  <option value="Tlalnepantla">Tlalnepantla</option>
                </select>

                <input
                  type="text"
                  placeholder="Calle / Punto de referencia GPS"
                  className="input-line"
                  required
                />

                <select className="input-line dropdown" defaultValue="" required>
                  <option value="" disabled>¿Cuántos observaste?</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5+">5 o más</option>
                  <option value="Nose">No sé</option>
                </select>

                <select className="input-line dropdown" defaultValue="" required>
                  <option value="" disabled>Edad aproximada</option>
                  <option value="0-5">0-5 años</option>
                  <option value="6-11">6-11 años</option>
                  <option value="12-14">12-14 años</option>
                  <option value="15-17">15-17 años</option>
                  <option value="Nose">No sé</option>
                </select>

                <select className="input-line dropdown" defaultValue="" required>
                  <option value="" disabled>¿Qué estaban haciendo?</option>
                  <option value="Venta">Venta ambulante</option>
                  <option value="Limpia">Limpieza de parabrisas</option>
                  <option value="Mendicidad">Mendicidad</option>
                  <option value="Carga">Carga y descarga</option>
                  <option value="Otra">Otra actividad</option>
                </select>

                <select className="input-line dropdown" defaultValue="" required>
                  <option value="" disabled>¿Situación de riesgo observada?</option>
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                  <option value="Nose">No sé</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Cuéntanos brevemente qué observaste"
                className="input-line description-line"
                required
              />

              <div className="upload-container">
                <label htmlFor="evidencia-upload" className="btn-animated">
                  Cargar Fotografía (Opcional)
                </label>
                <input
                  type="file"
                  id="evidencia-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <p className="warning-text">
                  ⚠️ <strong>Importante:</strong> Evita tomar fotografías que pongan en riesgo a niñas, niños o adolescentes. La fotografía es opcional y preferentemente del lugar.
                </p>
              </div>

              <button type="submit" className="btn-animated btn-submit-large">
                Enviar Reporte
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};