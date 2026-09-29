-- =============================================
-- base de datos proteccion_menores
-- script 1: tablas
-- =============================================

DROP DATABASE IF EXISTS proteccion_menores;
CREATE DATABASE proteccion_menores;
USE proteccion_menores;

-- =============================================
-- catálogo base
-- =============================================

CREATE TABLE Administrador (
    id_administrador INT AUTO_INCREMENT PRIMARY KEY,
    correo_administrador VARCHAR(100) NOT NULL UNIQUE,
    contrasena_administrador VARCHAR(255) NOT NULL
);

-- clave_municipio: se usa para formar el folio (RIETI-ATZ-000001)
CREATE TABLE Municipio (
    id_municipio INT AUTO_INCREMENT PRIMARY KEY,
    nombre_municipio VARCHAR(100) NOT NULL UNIQUE,
    clave_municipio VARCHAR(5) NOT NULL UNIQUE
);

-- tabla intermedia N:M
CREATE TABLE Administrador_Municipio (
    id_administrador INT NOT NULL,
    id_municipio INT NOT NULL,
    PRIMARY KEY (id_administrador, id_municipio),
    FOREIGN KEY (id_administrador) REFERENCES Administrador(id_administrador),
    FOREIGN KEY (id_municipio) REFERENCES Municipio(id_municipio)
);

-- UNIQUE en id_municipio: un solo procurador por municipio
CREATE TABLE Procurador (
    id_procurador INT AUTO_INCREMENT PRIMARY KEY,
    correo_procurador VARCHAR(100) NOT NULL UNIQUE,
    contrasena_procurador VARCHAR(255) NOT NULL,
    id_municipio INT UNIQUE,
    FOREIGN KEY (id_municipio) REFERENCES Municipio(id_municipio)
);

-- =============================================
-- reportes y casos
-- =============================================

CREATE TABLE Casos (
    id_caso INT AUTO_INCREMENT PRIMARY KEY,
    estatus_caso VARCHAR(50) NOT NULL,
    fecha_creacion DATE NOT NULL,
    fecha_cierre DATE,
    id_procurador_responsable INT,
    FOREIGN KEY (id_procurador_responsable) REFERENCES Procurador(id_procurador)
);

CREATE TABLE Reporte (
    id_folio_reporte VARCHAR(20) PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    tipo_actividad VARCHAR(100) NOT NULL,
    edad_aproximada VARCHAR(50) NOT NULL,
    numero_menores INT NOT NULL,
    horario VARCHAR(50) NOT NULL,
    nombre_lugar VARCHAR(100),
    frecuencia VARCHAR(50) NOT NULL,
    colonia VARCHAR(100),
    latitud DECIMAL(10,6) NOT NULL,
    longitud DECIMAL(10,6) NOT NULL,
    correo VARCHAR(100),
    estatus VARCHAR(50) NOT NULL DEFAULT 'Registrado',
    peligro_inmediato BOOLEAN NOT NULL DEFAULT FALSE,
    posible_duplicado BOOLEAN NOT NULL DEFAULT FALSE,
    nivel_riesgo VARCHAR(50),
    evidencia_fotografica VARCHAR(255),
    detalles_cierre VARCHAR(255),
    fecha_registro DATETIME NOT NULL,
    fecha_cierre DATETIME,
    id_municipio INT NOT NULL,
    id_procurador INT,
    id_caso INT,
    FOREIGN KEY (id_municipio) REFERENCES Municipio(id_municipio),
    FOREIGN KEY (id_procurador) REFERENCES Procurador(id_procurador),
    FOREIGN KEY (id_caso) REFERENCES Casos(id_caso)
);

-- una nota pertenece a un reporte o a un caso, nunca a ninguno
CREATE TABLE Notas_Avance_Reporte (
    id_avance INT AUTO_INCREMENT PRIMARY KEY,
    descripcion_avance VARCHAR(255) NOT NULL,
    descripcion_publica VARCHAR(255),
    fecha_registro DATETIME NOT NULL,
    id_folio_reporte VARCHAR(20),
    id_caso INT,
    FOREIGN KEY (id_folio_reporte) REFERENCES Reporte(id_folio_reporte),
    FOREIGN KEY (id_caso) REFERENCES Casos(id_caso),
    CONSTRAINT chk_nota_tiene_destino
    CHECK (id_folio_reporte IS NOT NULL OR id_caso IS NOT NULL)
);

-- =============================================
-- auditoría
-- =============================================

-- UNIQUE en id_folio_reporte: una sola bitácora por reporte
CREATE TABLE Bitacora (
    id_bitacora INT AUTO_INCREMENT PRIMARY KEY,
    id_folio_reporte VARCHAR(20) NOT NULL UNIQUE,
    FOREIGN KEY (id_folio_reporte) REFERENCES Reporte(id_folio_reporte)
);

CREATE TABLE Entrada (
    id_entrada INT AUTO_INCREMENT PRIMARY KEY,
    campo_modificado VARCHAR(100) NOT NULL,
    valor_anterior VARCHAR(255),
    valor_nuevo VARCHAR(255),
    fecha_cambio DATETIME NOT NULL,
    id_bitacora INT NOT NULL,
    FOREIGN KEY (id_bitacora) REFERENCES Bitacora(id_bitacora)
);
