import { useState, useEffect } from "react";
import "./Dashboard.css";

import { initialReportsData } from '../services/mockApi';


const ReportModal = ({ report, onClose, onUpdate, isAdmin }) => {
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('privada');
  if (!report) return null;
  
  const isReadOnly = isAdmin || report.isClosed;

  const handleStatusChange = (e) => {
    if (isAdmin) return;
    onUpdate({ ...report, status: e.target.value, statusClass: 'status-valid' });
  };
  const handleAddNote = () => {
    if (isAdmin) return;
    if (newNote.trim()) {
      const notaFormateada = `[${new Date().toLocaleDateString()}] ${newNote}`;
      if (noteType === 'privada') {
        onUpdate({ ...report, notasPrivadas: [...(report.notasPrivadas || []), notaFormateada] });
      } else {
        onUpdate({ ...report, notasPublicas: [...(report.notasPublicas || []), notaFormateada] });
      }
      setNewNote('');
    }
  };
  const toggleClose = () => {
    onUpdate({ ...report, isClosed: !report.isClosed });
  };
  const toggleDuplicado = () => {
    onUpdate({ ...report, posibleDuplicado: !report.posibleDuplicado });
  };
  const handleMunicipioChange = (e) => {
    if (isAdmin) return;
    onUpdate({ ...report, municipality: e.target.value });
  };
  

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content report-print-area" onClick={e => e.stopPropagation()} style={{maxWidth: '850px', width: '95%'}}>
        <div className="modal-header">
          <h2 style={{display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap'}}>
             Detalle de Reporte: {report.id}
             {report.peligroInmediato && <span style={{background:'#dc3545', color:'white', fontSize:'0.75rem', padding:'4px 8px', borderRadius:'12px'}}>Peligro Inmediato</span>}
             {report.posibleDuplicado && <span style={{background:'#ffc107', color:'#000', fontSize:'0.75rem', padding:'4px 8px', borderRadius:'12px'}}>Posible Duplicado</span>}
             {report.id_caso && <span style={{background:'#17a2b8', color:'white', fontSize:'0.75rem', padding:'4px 8px', borderRadius:'12px'}}>Fusionado en {report.id_caso}</span>}
          </h2>
          <div>
            
            <button className="btn-close" onClick={onClose}>&times;</button>
          </div>
        </div>
        <div className="modal-body" style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap: '25px'}}>
          
          <div className="modal-section left-col">
             <h3 style={{borderBottom:'1px solid #eee', paddingBottom:'8px', marginBottom:'12px'}}>Datos Generales</h3>
             <p style={{margin:'4px 0'}}><strong>Fecha de Registro:</strong> {report.date}</p>
             <p style={{margin:'4px 0'}}><strong>Municipio:</strong> {report.municipality}</p>
             <p style={{margin:'4px 0'}}><strong>Colonia:</strong> {report.colonia || 'No especificada'}</p>
             <p style={{margin:'4px 0'}}><strong>Lugar (Referencia):</strong> {report.nombre_lugar || 'N/A'}</p>
             <p style={{margin:'4px 0'}}><strong>Descripción:</strong> {report.descripcion || 'Sin descripción detallada'}</p>
             
             <h3 style={{borderBottom:'1px solid #eee', paddingBottom:'8px', margin:'20px 0 12px'}}>Detalles de la Situación</h3>
             <p style={{margin:'4px 0'}}><strong>Tipo de Actividad:</strong> {report.activity}</p>
             <p style={{margin:'4px 0'}}><strong>Edad Aproximada:</strong> {report.edad_aproximada || 'Desconocida'}</p>
             <p style={{margin:'4px 0'}}><strong>No. de Menores:</strong> {report.numero_menores || 1}</p>
             <p style={{margin:'4px 0'}}><strong>Horario:</strong> {report.horario || 'N/A'}</p>
             <p style={{margin:'4px 0'}}><strong>Frecuencia:</strong> {report.frecuencia || 'N/A'}</p>
             <p style={{margin:'4px 0'}}><strong>Nivel de Riesgo:</strong> {report.risk}</p>
             
             {report.evidencia_fotografica && (
               <div style={{marginTop:'15px'}}>
                 <strong>Evidencia Fotográfica:</strong><br/>
                 <img src={report.evidencia_fotografica} alt="Evidencia" style={{maxWidth: '100%', marginTop: '10px', borderRadius: '8px', border:'1px solid #ddd'}} />
               </div>
             )}
          </div>

          <div className="modal-section right-col">
             <h3 style={{borderBottom:'1px solid #eee', paddingBottom:'8px', marginBottom:'12px'}}>Gestión del Caso</h3>
             <div className="form-group" style={{marginBottom:'15px'}}>
                <label>Estatus Actual:</label>
                <select value={report.status} onChange={handleStatusChange} disabled={isReadOnly} style={{width:'100%', padding:'8px', borderRadius:'4px'}}>
                   <option value="Registrado">Registrado</option>
                   <option value="En revisión">En revisión</option>
                   <option value="En seguimiento">En seguimiento</option>
                   <option value="Canalizado">Canalizado</option>
                   <option value="Concluido">Concluido</option>
                   <option value="Archivado">Archivado</option>
                   <option value="Cancelado">Cancelado</option>
                   <option value="Reincidente">Reincidente</option>
                </select>
             </div>
             
             {!isAdmin && (
               <div className="form-group" style={{marginBottom:'15px', display:'flex', alignItems:'center', gap:'10px', background:'#fff3cd', padding:'10px', borderRadius:'4px'}}>
                  <input type="checkbox" id="dupCheck" checked={report.posibleDuplicado || false} onChange={toggleDuplicado} disabled={isReadOnly || report.id_caso != null} style={{width:'auto'}} />
                  <label htmlFor="dupCheck" style={{margin:0, fontWeight:'bold', color:'#856404'}}>Marcar como Posible Duplicado</label>
               </div>
             )}

             <div className="form-group" style={{marginBottom:'15px'}}>
               <label>Corregir Municipio (Transferir):</label>
               <select value={report.municipality} onChange={handleMunicipioChange} disabled={isReadOnly || report.id_caso != null} style={{width:'100%', padding:'8px', borderRadius:'4px'}}>
                 {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
               </select>
             </div>

             <div className="notas-container" style={{marginTop: '20px'}}>
               <h4>Bitácora de Notas</h4>
               <div className="notas-list" style={{maxHeight:'150px', overflowY:'auto', background:'#f8f9fa', padding:'10px', borderRadius:'8px', marginBottom:'10px'}}>
                  {report.notasPublicas && report.notasPublicas.length > 0 && <div><strong>Notas Públicas:</strong><ul style={{margin:'5px 0', paddingLeft:'20px'}}>{report.notasPublicas.map((n, i) => <li key={'p'+i} style={{fontSize:'0.85rem'}}>{n}</li>)}</ul></div>}
                  {report.notasPrivadas && report.notasPrivadas.length > 0 && <div style={{marginTop:'10px'}}><strong>Notas Privadas:</strong><ul style={{margin:'5px 0', paddingLeft:'20px'}}>{report.notasPrivadas.map((n, i) => <li key={'pr'+i} style={{fontSize:'0.85rem'}}>{n}</li>)}</ul></div>}
                  {(!report.notasPublicas?.length && !report.notasPrivadas?.length) && <p style={{fontSize:'0.85rem', color:'#666', fontStyle:'italic'}}>No hay notas registradas.</p>}
               </div>
               
               {!isReadOnly && !isAdmin && (
                 <div className="add-note-box">
                   <select value={noteType} onChange={(e)=>setNoteType(e.target.value)} style={{marginBottom:'8px', width:'100%', padding:'8px', borderRadius:'4px'}}>
                     <option value="privada">Nota Interna (Privada)</option>
                     <option value="publica">Mensaje al Ciudadano (Público)</option>
                   </select>
                   <textarea 
                     value={newNote} 
                     onChange={(e)=>setNewNote(e.target.value)} 
                     placeholder="Escribir avance..."
                     style={{width:'100%', minHeight:'60px', padding:'8px', borderRadius:'4px', border:'1px solid #ccc', resize:'vertical'}}
                   ></textarea>
                   <button onClick={handleAddNote} className="btn-save" style={{marginTop:'8px', width:'100%', background:'#28a745', color:'white', border:'none', padding:'10px', borderRadius:'4px', cursor:'pointer'}}>Agregar Nota</button>
                 </div>
               )}
             </div>

             {!isAdmin && (
               <button className={report.isClosed ? 'btn-reopen' : 'btn-close-report'} onClick={toggleClose} style={{width:'100%', marginTop:'20px', padding:'10px', background: report.isClosed ? '#ffc107' : '#dc3545', color: report.isClosed ? 'black' : 'white', border:'none', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}>
                 {report.isClosed ? 'Reabrir Reporte' : 'Cerrar Reporte (Requiere Motivo)'}
               </button>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

const MUNICIPIOS = [
  "ATIZAPÁN DE ZARAGOZA", "NAUCALPAN DE JUÁREZ", "TLALNEPANTLA DE BAZ",
  "CUAUTITLÁN IZCALLI", "VILLA DEL CARBÓN", "NICOLÁS ROMERO", "ISIDRO FABELA",
  "HUIXQUILUCAN", "TEPOTZOTLÁN", "TEOLOYUCAN", "CUAUTITLÁN", "JILOTZINGO",
  "ECATEPEC", "TULTITLÁN", "MELCHOR OCAMPO"
];

// --- SUBCOMPONENTES DE LAS PESTAÑAS ---

// Pestaña: Tablero (Dashboard Principal)
const TableroContent = ({ isAdmin, reports, openModal }) => (
  <>
    <div className="dashboard-top-section">
      <div className="top-left-widget">
        {isAdmin ? (
          <div className="admin-map-widget">
            <div className="map-filters">
              <select defaultValue="">
                <option value="">Todos los Municipios</option>
                {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select defaultValue="">
                <option>Últimos 3 meses</option>
              </select>
              <select defaultValue="">
                <option>Rango de Edad (Todos)</option>
              </select>
              <select defaultValue="">
                <option>Nivel de Riesgo</option>
              </select>
              <button className="btn-black">Filtrar</button>
            </div>
            <div className="map-iframe-container">
              <iframe
                width="100%"
                height="100%"
                scrolling="no"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-99.28%2C19.53%2C-99.24%2C19.57&amp;layer=mapnik"
                style={{ border: "none" }}
                title="Mapa Admin"
              ></iframe>
            </div>
          </div>
        ) : (
          <div className="procurador-alerts-widget">
            <div className="alert-box danger-alert">
              <h3>⚠️ Alerta Peligro Inmediato</h3>
              <p>2 reportes nuevos requieren atención urgente.</p>
            </div>
            <div className="alert-box warning-alert">
              <h3>🔄 Posible Duplicidad</h3>
              <p>Se detectaron 3 reportes en la misma ubicación.</p>
            </div>
          </div>
        )}
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Niños Ident.</span>
          <span className="kpi-value">430</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Invest.</span>
          <span className="kpi-value">125</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">
            {isAdmin ? "Casos Graves" : "Críticos Graves"}
          </span>
          <span className="kpi-value">18</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pendientes</span>
          <span className="kpi-value">54</span>
        </div>
      </div>
    </div>

    <div className="table-widget">
      <h2>
        {isAdmin
          ? "Últimos Reportes Registrados"
          : "Seguimiento de Casos Recientes"}
      </h2>
      <ReportesTable reports={reports} openModal={openModal} />
    </div>
  </>
);

// Pestaña: Mapa (Solo el mapa grande)
const MapaContent = () => (
  <div className="full-map-widget">
    <div className="map-filters-full">
      <select defaultValue="">
        <option>Todos los Municipios</option>
      </select>
      <select defaultValue="">
        <option>Rango de Edad</option>
      </select>
      <select defaultValue="">
        <option>Nivel de Riesgo</option>
      </select>
      <select defaultValue="">
        <option>Estatus</option>
      </select>
      <button className="btn-black">Aplicar Filtros</button>
    </div>
    <div className="map-iframe-container-full">
      <iframe
        width="100%"
        height="100%"
        scrolling="no"
        src="https://www.openstreetmap.org/export/embed.html?bbox=-99.28%2C19.53%2C-99.24%2C19.57&amp;layer=mapnik"
        style={{ border: "none" }}
        title="Mapa Completo"
      ></iframe>
    </div>
  </div>
);

// Pestaña: Reportes (Vista expandida de la tabla)
const ReportesContent = ({ reports, openModal, isAdmin, onMerge }) => {
  const [selectedForMerge, setSelectedForMerge] = useState([]);
  
  // Estados para filtros
  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');
  const [filterMunicipio, setFilterMunicipio] = useState('');
  const [filterEstatus, setFilterEstatus] = useState('');
  const [filterRiesgo, setFilterRiesgo] = useState('');
  const [filterPeligro, setFilterPeligro] = useState(false);
  
  const toggleMergeSelection = (id) => {
    setSelectedForMerge(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  
  const handleMerge = () => {
    if (onMerge) onMerge(selectedForMerge);
    setSelectedForMerge([]);
  };

  // Lógica de filtrado
  const filteredReports = reports.filter(r => {
    if (filterDesde && r.date < filterDesde) return false;
    if (filterHasta && r.date > filterHasta) return false;
    if (filterMunicipio && filterMunicipio !== 'Todos' && r.municipality !== filterMunicipio) return false;
    if (filterEstatus && filterEstatus !== 'Todos' && r.status !== filterEstatus) return false;
    if (filterRiesgo && filterRiesgo !== 'Todos' && r.risk !== filterRiesgo) return false;
    if (filterPeligro && !r.peligroInmediato) return false;
    return true;
  });

  return (
  <div className="full-table-widget">
    <div className="report-filters-header" style={{display: 'flex', justifyContent: 'space-between'}}>
      <h2>Todos los Reportes</h2>
      {isAdmin && selectedForMerge.length > 1 && (
         <button className="btn-black" style={{background: '#dc3545'}} onClick={handleMerge}>🔗 Fusionar {selectedForMerge.length} Casos</button>
      )}
    </div>
    
    <div className="report-filters-controls" style={{marginBottom: '16px', flexWrap: 'wrap', gap: '8px'}}>
        <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>Desde: <input type="date" value={filterDesde} onChange={e => setFilterDesde(e.target.value)} style={{padding:'4px'}} /></label>
        <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>Hasta: <input type="date" value={filterHasta} onChange={e => setFilterHasta(e.target.value)} style={{padding:'4px'}} /></label>
        
        {isAdmin && (
          <select value={filterMunicipio} onChange={e => setFilterMunicipio(e.target.value)} style={{padding:'4px'}}>
            <option value="">Municipio (Todos)</option>
            {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        )}
        
        <select value={filterEstatus} onChange={e => setFilterEstatus(e.target.value)} style={{padding:'4px'}}>
          <option value="">Estatus (Todos)</option>
          <option value="Registrado">Registrado</option>
          <option value="En revisión">En revisión</option>
          <option value="En seguimiento">En seguimiento</option>
          <option value="Canalizado">Canalizado</option>
          <option value="Concluido">Concluido</option>
          <option value="Archivado">Archivado</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Reincidente">Reincidente</option>
        </select>

        <select value={filterRiesgo} onChange={e => setFilterRiesgo(e.target.value)} style={{padding:'4px'}}>
          <option value="">Riesgo (Todos)</option>
          <option value="Bajo">Bajo</option>
          <option value="Medio">Medio</option>
          <option value="Alto">Alto</option>
        </select>

        <label style={{display:'flex', alignItems:'center', gap:'4px', cursor:'pointer', padding:'4px', background:'#fff5f5', borderRadius:'4px'}}>
          <input type="checkbox" checked={filterPeligro} onChange={e => setFilterPeligro(e.target.checked)} />
          🚨 Solo Peligro Inmediato
        </label>
        
        <button className="btn-black" style={{padding:'4px 12px'}} onClick={() => {
            setFilterDesde(''); setFilterHasta(''); setFilterMunicipio(''); 
            setFilterEstatus(''); setFilterRiesgo(''); setFilterPeligro(false);
        }}>Limpiar</button>
    </div>
    <ReportesTable reports={filteredReports} openModal={openModal} fullList isAdmin={isAdmin} selectedForMerge={selectedForMerge} toggleMergeSelection={toggleMergeSelection} />
  </div>
  );
};

// Pestaña: Usuarios (Solo Admin)
const UsuariosContent = () => {
  const [rolUsuario, setRolUsuario] = useState("Procurador Municipal");
  const [municipioAsignado, setMunicipioAsignado] = useState("");
  
  const handleReassign = (e) => {
    e.preventDefault();
    alert("Procurador reasignado con éxito.");
    e.target.reset();
  };

  return (
  <div className="users-widget-container" style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
    
    <div className="users-widget" style={{background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #eee'}}>
      <h2>Registrar Nuevo Usuario Oficial</h2>
      <form className="users-form">
        <div className="form-row">
          <div className="input-group">
            <label>Nombre completo</label>
            <input type="text" className="input-box-clean" />
          </div>
          <div className="input-group">
            <label>Correo electrónico institucional</label>
            <input type="email" className="input-box-clean" />
          </div>
        </div>
        <div className="form-row">
          <div className="input-group">
            <label>Rol del Usuario</label>
            <select className="input-box-clean" value={rolUsuario} onChange={(e) => setRolUsuario(e.target.value)}>
              <option>Selecciona un rol...</option>
              <option value="Administrador Regional">Administrador Regional</option>
              <option value="Procurador Municipal">Procurador Municipal</option>
            </select>
          </div>
          <div className="input-group">
            <label>Municipio Asignado (solo Procurador)</label>
            <select className="input-box-clean" value={municipioAsignado} onChange={(e) => setMunicipioAsignado(e.target.value)} disabled={rolUsuario === "Administrador Regional"}>
              <option value="">Selecciona municipio...</option>
              {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="input-group">
            <label>Contraseña</label>
            <input type="password" className="input-box-clean" />
          </div>
        </div>
        <button type="button" className="btn-black btn-large">Crear Usuario</button>
      </form>
    </div>

    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
        <div className="users-widget" style={{background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #eee'}}>
          <h2>Dar de alta Nuevo Municipio</h2>
          <form className="users-form">
            <div className="input-group" style={{marginBottom: '12px'}}>
              <label>Nombre del Municipio</label>
              <input type="text" className="input-box-clean" placeholder="Ej. Tultitlán" />
            </div>
            <div className="input-group">
              <label>Clave del Municipio</label>
              <input type="text" className="input-box-clean" placeholder="Ej. TUL" />
            </div>
            <button type="button" className="btn-black" style={{marginTop: '12px'}}>Registrar Municipio</button>
          </form>
        </div>

        <div className="users-widget" style={{background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #eee'}}>
          <h2>Reasignar Procurador</h2>
          <form className="users-form" onSubmit={handleReassign}>
            <div className="input-group" style={{marginBottom: '12px'}}>
              <label>Procurador Actual</label>
              <select className="input-box-clean">
                <option>Juan Pérez (Atizapán)</option>
                <option>María López (Naucalpan)</option>
              </select>
            </div>
            <div className="input-group" style={{marginBottom: '12px'}}>
              <label>Nuevo Municipio</label>
              <select className="input-box-clean">
                <option value="">Selecciona municipio...</option>
                {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-black">Aplicar Reasignación</button>
          </form>
        </div>
    </div>
  </div>
);
};

// Componente reutilizable para la tabla

const handleDownloadReport = (report) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Reporte ${report.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; font-size: 14px; line-height: 1.6; color: #333; }
          .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 30px; }
          .row { margin-bottom: 12px; border-bottom: 1px solid #ddd; padding-bottom: 8px; display: flex; }
          strong { width: 180px; flex-shrink: 0; color: #000; }
          .val { flex-grow: 1; }
          .title { font-size: 26px; font-weight: bold; margin: 0; color: #000; text-transform: uppercase; }
          .subtitle { font-size: 14px; color: #666; margin: 8px 0 0 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 class="title">EXPEDIENTE RIETI: ${report.id}</h2>
          <p class="subtitle">Sistema de Protección de Menores - Documento Oficial</p>
        </div>
        <div class="row"><strong>Fecha de Registro:</strong> <div class="val">${report.date}</div></div>
        <div class="row"><strong>Municipio:</strong> <div class="val">${report.municipality}</div></div>
        <div class="row"><strong>Colonia:</strong> <div class="val">${report.colonia || 'No especificada'}</div></div>
        <div class="row"><strong>Lugar:</strong> <div class="val">${report.nombre_lugar || 'N/A'}</div></div>
        <div class="row"><strong>Actividad Detectada:</strong> <div class="val">${report.activity}</div></div>
        <div class="row"><strong>Descripción de los Hechos:</strong> <div class="val">${report.descripcion || 'Sin descripción detallada'}</div></div>
        <div class="row"><strong>Edad Aproximada:</strong> <div class="val">${report.edad_aproximada || 'Desconocida'}</div></div>
        <div class="row"><strong>No. de Menores:</strong> <div class="val">${report.numero_menores || 1}</div></div>
        <div class="row"><strong>Nivel de Riesgo:</strong> <div class="val">${report.risk}</div></div>
        <div class="row"><strong>Estatus Actual:</strong> <div class="val">${report.status}</div></div>
        <script>
          window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

const ReportesTable = ({ reports = [], openModal, fullList = false, isAdmin = false, selectedForMerge = [], toggleMergeSelection }) => {
  const displayReports = fullList ? reports : reports.slice(0, 3);
  return (
  <table className="data-table">
    <thead>
      <tr>
        {isAdmin && fullList && <th>Fusionar</th>}
        <th>Folio</th>
        <th>Fecha</th>
        <th>Municipio</th>
        <th>Actividad</th>
        <th>Nivel de Riesgo</th>
        <th>Estatus</th>
        <th>Alertas</th>
        <th>Acción</th>
      </tr>
    </thead>
    <tbody>
      {displayReports.map(r => (
        <tr key={r.id} style={{background: r.peligroInmediato ? '#fff5f5' : 'inherit'}}>
          {isAdmin && fullList && <td><input type="checkbox" checked={selectedForMerge.includes(r.id)} onChange={() => toggleMergeSelection(r.id)} /></td>}
          <td>{r.id}</td>
          <td>{r.date}</td>
          <td>{r.municipality}</td>
          <td>{r.activity}</td>
          <td><span className={`badge ${r.riskClass}`}>{r.risk}</span></td>
          <td><span className={`badge ${r.statusClass}`}>{r.status}</span></td>
          <td>
            <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
              {r.peligroInmediato && <span style={{background:'#dc3545', color:'white', fontSize:'0.7rem', padding:'2px 6px', borderRadius:'12px', whiteSpace:'nowrap', textAlign:'center'}}>Peligro Inmediato</span>}
              {r.posibleDuplicado && <span style={{background:'#ffc107', color:'black', fontSize:'0.7rem', padding:'2px 6px', borderRadius:'12px', whiteSpace:'nowrap', textAlign:'center'}}>Posible Duplicado</span>}
              {!r.peligroInmediato && !r.posibleDuplicado && <span style={{color:'#aaa', fontSize:'0.8rem', textAlign:'center'}}>-</span>}
            </div>
          </td>
          <td>
             <button className="btn-action" onClick={() => openModal && openModal(r)}>Ver</button>
             <button className="btn-action-icon" onClick={() => handleDownloadReport(r)}>↓</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  );
};

// Pestaña: Métricas y Estadísticas
const MetricasContent = ({ isAdmin }) => {
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="metricas-widget" id="metricas-report">
      <div className="metricas-header">
        <h2>
          {isAdmin
            ? "Métricas Globales (Todos los Municipios)"
            : "Métricas del Municipio"}
        </h2>
        <button className="btn-black" onClick={handleExportPDF}>
          Exportar a PDF
        </button>
      </div>

      <div className="metricas-grid">
        <div className="metricas-card">
          <h3>Tiempos Promedio de Atención</h3>
          <div className="time-stat">
            <span className="time-value">4.5</span>
            <span className="time-unit">horas</span>
            <p className="time-desc">Desde el reporte hasta la validación</p>
          </div>
          <div className="time-stat">
            <span className="time-value">2.1</span>
            <span className="time-unit">días</span>
            <p className="time-desc">Para cierre / canalización</p>
          </div>
        </div>

        <div className="metricas-card">
          <h3>Reportes Agrupados por Zona</h3>
          <div className="bar-chart">
            <div className="bar-row">
              <span className="bar-label">Zona Norte</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: "80%" }}></div>
              </div>
              <span className="bar-value">120</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">Zona Centro</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: "65%" }}></div>
              </div>
              <span className="bar-value">95</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">Zona Sur</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: "40%" }}></div>
              </div>
              <span className="bar-value">45</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">Zona Este</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: "20%" }}></div>
              </div>
              <span className="bar-value">20</span>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="metricas-card full-width">
          <h3>Comparativa Global de Municipios (Todos)</h3>
          <div className="bar-chart" style={{maxHeight: '300px', overflowY: 'auto', paddingRight: '10px'}}>
            {MUNICIPIOS.map((muni, i) => (
              <div className="bar-row" key={i} style={{marginBottom: '10px'}}>
                <span className="bar-label" style={{width: '120px', fontSize: '0.85rem'}}>{muni}</span>
                <div className="bar-track" style={{flex: 1, background: '#eee', height: '12px', borderRadius: '6px', overflow: 'hidden', margin: '0 10px'}}>
                  <div className="bar-fill" style={{ width: `${Math.max(5, 100 - i * 6)}%`, background: '#222', height: '100%' }}></div>
                </div>
                <span className="bar-value" style={{fontWeight: 'bold', width: '30px', textAlign: 'right'}}>{Math.max(10, 450 - i * 30)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (LAYOUT) ---

const CasosContent = ({ casos }) => {
  return (
    <div className="tablero-content">
      <div className="header-actions">
        <h2>Casos Fusionados</h2>
      </div>
      <div className="table-container">
        <table className="reports-table data-table">
          <thead>
            <tr>
              <th>ID Caso</th>
              <th>Fecha Creación</th>
              <th>Reportes Asociados</th>
            </tr>
          </thead>
          <tbody>
            {casos.length === 0 ? (
              <tr><td colSpan="3" style={{textAlign:'center', padding:'20px'}}>No hay casos fusionados.</td></tr>
            ) : (
              casos.map(c => (
                <tr key={c.id_caso}>
                  <td>{c.id_caso}</td>
                  <td>{c.fecha_creacion}</td>
                  <td>{c.reportes.join(', ')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const Dashboard = ({ role = "admin" }) => {
  const isAdmin = role === "admin";
  const [activeTab, setActiveTab] = useState("tablero");
  
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('rieti_reports');
    return saved ? JSON.parse(saved) : initialReportsData;
  });
  const [casos, setCasos] = useState(() => {
    const saved = localStorage.getItem('rieti_casos');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('rieti_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('rieti_casos', JSON.stringify(casos));
  }, [casos]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'rieti_reports' && e.newValue) {
        setReports(JSON.parse(e.newValue));
      }
      if (e.key === 'rieti_casos' && e.newValue) {
        setCasos(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [selectedReport, setSelectedReport] = useState(null);

  const openModal = (report) => setSelectedReport(report);
  const closeModal = () => setSelectedReport(null);

  
  const handleMerge = (selectedForMerge) => {
    const newCasoId = 'CASO-' + Math.floor(Math.random() * 1000);
    const updatedReports = reports.map(r => {
      if (selectedForMerge.includes(r.id)) {
         return { ...r, id_caso: newCasoId, posibleDuplicado: false };
      }
      return r;
    });
    setReports(updatedReports);
    setCasos([...casos, { id_caso: newCasoId, fecha_creacion: new Date().toLocaleDateString('en-CA'), reportes: selectedForMerge }]);
    alert(`¡Casos fusionados con éxito bajo el nuevo ID de Caso ${newCasoId}! Reportes unificados: ${selectedForMerge.join(', ')}`);
  };

  const updateReport = (updatedReport) => {
    setReports(reports.map(r => r.id === updatedReport.id ? updatedReport : r));
    setSelectedReport(updatedReport);
  };

  // Función auxiliar para renderizar el contenido según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case "tablero":
        return <TableroContent isAdmin={isAdmin} reports={reports} openModal={openModal} />;
      case "mapa":
        return <MapaContent />;
      case "casos":
        return <CasosContent casos={casos} />;
      case "reportes":
        return <ReportesContent reports={reports} openModal={openModal} isAdmin={isAdmin} onMerge={handleMerge} />;
      case "metricas":
        return <MetricasContent isAdmin={isAdmin} />;
      case "usuarios":
        return isAdmin ? (
          <UsuariosContent />
        ) : (
          <TableroContent isAdmin={isAdmin} reports={reports} openModal={openModal} />
        );
      default:
        return <TableroContent isAdmin={isAdmin} reports={reports} openModal={openModal} />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo-container">
          <img
            src="/logorieti.jpeg"
            alt="Logo RIETI"
            className="sidebar-logo"
          />
        </div>
        <nav className="sidebar-nav">
          <a href="/">Inicio</a>
          <button
            className={`nav-btn ${activeTab === "tablero" ? "active" : ""}`}
            onClick={() => setActiveTab("tablero")}
          >
            Tablero
          </button>
          <button
            className={`nav-btn ${activeTab === "mapa" ? "active" : ""}`}
            onClick={() => setActiveTab("mapa")}
          >
            Mapa
          </button>
          <button
            className={`nav-btn ${activeTab === "reportes" ? "active" : ""}`}
            onClick={() => setActiveTab("reportes")}
          >
            Reportes
          </button>
          <button
            className={`nav-btn ${activeTab === "casos" ? "active" : ""}`}
            onClick={() => setActiveTab("casos")}
          >
            Casos
          </button>
          <button
            className={`nav-btn ${activeTab === "metricas" ? "active" : ""}`}
            onClick={() => setActiveTab("metricas")}
          >
            Métricas
          </button>
          {isAdmin && (
            <button
              className={`nav-btn ${activeTab === "usuarios" ? "active" : ""}`}
              onClick={() => setActiveTab("usuarios")}>
            Registros
            </button>
          )}
        </nav>
        <div className="sidebar-bottom">
          <h2 className="sidebar-rieti-text">RIETI</h2>
          <a href="/" className="btn-logout">
            Cerrar sesión
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <h1 className="dashboard-title">
          {isAdmin ? "Panel de Administrador Municipal" : "Panel de Procurador"}
        </h1>
        {renderContent()}
      </main>
      <ReportModal report={selectedReport} onClose={closeModal} onUpdate={updateReport} isAdmin={isAdmin} />
    </div>
  );
};
