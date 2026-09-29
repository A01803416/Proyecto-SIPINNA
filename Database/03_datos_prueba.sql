
USE proteccion_menores;

-- municipios
INSERT INTO Municipio (nombre_municipio, clave_municipio) VALUES ('Atizapán de Zaragoza', 'ATZ');
SET @atz = LAST_INSERT_ID();
INSERT INTO Municipio (nombre_municipio, clave_municipio) VALUES ('Naucalpan de Juárez', 'NAU');
SET @nau = LAST_INSERT_ID();
INSERT INTO Municipio (nombre_municipio, clave_municipio) VALUES ('Tlalnepantla de Baz', 'TLA');
SET @tla = LAST_INSERT_ID();

-- administrador
INSERT INTO Administrador (correo_administrador, contrasena_administrador)
VALUES ('admin@rieti.local', 'Admin#Rieti2026');

-- procuradores, primero el insert sin municipio y luego el procedure que lo asigna
INSERT INTO Procurador (correo_procurador, contrasena_procurador)
VALUES ('procurador.atz@rieti.local', 'Procurador#ATZ26');
CALL sp_asignar_procurador_municipio(LAST_INSERT_ID(), @atz);

INSERT INTO Procurador (correo_procurador, contrasena_procurador)
VALUES ('procurador.nau@rieti.local', 'Procurador#NAU26');
CALL sp_asignar_procurador_municipio(LAST_INSERT_ID(), @nau);

INSERT INTO Procurador (correo_procurador, contrasena_procurador)
VALUES ('procurador.tla@rieti.local', 'Procurador#TLA26');
CALL sp_asignar_procurador_municipio(LAST_INSERT_ID(), @tla);


-- atizapan
CALL sp_registrar_reporte(
    'Dos niños piden dinero entre los autos en el semáforo, un adulto los vigila desde la banqueta.',
    'Mendicidad forzada', '6-11 años', 2, 'Tarde (12:00-19:00)',
    'Semáforo frente a Plaza Cristal', 'Diario', 'Lomas de Atizapán',
    19.558210, -99.251340, 'ana.martinez@correo.com', FALSE, 'Medio', NULL, @atz, @folio);

CALL sp_registrar_reporte(
    'Adolescente cargando material pesado en una obra sin equipo de protección.',
    'Trabajo peligroso', '15-17 años', 1, 'Mañana (7:00-12:00)',
    'Obra en construcción sobre Av. Adolfo López Mateos', 'Entre semana', 'Ciudad López Mateos',
    19.561470, -99.247820, NULL, TRUE, 'Alto', NULL, @atz, @folio);

CALL sp_registrar_reporte(
    'Niña vendiendo dulces de mesa en mesa hasta muy tarde en la noche.',
    'Otra situación de explotación y/o vulneración', '6-11 años', 1, 'Noche (19:00-24:00)',
    'Zona de restaurantes de Las Alamedas', 'Fines de semana', 'Las Alamedas',
    19.549930, -99.232150, 'luis.hdz@correo.com', FALSE, 'Bajo', NULL, @atz, @folio);

CALL sp_registrar_reporte(
    'Grupo de menores que al parecer entregan paquetes a cambio de dinero cerca de la escuela.',
    'Utilización para actividades ilícitas', '12-14 años', 3, 'Tarde (12:00-19:00)',
    NULL, 'Varias veces por semana', 'El Chaparral',
    19.573410, -99.264580, NULL, TRUE, 'Alto', NULL, @atz, @folio);

-- naucalpan
CALL sp_registrar_reporte(
    'Niño limpiando parabrisas en el crucero, se mete entre los carros en movimiento.',
    'Trabajo peligroso', '6-11 años', 1, 'Mañana (7:00-12:00)',
    'Crucero Periférico y Av. Gustavo Baz', 'Diario', 'San Bartolo Naucalpan',
    19.476520, -99.232780, 'maria.lopez@correo.com', TRUE, 'Alto', NULL, @nau, @folio);

CALL sp_registrar_reporte(
    'Una mujer con tres niños pequeños pide dinero, los niños se ven desnutridos.',
    'Mendicidad forzada', '0-5 años', 3, 'Tarde (12:00-19:00)',
    'Entrada del metro Cuatro Caminos', 'Diario', 'Industrial Alce Blanco',
    19.459120, -99.216430, NULL, FALSE, 'Medio', NULL, @nau, @folio);

CALL sp_registrar_reporte(
    'Adolescente atendiendo un puesto de fierro viejo, maneja material cortante.',
    'Trabajo peligroso', '12-14 años', 1, 'Mañana (7:00-12:00)',
    'Tianguis de los martes', 'Una vez por semana', 'El Molinito',
    19.463870, -99.249910, 'jorge.ruiz@correo.com', FALSE, 'Medio', NULL, @nau, @folio);

-- tlalnepantla
CALL sp_registrar_reporte(
    'Menores descargando cajas de un camión en la madrugada dentro del mercado.',
    'Trabajo peligroso', '12-14 años', 2, 'Madrugada (0:00-7:00)',
    'Mercado de San Juan Ixhuatepec', 'Diario', 'San Juan Ixhuatepec',
    19.515630, -99.107450, 'carmen.vega@correo.com', FALSE, 'Medio', NULL, @tla, @folio);

CALL sp_registrar_reporte(
    'Se ve a una adolescente acompañada de adultos distintos cada noche en la misma esquina.',
    'Explotación sexual', '15-17 años', 1, 'Noche (19:00-24:00)',
    'Esquina de la central de autobuses', 'Varias veces por semana', 'Centro de Tlalnepantla',
    19.537820, -99.193410, NULL, TRUE, 'Alto', NULL, @tla, @folio);

CALL sp_registrar_reporte(
    'Niño vendiendo chicles en el transporte público, dice que su tío lo trae todos los días.',
    'Mendicidad forzada', '6-11 años', 1, 'Mañana (7:00-12:00)',
    'Ruta de camión Tlalnepantla - Indios Verdes', 'Diario', 'Valle Dorado',
    19.542260, -99.212640, 'pedro.sanchez@correo.com', FALSE, 'Bajo', NULL, @tla, @folio);

-- revision en fa de lo que quedo cargado
SELECT r.id_folio_reporte, m.clave_municipio, p.correo_procurador, IFNULL(r.correo, 'anonimo') AS correo
FROM Reporte r
JOIN Municipio m ON r.id_municipio = m.id_municipio
LEFT JOIN Procurador p ON r.id_procurador = p.id_procurador
ORDER BY r.id_folio_reporte;
