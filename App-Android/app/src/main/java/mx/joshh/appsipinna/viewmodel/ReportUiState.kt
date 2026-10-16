/**
 * Clase de estado que almacena todos los campos capturados durante el formulario de reporte de casos.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.viewmodel

import mx.joshh.appsipinna.model.Municipio
import mx.joshh.appsipinna.model.TipoEnvio

/**
 * Estado reactivo del formulario de reporte de trabajo infantil.
 * @property idMunicipio Identificador del municipio seleccionado.
 * @property municipios Lista de municipios obtenidos del backend.
 * @property colonia Nombre de la colonia capturada.
 * @property latitud Coordenada de latitud del pin en el mapa.
 * @property longitud Coordenada de longitud del pin en el mapa.
 * @property ubicacionMarcada Indica si el usuario ha marcado una ubicación válida.
 * @property nombreLugar Referencia o nombre del establecimiento.
 * @property tipoActividad Tipo de trabajo infantil observado (texto libre).
 * @property descripcion Descripción detallada de los hechos.
 * @property numeroMenores Número de menores involucrados.
 * @property edadAproximada Edad aproximada de los menores.
 * @property horario Horario en que ocurre la situación (Matutino, Vespertino, Nocturno, Variable).
 * @property frecuencia Frecuencia con la que ocurre.
 * @property nivelRiesgo Nivel de riesgo estimado (Bajo, Medio, Alto).
 * @property peligroInmediato Indica si hay peligro inminente.
 * @property tipoEnvio Modalidad de envío (con seguimiento o anónimo).
 * @property advertenciaEntendida Indica si el usuario leyó la advertencia de privacidad de evidencia.
 * @property evidenciaUri URI de la evidencia fotográfica adjunta.
 * @property correo Correo electrónico de contacto.
 * @property isEnviando Indicador de carga durante el envío del reporte.
 * @property folioGenerado Código de folio generado tras el envío exitoso.
 * @property errorEnvio Recurso de string con error de envío si ocurre.
 * @property errorMunicipio Recurso de string con error al cargar municipios si ocurre.
 * @property errorMessage Mensaje de error devuelto por el servidor.
 * @property errorNombreLugar Error de validación en la referencia.
 * @property errorColonia Error de validación en la colonia.
 * @property errorDescripcion Error de validación en la descripción.
 * @property errorCorreo Error de validación en el correo.
 */
data class ReportUiState(
    // Paso 1: Ubicación
    val idMunicipio: Int = 1,
    val municipios: List<Municipio> = emptyList(),
    val colonia: String = "",
    val latitud: Double = 19.5546,
    val longitud: Double = -99.2476,
    val ubicacionMarcada: Boolean = false,
    val nombreLugar: String = "",
    val tipoActividad: String = "",
    
    // Paso 2: Detalles
    val descripcion: String = "",
    val numeroMenores: Int = 1,
    val edadAproximada: String = "",
    val horario: String = "Matutino",
    val frecuencia: String = "",
    val nivelRiesgo: String = "Bajo",
    val peligroInmediato: Boolean? = null,
    
    // Paso 3: Evidencia, Contacto y Envío
    val tipoEnvio: TipoEnvio = TipoEnvio.CON_SEGUIMIENTO,
    val advertenciaEntendida: Boolean = false,
    val evidenciaUri: String? = null,
    val correo: String = "",
    
    // Estado del envío
    val isEnviando: Boolean = false,
    val folioGenerado: String? = null,
    val errorEnvio: Int? = null,
    val errorMunicipio: Int? = null,
    val errorMessage: String? = null,
    
    // Validaciones
    val errorNombreLugar: Int? = null,
    val errorColonia: Int? = null,
    val errorDescripcion: Int? = null,
    val errorCorreo: Int? = null
) {
    /**
     * Valida el Paso 1 (Ubicación).
     * Todos los campos obligatorios deben estar completos y no ser solo espacios en blanco.
     */
    val isStep1Valid: Boolean = ubicacionMarcada && 
            colonia.isNotBlank() && colonia.trim().isNotBlank() &&
            nombreLugar.isNotBlank() && nombreLugar.trim().isNotBlank() && 
            tipoActividad.isNotBlank() && tipoActividad.trim().isNotBlank()
            
    /**
     * Valida el Paso 2 (Detalles).
     * Todos los campos obligatorios deben estar completos y no ser solo espacios en blanco, con la descripción de máximo 255 caracteres.
     */
    val isStep2Valid: Boolean = descripcion.isNotBlank() && descripcion.trim().isNotBlank() && 
            descripcion.length <= 255 &&
            numeroMenores > 0 && 
            edadAproximada.isNotBlank() && edadAproximada.trim().isNotBlank() && 
            horario.isNotBlank() && 
            frecuencia.isNotBlank() && frecuencia.trim().isNotBlank() &&
            nivelRiesgo.isNotBlank() &&
            peligroInmediato != null
            
    /**
     * Valida el Paso 3 (Evidencia, Contacto y Envío).
     * El correo es obligatorio solo si el tipo de envío es con seguimiento.
     */
    val isStep3Valid: Boolean = when (tipoEnvio) {
        TipoEnvio.CON_SEGUIMIENTO -> correo.isNotBlank() && correo.trim().isNotBlank() && errorCorreo == null
        TipoEnvio.ANONIMO -> true
    }
    
    /** Valida si todo el formulario está completo y listo para enviarse. */
    val canSubmit: Boolean = isStep1Valid && isStep2Valid && isStep3Valid
}
