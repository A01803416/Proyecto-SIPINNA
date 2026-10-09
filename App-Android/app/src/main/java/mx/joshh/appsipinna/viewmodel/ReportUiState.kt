/**
 * Clase de estado que almacena todos los campos capturados durante el formulario de reporte de casos.
 */
package mx.joshh.appsipinna.viewmodel

import mx.joshh.appsipinna.model.Horario
import mx.joshh.appsipinna.model.NivelRiesgo
import mx.joshh.appsipinna.model.TipoActividad
import mx.joshh.appsipinna.model.TipoEnvio

/** Estado reactivo del formulario de reporte de trabajo infantil. */
data class ReportUiState(
    // Paso 1: Ubicación
    val idMunicipio: Int = 1,
    val colonia: String = "",
    val latitud: Double = 19.5546,
    val longitud: Double = -99.2476,
    val ubicacionMarcada: Boolean = false,
    val nombreLugar: String = "",
    val tipoActividad: TipoActividad? = null,
    val otroTipoActividad: String = "",
    
    // Paso 2: Detalles
    val descripcion: String = "",
    val numeroMenores: Int = 1,
    val edadAproximada: String = "",
    val horario: Horario? = null,
    val frecuencia: String = "",
    val nivelRiesgo: NivelRiesgo? = null,
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
    
    // Validaciones
    val errorNombreLugar: Int? = null,
    val errorColonia: Int? = null,
    val errorDescripcion: Int? = null,
    val errorCorreo: Int? = null
) {
    val isStep1Valid: Boolean = ubicacionMarcada && 
            colonia.isNotBlank() &&
            nombreLugar.isNotBlank() && 
            tipoActividad != null && 
            (tipoActividad != TipoActividad.OTRO || otroTipoActividad.isNotBlank())
            
    val isStep2Valid: Boolean = descripcion.isNotBlank() && 
            descripcion.length <= 255 &&
            numeroMenores > 0 && 
            edadAproximada.isNotBlank() && 
            horario != null && 
            frecuencia.isNotBlank() &&
            nivelRiesgo != null &&
            peligroInmediato != null
            
    val isStep3Valid: Boolean = when (tipoEnvio) {
        TipoEnvio.CON_SEGUIMIENTO -> correo.isNotBlank() && errorCorreo == null
        TipoEnvio.ANONIMO -> true
    }
    
    val canSubmit: Boolean = isStep1Valid && isStep2Valid && isStep3Valid
}
