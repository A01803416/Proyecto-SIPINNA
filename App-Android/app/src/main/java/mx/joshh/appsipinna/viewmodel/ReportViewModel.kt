/**
 * ViewModel principal que maneja el estado de todo el formulario de reporte de casos.
 * Almacena los datos introducidos por el usuario en cada paso y valida que estén
 * completos antes de permitir avanzar o enviar el reporte.
 */
package mx.joshh.appsipinna.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.model.FakeReportRepository
import mx.joshh.appsipinna.model.Horario
import mx.joshh.appsipinna.model.NivelRiesgo
import mx.joshh.appsipinna.model.Reporte
import mx.joshh.appsipinna.model.TipoActividad
import mx.joshh.appsipinna.model.TipoEnvio

class ReportViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(ReportUiState())
    val uiState: StateFlow<ReportUiState> = _uiState.asStateFlow()

    /** Actualiza el ID del municipio seleccionado en el Paso 1. */
    fun onIdMunicipioChange(value: Int) {
        _uiState.update { it.copy(idMunicipio = value) }
    }

    /** Actualiza la colonia capturada en el Paso 1. */
    fun onColoniaChange(value: String) {
        _uiState.update { it.copy(colonia = value, errorColonia = null) }
    }

    /** Actualiza la referencia del lugar o establecimiento en el Paso 1. */
    fun onNombreLugarChange(value: String) {
        _uiState.update { it.copy(nombreLugar = value, errorNombreLugar = null) }
    }

    /** Actualiza el tipo de trabajo infantil observado. */
    fun onTipoActividadChange(value: TipoActividad) {
        _uiState.update { it.copy(tipoActividad = value) }
    }

    /** Actualiza la descripción personalizada cuando se elige la actividad "Otro". */
    fun onOtroTipoActividadChange(value: String) {
        _uiState.update { it.copy(otroTipoActividad = value) }
    }

    /** Actualiza la descripción detallada de los hechos en el Paso 2. */
    fun onDescripcionChange(value: String) {
        _uiState.update { it.copy(descripcion = value, errorDescripcion = null) }
    }

    /** Actualiza el número de niñas, niños o adolescentes involucrados. */
    fun onNumeroMenoresChange(value: Int) {
        _uiState.update { it.copy(numeroMenores = value) }
    }

    /** Actualiza la edad aproximada estimada. */
    fun onEdadAproximadaChange(value: String) {
        _uiState.update { it.copy(edadAproximada = value) }
    }

    /** Actualiza el horario en que ocurre la situación. */
    fun onHorarioChange(value: Horario) {
        _uiState.update { it.copy(horario = value) }
    }

    /** Actualiza el texto libre de frecuencia. */
    fun onFrecuenciaTextChange(value: String) {
        _uiState.update { it.copy(frecuencia = value) }
    }

    /** Actualiza el nivel de riesgo (Bajo, Medio, Alto). */
    fun onNivelRiesgoChange(value: NivelRiesgo) {
        _uiState.update { it.copy(nivelRiesgo = value) }
    }

    /** Actualiza si existe una situación de peligro inmediato. */
    fun onPeligroInmediatoChange(value: Boolean) {
        _uiState.update { it.copy(peligroInmediato = value) }
    }

    /** Actualiza el tipo de envío (con seguimiento o anónimo). */
    fun onTipoEnvioChange(value: TipoEnvio) {
        _uiState.update { it.copy(tipoEnvio = value) }
    }

    /** Actualiza si el usuario leyó la advertencia de privacidad de evidencia. */
    fun onAdvertenciaEntendidaChange(value: Boolean) {
        _uiState.update { it.copy(advertenciaEntendida = value) }
    }

    /** Actualiza y valida el correo electrónico de contacto. */
    fun onCorreoChange(value: String) {
        val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[a-z]{2,}$".toRegex()
        val isValid = value.isBlank() || emailRegex.matches(value)
        _uiState.update { 
            it.copy(
                correo = value, 
                errorCorreo = if (isValid) null else R.string.error_correo_invalido 
            ) 
        }
    }

    /** Actualiza las coordenadas geográficas al mover el pin en el mapa. */
    fun onMapClick(lat: Double, lon: Double) {
        _uiState.update { it.copy(latitud = lat, longitud = lon, ubicacionMarcada = true) }
    }
    
    /** Simula la obtención de ubicación GPS centralada en Atizapán. */
    fun onUseMyLocation() {
        _uiState.update { it.copy(latitud = 19.5580, longitud = -99.2485, ubicacionMarcada = true) }
    }

    /** Adjunta una evidencia fotográfica opcional. */
    fun onAttachEvidence(uri: String) {
        _uiState.update { it.copy(evidenciaUri = uri) }
    }

    /** Remueve la evidencia fotográfica adjunta. */
    fun onRemoveEvidence() {
        _uiState.update { it.copy(evidenciaUri = null) }
    }

    /** Envía el reporte completo al repositorio local simulado y genera su folio. */
    fun enviarReporte(onSuccess: (String?) -> Unit) {
        val state = _uiState.value
        if (!state.canSubmit) return

        viewModelScope.launch {
            _uiState.update { it.copy(isEnviando = true, errorEnvio = null) }
            
            val reporte = Reporte(
                idMunicipio = state.idMunicipio,
                colonia = state.colonia,
                tipoActividad = state.tipoActividad!!,
                otroTipoActividad = if (state.tipoActividad == TipoActividad.OTRO) state.otroTipoActividad else null,
                latitud = state.latitud,
                longitud = state.longitud,
                nombreLugar = state.nombreLugar,
                descripcion = state.descripcion,
                numeroMenores = state.numeroMenores,
                edadAproximada = state.edadAproximada,
                horario = state.horario!!,
                frecuencia = state.frecuencia,
                nivelRiesgo = state.nivelRiesgo!!,
                peligroInmediato = state.peligroInmediato!!,
                tipoEnvio = state.tipoEnvio,
                evidenciaUri = state.evidenciaUri,
                correo = if (state.tipoEnvio == TipoEnvio.CON_SEGUIMIENTO) state.correo else null
            )

            try {
                val folio = FakeReportRepository.crearReporte(reporte)
                _uiState.update { it.copy(isEnviando = false, folioGenerado = folio) }
                onSuccess(folio)
            } catch (_: Exception) {
                _uiState.update { it.copy(isEnviando = false, errorEnvio = R.string.error_envio_reporte) }
            }
        }
    }
    
    /** Restablece el folio generado para permitir un nuevo reporte. */
    fun resetFolio() {
        _uiState.update { it.copy(folioGenerado = null) }
    }
}
