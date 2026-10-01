-- base de datos proteccion_menores
-- script 2: funciones, triggers y procedures

USE proteccion_menores;

DROP FUNCTION IF EXISTS fn_es_estatus_final;
DROP FUNCTION IF EXISTS fn_generar_folio;

DROP TRIGGER IF EXISTS trg_reporte_crear_bitacora;
DROP TRIGGER IF EXISTS trg_reporte_control_cierre;
DROP TRIGGER IF EXISTS trg_reporte_auditar;
DROP TRIGGER IF EXISTS trg_caso_propagar_estatus;

DROP PROCEDURE IF EXISTS sp_registrar_reporte;
DROP PROCEDURE IF EXISTS sp_cambiar_estatus_reporte;
DROP PROCEDURE IF EXISTS sp_registrar_nota;
DROP PROCEDURE IF EXISTS sp_corregir_municipio;
DROP PROCEDURE IF EXISTS sp_marcar_posible_duplicado;
DROP PROCEDURE IF EXISTS sp_asignar_procurador_municipio;
DROP PROCEDURE IF EXISTS sp_fusionar_reportes;

DELIMITER $$


-- FUNCIONES

-- regresa TRUE si el estatus significa que el reporte está cerrado
CREATE FUNCTION fn_es_estatus_final(p_estatus VARCHAR(50))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
-- Comprueba si el estatus ingresado está en la lista de estatus finales
    RETURN p_estatus IN ('Concluido', 'Archivado', 'Cancelado');
END $$


-- genera el siguiente folio del municipio con formato RIETI-ATZ-000001
-- el consecutivo es independiente para cada municipio
CREATE FUNCTION fn_generar_folio(p_id_municipio INT)
RETURNS VARCHAR(20)
READS SQL DATA
BEGIN
    DECLARE v_clave VARCHAR(5);
    DECLARE v_siguiente INT;

    -- buscamos la clave del municipio según su ID
    SET v_clave = (SELECT clave_municipio FROM Municipio WHERE id_municipio = p_id_municipio);

    -- buscamos el folio con el numero mas alto para ese municipio especifico
    -- Extraemos la parte numerca con SUBSTRING_INDEX, la convertimos a número con CAST y luego tomamos el número máximo
    -- si no existe ningun reporte registrado para ese municipio, IFNULL lo convierte en 0 y le suma 1
    SELECT IFNULL(MAX(CAST(SUBSTRING_INDEX(id_folio_reporte, '-', -1) AS UNSIGNED)), 0) + 1
    INTO v_siguiente
    FROM Reporte
    WHERE id_folio_reporte LIKE CONCAT('RIETI-', v_clave, '-%');

    -- armamos el folio concatenando el prefijo, la clave y formateando el numero con 6 ceros a la izquierda 
    RETURN CONCAT('RIETI-', v_clave, '-', LPAD(v_siguiente, 6, '0'));
END $$


-- TRIGGERS

-- todo reporte nace con su bitácora
CREATE TRIGGER trg_reporte_crear_bitacora
AFTER INSERT ON Reporte
FOR EACH ROW
BEGIN
    -- inserta en bitacora el id del folio recien creado
    INSERT INTO Bitacora (id_folio_reporte) VALUES (NEW.id_folio_reporte);
END $$


-- fecha_cierre se llena sola al cerrar y se limpia al reabrir
-- al cerrar, la marca de posible duplicado se apaga porque ya no se puede fusionar
CREATE TRIGGER trg_reporte_control_cierre
BEFORE UPDATE ON Reporte
FOR EACH ROW
BEGIN
        -- si el nuevo estatus es final y antes no lo era:
    IF fn_es_estatus_final(NEW.estatus) AND NOT fn_es_estatus_final(OLD.estatus) THEN
        SET NEW.fecha_cierre = NOW(); -- asigna automaticamente la fecha y hora de cierre actual
        SET NEW.posible_duplicado = FALSE;  -- como ya se cerro, desactivamos la bandera de duplicado

        -- si el nuevo estatus no es final y antes si lo era:
    ELSEIF NOT fn_es_estatus_final(NEW.estatus) AND fn_es_estatus_final(OLD.estatus) THEN
        SET NEW.fecha_cierre = NULL; -- limpia la fecha de cierre
        SET NEW.detalles_cierre = NULL; -- limpia los detalles de cierre
    END IF;
END $$


-- cada cambio relevante de un reporte queda como entrada en su bitácora
CREATE TRIGGER trg_reporte_auditar
AFTER UPDATE ON Reporte
FOR EACH ROW
BEGIN
    DECLARE v_id_bitacora INT;

    -- obtenemos el id de la bitacora correspondiente a este reporte
    SET v_id_bitacora = (SELECT id_bitacora FROM Bitacora
                         WHERE id_folio_reporte = NEW.id_folio_reporte);

    -- para el estatus
    IF NOT (OLD.estatus <=> NEW.estatus) THEN
        INSERT INTO Entrada (campo_modificado, valor_anterior, valor_nuevo, fecha_cambio, id_bitacora)
        VALUES ('estatus', OLD.estatus, NEW.estatus, NOW(), v_id_bitacora);
    END IF;

    -- para el municipio
    IF NOT (OLD.id_municipio <=> NEW.id_municipio) THEN
        INSERT INTO Entrada (campo_modificado, valor_anterior, valor_nuevo, fecha_cambio, id_bitacora)
        VALUES ('id_municipio', CAST(OLD.id_municipio AS CHAR), CAST(NEW.id_municipio AS CHAR), NOW(), v_id_bitacora);
    END IF;

    -- para el procurador
    IF NOT (OLD.id_procurador <=> NEW.id_procurador) THEN
        INSERT INTO Entrada (campo_modificado, valor_anterior, valor_nuevo, fecha_cambio, id_bitacora)
        VALUES ('id_procurador', CAST(OLD.id_procurador AS CHAR), CAST(NEW.id_procurador AS CHAR), NOW(), v_id_bitacora);
    END IF;

    -- para el caso
    IF NOT (OLD.id_caso <=> NEW.id_caso) THEN
        INSERT INTO Entrada (campo_modificado, valor_anterior, valor_nuevo, fecha_cambio, id_bitacora)
        VALUES ('id_caso', CAST(OLD.id_caso AS CHAR), CAST(NEW.id_caso AS CHAR), NOW(), v_id_bitacora);
    END IF;

    -- para el posible duplicado
    IF NOT (OLD.posible_duplicado <=> NEW.posible_duplicado) THEN
        INSERT INTO Entrada (campo_modificado, valor_anterior, valor_nuevo, fecha_cambio, id_bitacora)
        VALUES ('posible_duplicado', CAST(OLD.posible_duplicado AS CHAR), CAST(NEW.posible_duplicado AS CHAR), NOW(), v_id_bitacora);
    END IF;
END $$


-- el estatus de un caso siempre se copia a todos sus reportes
CREATE TRIGGER trg_caso_propagar_estatus
AFTER UPDATE ON Casos
FOR EACH ROW
BEGIN
    -- si el estatus del caso cambio
    IF NOT (OLD.estatus_caso <=> NEW.estatus_caso) THEN
        -- le ponemos el mismo estatus a todos los reportes que pertenezcan a este caso
        UPDATE Reporte
        SET estatus = NEW.estatus_caso
        WHERE id_caso = NEW.id_caso;
    END IF;
END $$


-- PROCEDURES: CIUDADANO (app)

-- registra un reporte nuevo y regresa su folio
-- p_id_municipio el plan es que lo resuelva solo el backend a partir de latitud y longitud
-- p_correo NULL o vacío = reporte anónimo, osea no le damos folio
CREATE PROCEDURE sp_registrar_reporte(
    IN p_descripcion VARCHAR(255),
    IN p_tipo_actividad VARCHAR(100),
    IN p_edad_aproximada VARCHAR(50),
    IN p_numero_menores INT,
    IN p_horario VARCHAR(50),
    IN p_nombre_lugar VARCHAR(100),
    IN p_frecuencia VARCHAR(50),
    IN p_colonia VARCHAR(100),
    IN p_latitud DECIMAL(10,6),
    IN p_longitud DECIMAL(10,6),
    IN p_correo VARCHAR(100),
    IN p_peligro_inmediato BOOLEAN,
    IN p_nivel_riesgo VARCHAR(50),
    IN p_evidencia_fotografica VARCHAR(255),
    IN p_id_municipio INT,
    OUT p_folio VARCHAR(20)
)
BEGIN
    DECLARE v_existe_municipio INT;
    DECLARE v_id_procurador INT;

    -- verificar si el municipio existe
    SELECT COUNT(*) INTO v_existe_municipio FROM Municipio WHERE id_municipio = p_id_municipio;
    IF v_existe_municipio = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El municipio no existe';
    END IF;

    -- verificar que el numero de ninos involucrados sea al menos 1
    IF p_numero_menores IS NULL OR p_numero_menores <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El número de menores debe ser mayor a cero';
    END IF;

    -- el reporte queda asignado al procurador de su municipio 
    SET v_id_procurador = (SELECT id_procurador FROM Procurador WHERE id_municipio = p_id_municipio);

    -- generacion del folio mediante la funcion
    SET p_folio = fn_generar_folio(p_id_municipio);

    -- insertamos datos en la tabla
    INSERT INTO Reporte (
        id_folio_reporte, descripcion, tipo_actividad, edad_aproximada, numero_menores,
        horario, nombre_lugar, frecuencia, colonia, latitud, longitud, correo,
        estatus, peligro_inmediato, nivel_riesgo, evidencia_fotografica,
        fecha_registro, id_municipio, id_procurador, id_caso
    ) VALUES (
        p_folio, p_descripcion, p_tipo_actividad, p_edad_aproximada, p_numero_menores,
        p_horario, p_nombre_lugar, p_frecuencia, p_colonia, p_latitud, p_longitud,
        NULLIF(LOWER(TRIM(p_correo)), ''),
        'Registrado', IFNULL(p_peligro_inmediato, FALSE), p_nivel_riesgo, p_evidencia_fotografica,
        NOW(), p_id_municipio, v_id_procurador, NULL
    );
END $$


-- PROCEDURES: PROCURADOR

-- cambiar estatus, cerrar y reabrir
-- si el nuevo estatus es de cierre, p_detalles_cierre es obligatorio
-- si el reporte está fusionado, el cambio se aplica a todo el caso
CREATE PROCEDURE sp_cambiar_estatus_reporte(
    IN p_folio VARCHAR(20),
    IN p_id_procurador INT,
    IN p_nuevo_estatus VARCHAR(50),
    IN p_detalles_cierre VARCHAR(255)
)
BEGIN
    DECLARE v_existe INT;
    DECLARE v_estatus_actual VARCHAR(50);
    DECLARE v_id_procurador_reporte INT;
    DECLARE v_id_caso INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- verificamos que el reporte existe
    SELECT COUNT(*) INTO v_existe FROM Reporte WHERE id_folio_reporte = p_folio;
    IF v_existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte no existe';
    END IF;

    -- obtenemos el estatus, el procurador asignado y el caso del reporte
    SELECT estatus, id_procurador, id_caso
    INTO v_estatus_actual, v_id_procurador_reporte, v_id_caso
    FROM Reporte WHERE id_folio_reporte = p_folio;

    -- verificamos que el procurador que ejecuta tiene permisos sobre este reporte
    IF v_id_procurador_reporte IS NULL OR v_id_procurador_reporte <> p_id_procurador THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte no pertenece al municipio de este procurador';
    END IF;

    -- verificamos que el nuevo estatus enviado es valido dentro de la lista oficial
    IF p_nuevo_estatus NOT IN ('Registrado', 'En revisión', 'En seguimiento', 'Canalizado',
                               'Concluido', 'Archivado', 'Cancelado', 'Reincidente') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El estatus no pertenece al catálogo oficial';
    END IF;

    -- verificamos que no se intento cambiar al mismo estatus que ya tenia
    IF p_nuevo_estatus = v_estatus_actual THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte ya tiene ese estatus';
    END IF;

    -- verificamos que si es un estatus de cierre, se especifique el motivo de cierre
    IF fn_es_estatus_final(p_nuevo_estatus) AND (p_detalles_cierre IS NULL OR TRIM(p_detalles_cierre) = '') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Para cerrar un reporte se requiere el motivo de cierre';
    END IF;

    START TRANSACTION;

    IF v_id_caso IS NULL THEN
        -- reporte individual
        UPDATE Reporte
        SET estatus = p_nuevo_estatus,
            detalles_cierre = CASE WHEN fn_es_estatus_final(p_nuevo_estatus) THEN p_detalles_cierre ELSE NULL END
        WHERE id_folio_reporte = p_folio;
    ELSE
        -- reporte fusionado: se cambia el caso y el trigger ya lo propaga a sus reportes
        UPDATE Casos
        SET estatus_caso = p_nuevo_estatus,
            fecha_cierre = CASE
                               WHEN fn_es_estatus_final(p_nuevo_estatus) AND fecha_cierre IS NULL THEN CURDATE()
                               WHEN fn_es_estatus_final(p_nuevo_estatus) THEN fecha_cierre
                               ELSE NULL
                           END
        WHERE id_caso = v_id_caso;

        -- actualizamos los detalles de cierre directamente en los reportes del caso
        UPDATE Reporte
        SET detalles_cierre = CASE WHEN fn_es_estatus_final(p_nuevo_estatus) THEN p_detalles_cierre ELSE NULL END
        WHERE id_caso = v_id_caso;
    END IF;

    COMMIT;
END $$


-- registrar nota de avance
-- si el reporte está fusionado, la nota se guarda a nivel del caso
CREATE PROCEDURE sp_registrar_nota(
    IN p_folio VARCHAR(20),
    IN p_id_procurador INT,
    IN p_descripcion_avance VARCHAR(255),
    IN p_descripcion_publica VARCHAR(255)
)
BEGIN
    DECLARE v_existe INT;
    DECLARE v_id_procurador_reporte INT;
    DECLARE v_id_caso INT;

    SELECT COUNT(*) INTO v_existe FROM Reporte WHERE id_folio_reporte = p_folio;
    IF v_existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte no existe';
    END IF;

    -- obtenemos procurador y caso
    SELECT id_procurador, id_caso INTO v_id_procurador_reporte, v_id_caso
    FROM Reporte WHERE id_folio_reporte = p_folio;

    IF v_id_procurador_reporte IS NULL OR v_id_procurador_reporte <> p_id_procurador THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte no pertenece al municipio de este procurador';
    END IF;

    IF p_descripcion_avance IS NULL OR TRIM(p_descripcion_avance) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La nota de avance no puede estar vacía';
    END IF;

    -- si es un reporte individual, se enlaza al folio. si esta en un caso, se enlaza al caso.
    IF v_id_caso IS NULL THEN
        INSERT INTO Notas_Avance_Reporte (descripcion_avance, descripcion_publica, fecha_registro, id_folio_reporte, id_caso)
        VALUES (p_descripcion_avance, p_descripcion_publica, NOW(), p_folio, NULL);
    ELSE
        INSERT INTO Notas_Avance_Reporte (descripcion_avance, descripcion_publica, fecha_registro, id_folio_reporte, id_caso)
        VALUES (p_descripcion_avance, p_descripcion_publica, NOW(), NULL, v_id_caso);
    END IF;
END $$


-- corregir el municipio de un reporte mal catalogado
-- el reporte pasa automáticamente al procurador del nuevo municipio
CREATE PROCEDURE sp_corregir_municipio(
    IN p_folio VARCHAR(20),
    IN p_id_procurador INT,
    IN p_id_municipio_nuevo INT
)
BEGIN
    DECLARE v_existe INT;
    DECLARE v_existe_municipio INT;
    DECLARE v_id_procurador_reporte INT;
    DECLARE v_id_municipio_actual INT;
    DECLARE v_id_caso INT;
    DECLARE v_id_procurador_nuevo INT;

    SELECT COUNT(*) INTO v_existe FROM Reporte WHERE id_folio_reporte = p_folio;
    IF v_existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte no existe';
    END IF;

    SELECT id_procurador, id_municipio, id_caso
    INTO v_id_procurador_reporte, v_id_municipio_actual, v_id_caso
    FROM Reporte WHERE id_folio_reporte = p_folio;

    IF v_id_procurador_reporte IS NULL OR v_id_procurador_reporte <> p_id_procurador THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte no pertenece al municipio de este procurador';
    END IF;

    SELECT COUNT(*) INTO v_existe_municipio FROM Municipio WHERE id_municipio = p_id_municipio_nuevo;
    IF v_existe_municipio = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El municipio nuevo no existe';
    END IF;

    IF v_id_municipio_actual = p_id_municipio_nuevo THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte ya pertenece a ese municipio';
    END IF;

    IF v_id_caso IS NOT NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede corregir el municipio de un reporte fusionado en un caso';
    END IF;

    -- buscamos el procurador asignado al nuevo municipio
    SET v_id_procurador_nuevo = (SELECT id_procurador FROM Procurador WHERE id_municipio = p_id_municipio_nuevo);

    -- transferimos el reporte al nuevo municipio y al nuevo procurador
    UPDATE Reporte
    SET id_municipio = p_id_municipio_nuevo,
        id_procurador = v_id_procurador_nuevo
    WHERE id_folio_reporte = p_folio;
END $$


-- marcar o desmarcar un reporte como posible duplicado
-- sirve de aviso para que el administrador revise y decida si fusiona
CREATE PROCEDURE sp_marcar_posible_duplicado(
    IN p_folio VARCHAR(20),
    IN p_id_procurador INT,
    IN p_valor BOOLEAN
)
BEGIN
    DECLARE v_existe INT;
    DECLARE v_id_procurador_reporte INT;
    DECLARE v_id_caso INT;
    DECLARE v_estatus VARCHAR(50);
    DECLARE v_valor_actual BOOLEAN;

    SELECT COUNT(*) INTO v_existe FROM Reporte WHERE id_folio_reporte = p_folio;
    IF v_existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte no existe';
    END IF;

    SELECT id_procurador, id_caso, estatus, posible_duplicado
    INTO v_id_procurador_reporte, v_id_caso, v_estatus, v_valor_actual
    FROM Reporte WHERE id_folio_reporte = p_folio;

    IF v_id_procurador_reporte IS NULL OR v_id_procurador_reporte <> p_id_procurador THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte no pertenece al municipio de este procurador';
    END IF;

    IF p_valor IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Se debe indicar si se marca o se desmarca el reporte';
    END IF;

    IF p_valor = v_valor_actual THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte ya tiene ese valor de posible duplicado';
    END IF;

    IF p_valor = TRUE AND v_id_caso IS NOT NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El reporte ya pertenece a un caso fusionado';
    END IF;

    IF p_valor = TRUE AND fn_es_estatus_final(v_estatus) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede marcar como duplicado un reporte cerrado';
    END IF;

    -- actualizamos la marca de duplicado
    UPDATE Reporte SET posible_duplicado = p_valor WHERE id_folio_reporte = p_folio;
END $$


-- PROCEDURES: ADMINISTRADOR

-- asignar o reasignar un procurador a un municipio
-- los reportes y casos del municipio pasan al procurador nuevo
CREATE PROCEDURE sp_asignar_procurador_municipio(
    IN p_id_procurador INT,
    IN p_id_municipio INT
)
BEGIN
    DECLARE v_existe_procurador INT;
    DECLARE v_existe_municipio INT;
    DECLARE v_municipio_anterior INT;
    DECLARE v_procurador_anterior INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT COUNT(*) INTO v_existe_procurador FROM Procurador WHERE id_procurador = p_id_procurador;
    IF v_existe_procurador = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El procurador no existe';
    END IF;

    SELECT COUNT(*) INTO v_existe_municipio FROM Municipio WHERE id_municipio = p_id_municipio;
    IF v_existe_municipio = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El municipio no existe';
    END IF;

    -- obtenemos asignaciones previas
    SET v_municipio_anterior = (SELECT id_municipio FROM Procurador WHERE id_procurador = p_id_procurador);
    SET v_procurador_anterior = (SELECT id_procurador FROM Procurador WHERE id_municipio = p_id_municipio);

    IF v_municipio_anterior <=> p_id_municipio THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El procurador ya está asignado a ese municipio';
    END IF;

    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    START TRANSACTION;

    -- el municipio destino se libera de su procurador anterior
    IF v_procurador_anterior IS NOT NULL THEN
        UPDATE Procurador SET id_municipio = NULL WHERE id_procurador = v_procurador_anterior;
    END IF;

    -- el municipio que deja el procurador se queda sin responsable
    IF v_municipio_anterior IS NOT NULL THEN
        UPDATE Reporte SET id_procurador = NULL WHERE id_municipio = v_municipio_anterior;
        UPDATE Casos SET id_procurador_responsable = NULL WHERE id_procurador_responsable = p_id_procurador;
    END IF;

    -- se asigna el procurador a su nuevo municipio
    UPDATE Procurador SET id_municipio = p_id_municipio WHERE id_procurador = p_id_procurador;

    -- los reportes y casos del municipio pasan al procurador nuevo
    UPDATE Reporte SET id_procurador = p_id_procurador WHERE id_municipio = p_id_municipio;
    -- los casos se buscan por los reportes del municipio, asi entran tambien los que quedaron sin responsable
    UPDATE Casos SET id_procurador_responsable = p_id_procurador
    WHERE id_caso IN (SELECT id_caso FROM Reporte
                      WHERE id_municipio = p_id_municipio AND id_caso IS NOT NULL);

    COMMIT;
END $$


-- fusionar dos reportes duplicados en un caso
-- si uno de los dos ya pertenece a un caso, el otro se suma a ese caso
CREATE PROCEDURE sp_fusionar_reportes(
    IN p_folio1 VARCHAR(20),
    IN p_folio2 VARCHAR(20)
)
BEGIN
    DECLARE v_existe1 INT;
    DECLARE v_existe2 INT;
    DECLARE v_municipio1 INT;
    DECLARE v_municipio2 INT;
    DECLARE v_caso1 INT;
    DECLARE v_caso2 INT;
    DECLARE v_estatus1 VARCHAR(50);
    DECLARE v_estatus2 VARCHAR(50);
    DECLARE v_id_caso INT;
    DECLARE v_estatus_caso VARCHAR(50);
    DECLARE v_id_procurador INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_folio1 = p_folio2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede fusionar un reporte consigo mismo';
    END IF;

    SELECT COUNT(*) INTO v_existe1 FROM Reporte WHERE id_folio_reporte = p_folio1;
    SELECT COUNT(*) INTO v_existe2 FROM Reporte WHERE id_folio_reporte = p_folio2;
    IF v_existe1 = 0 OR v_existe2 = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Uno de los folios no existe';
    END IF;

    SELECT id_municipio, id_caso, estatus INTO v_municipio1, v_caso1, v_estatus1
    FROM Reporte WHERE id_folio_reporte = p_folio1;

    SELECT id_municipio, id_caso, estatus INTO v_municipio2, v_caso2, v_estatus2
    FROM Reporte WHERE id_folio_reporte = p_folio2;

    IF v_municipio1 <> v_municipio2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden fusionar reportes del mismo municipio';
    END IF;

    IF fn_es_estatus_final(v_estatus1) OR fn_es_estatus_final(v_estatus2) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede fusionar un reporte cerrado';
    END IF;

    IF v_caso1 IS NOT NULL AND v_caso2 IS NOT NULL THEN
        IF v_caso1 = v_caso2 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los reportes ya pertenecen al mismo caso';
        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ambos reportes ya pertenecen a casos distintos';
        END IF;
    END IF;

    -- identificamos al procurador del municipio
    SET v_id_procurador = (SELECT id_procurador FROM Procurador WHERE id_municipio = v_municipio1);

    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    START TRANSACTION;

    -- la logica para la fusion
    IF v_caso1 IS NULL AND v_caso2 IS NULL THEN
        -- caso nuevo, nace en Registrado
        INSERT INTO Casos (estatus_caso, fecha_creacion, fecha_cierre, id_procurador_responsable)
        VALUES ('Registrado', CURDATE(), NULL, v_id_procurador);
        -- guardamos el id del nuevo caso recien creado
        SET v_id_caso = LAST_INSERT_ID();
    ELSE
        -- si uno ya tenía caso el otro se suma a ese
        SET v_id_caso = IFNULL(v_caso1, v_caso2);
    END IF;

    SET v_estatus_caso = (SELECT estatus_caso FROM Casos WHERE id_caso = v_id_caso);

    -- unificamos los reportes asignandoles el id del caso, el estatus actual y apagando la bandera de duplicado
    UPDATE Reporte
    SET id_caso = v_id_caso,
        estatus = v_estatus_caso,
        posible_duplicado = FALSE
    WHERE id_folio_reporte IN (p_folio1, p_folio2) AND id_caso IS NULL;

    -- sus notas anteriores también pasan a ser del caso
    UPDATE Notas_Avance_Reporte
    SET id_caso = v_id_caso
    WHERE id_folio_reporte IN (p_folio1, p_folio2) AND id_caso IS NULL;

    COMMIT;
END $$

DELIMITER ;
