/**
 * ViewModel principal que maneja el estado de todo el formulario de reporte de casos.
 * Almacena los datos introducidos por el usuario en cada paso y valida que estén
 * completos antes de permitir avanzar o enviar el reporte.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.viewmodel

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.media.ExifInterface
import android.net.Uri
import android.util.Base64
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.RietiNetworkClient
import mx.joshh.appsipinna.ReporteRequest
import mx.joshh.appsipinna.model.TipoEnvio
import java.io.ByteArrayOutputStream
import java.io.IOException

/**
 * ViewModel principal del formulario de reporte.
 * Nota de diseño: Se asocia al grafo de navegación (`REPORT_GRAPH`) para preservar el estado completo del formulario.
 */
class ReportViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(ReportUiState())
    
    /** Estado reactivo expuesto del formulario de reporte. */
    val uiState: StateFlow<ReportUiState> = _uiState.asStateFlow()

    init {
        cargarMunicipios()
    }

    /**
     * Carga la lista de municipios desde el backend mediante [RietiNetworkClient.api.getMunicipios] fuera del hilo principal.
     */
    fun cargarMunicipios() {
        viewModelScope.launch {
            try {
                val lista = RietiNetworkClient.api.getMunicipios()
                if (lista.isNotEmpty()) {
                    _uiState.update { it.copy(municipios = lista, idMunicipio = lista[0].idMunicipio, errorMunicipio = null) }
                }
            } catch (_: Exception) {
                _uiState.update { it.copy(municipios = emptyList(), errorMunicipio = R.string.error_sin_conexion) }
            }
        }
    }

    /** Actualiza el ID del municipio seleccionado en el Paso 1. */
    fun onIdMunicipioChange(value: Int) {
        _uiState.update { it.copy(idMunicipio = value) }
    }

    /** Actualiza la colonia capturada en el Paso 1 (máx 100 caracteres). */
    fun onColoniaChange(value: String) {
        val trimmed = if (value.length > 100) value.substring(0, 100) else value
        _uiState.update { it.copy(colonia = trimmed, errorColonia = null) }
    }

    /** Actualiza la referencia del lugar o establecimiento en el Paso 1 (máx 100 caracteres). */
    fun onNombreLugarChange(value: String) {
        val trimmed = if (value.length > 100) value.substring(0, 100) else value
        _uiState.update { it.copy(nombreLugar = trimmed, errorNombreLugar = null) }
    }

    /** Actualiza el tipo de trabajo infantil observado como texto libre (máx 100 caracteres). */
    fun onTipoActividadChange(value: String) {
        val trimmed = if (value.length > 100) value.substring(0, 100) else value
        _uiState.update { it.copy(tipoActividad = trimmed) }
    }

    /** Actualiza la descripción detallada de los hechos en el Paso 2 (máx 255 caracteres). */
    fun onDescripcionChange(value: String) {
        val trimmed = if (value.length > 255) value.substring(0, 255) else value
        _uiState.update { it.copy(descripcion = trimmed, errorDescripcion = null) }
    }

    /** Actualiza el número de niñas, niños o adolescentes involucrados. */
    fun onNumeroMenoresChange(value: Int) {
        _uiState.update { it.copy(numeroMenores = value) }
    }

    /** Actualiza la edad aproximada estimada (máx 50 caracteres). */
    fun onEdadAproximadaChange(value: String) {
        val trimmed = if (value.length > 50) value.substring(0, 50) else value
        _uiState.update { it.copy(edadAproximada = trimmed) }
    }

    /** Actualiza el horario en que ocurre la situación ("Matutino", "Vespertino", "Nocturno", "Variable"). */
    fun onHorarioChange(value: String) {
        _uiState.update { it.copy(horario = value) }
    }

    /** Actualiza el texto libre de frecuencia (máx 50 caracteres). */
    fun onFrecuenciaTextChange(value: String) {
        val trimmed = if (value.length > 50) value.substring(0, 50) else value
        _uiState.update { it.copy(frecuencia = trimmed) }
    }

    /** Actualiza el nivel de riesgo ("Bajo", "Medio", "Alto"). */
    fun onNivelRiesgoChange(value: String) {
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
        _uiState.update { 
            it.copy(
                advertenciaEntendida = value,
                evidenciaUri = if (!value) null else it.evidenciaUri
            ) 
        }
    }

    /** Actualiza y valida el correo electrónico de contacto (máx 100 caracteres, acepta mayúsculas y minúsculas). */
    fun onCorreoChange(value: String) {
        val trimmed = if (value.length > 100) value.substring(0, 100) else value
        val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$".toRegex()
        val isValid = trimmed.isBlank() || emailRegex.matches(trimmed)
        _uiState.update { 
            it.copy(
                correo = trimmed, 
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
        _uiState.update { it.copy(latitud = 19.5580, longitud = -99.2476, ubicacionMarcada = true) }
    }

    /** Adjunta una evidencia fotográfica opcional. */
    fun onAttachEvidence(uri: String) {
        _uiState.update { it.copy(evidenciaUri = uri) }
    }

    /** Remueve la evidencia fotográfica adjunta. */
    fun onRemoveEvidence() {
        _uiState.update { it.copy(evidenciaUri = null) }
    }

    /**
     * Envía el reporte completo al backend mediante POST /reportes (Paso E con foto real en base64 y corrección EXIF).
     * @param context Contexto necesario para resolver y procesar la imagen de la evidencia.
     * @param onSuccess Callback que se ejecuta al recibir respuesta exitosa con el folio.
     */
    fun enviarReporte(context: Context, onSuccess: (String?) -> Unit) {
        val state = _uiState.value
        if (!state.canSubmit) return

        viewModelScope.launch {
            _uiState.update { it.copy(isEnviando = true, errorEnvio = null, errorMessage = null) }
            
            val fotoBase64 = if (!state.evidenciaUri.isNullOrBlank()) {
                procesarImagenBase64(context, state.evidenciaUri)
            } else {
                null
            }

            val reporteRequest = ReporteRequest(
                idMunicipio = state.idMunicipio,
                latitud = state.latitud,
                longitud = state.longitud,
                colonia = state.colonia.trim(),
                nombreLugar = state.nombreLugar.trim(),
                tipoActividad = state.tipoActividad.trim(),
                descripcion = state.descripcion.trim(),
                numeroMenores = state.numeroMenores,
                edadAproximada = state.edadAproximada.trim(),
                horario = state.horario.trim(),
                frecuencia = state.frecuencia.trim(),
                nivelRiesgo = state.nivelRiesgo.trim(),
                peligroInmediato = state.peligroInmediato!!,
                correo = if (state.tipoEnvio == TipoEnvio.CON_SEGUIMIENTO) state.correo.trim() else null,
                foto = fotoBase64
            )

            try {
                val response = RietiNetworkClient.api.registrarReporte(reporteRequest)
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    val folio = body.folio
                    _uiState.update { it.copy(isEnviando = false, folioGenerado = folio) }
                    onSuccess(folio)
                } else {
                    val errorBody = response.errorBody()?.string()
                    val message = try {
                        val obj = com.google.gson.JsonParser.parseString(errorBody).asJsonObject
                        if (obj.has("message")) obj.get("message").asString else "Error al procesar el reporte"
                    } catch (_: Exception) {
                        "Error al procesar el reporte"
                    }
                    _uiState.update { it.copy(isEnviando = false, errorMessage = message) }
                }
            } catch (_: IOException) {
                _uiState.update { it.copy(isEnviando = false, errorMessage = "No se pudo conectar con el servidor") }
            } catch (_: Exception) {
                _uiState.update { it.copy(isEnviando = false, errorMessage = "No se pudo conectar con el servidor") }
            }
        }
    }
    
    /**
     * Carga la imagen de la URI, corrige su orientación EXIF si está girada, escala su dimensión
     * máxima a 1280px, la comprime a JPEG al 70% y devuelve el string codificado en Base64 sin prefijo.
     */
    private suspend fun procesarImagenBase64(context: Context, uriString: String): String? {
        return withContext(Dispatchers.IO) {
            try {
                val uri = Uri.parse(uriString)
                
                // 1. Leer orientación EXIF de la imagen original usando ExifInterface
                var degrees = 0f
                context.contentResolver.openInputStream(uri)?.use { inputStream ->
                    try {
                        val exif = ExifInterface(inputStream)
                        val orientation = exif.getAttributeInt(
                            ExifInterface.TAG_ORIENTATION,
                            ExifInterface.ORIENTATION_UNDEFINED
                        )
                        degrees = when (orientation) {
                            ExifInterface.ORIENTATION_ROTATE_90 -> 90f
                            ExifInterface.ORIENTATION_ROTATE_180 -> 180f
                            ExifInterface.ORIENTATION_ROTATE_270 -> 270f
                            else -> 0f
                        }
                    } catch (_: Exception) {}
                }

                // 2. Decodificar el bitmap original
                val inputStreamForBitmap = context.contentResolver.openInputStream(uri) ?: return@withContext null
                val originalBitmap = BitmapFactory.decodeStream(inputStreamForBitmap) ?: return@withContext null
                inputStreamForBitmap.close()

                // 3. Rotar el bitmap si viene girado según la orientación EXIF
                val rotatedBitmap = if (degrees != 0f) {
                    val matrix = Matrix()
                    matrix.postRotate(degrees)
                    Bitmap.createBitmap(originalBitmap, 0, 0, originalBitmap.width, originalBitmap.height, matrix, true)
                } else {
                    originalBitmap
                }

                // 4. Reducir la imagen a un máximo de 1280px en su lado más largo
                val maxDimension = 1280
                val width = rotatedBitmap.width
                val height = rotatedBitmap.height
                val (newWidth, newHeight) = if (width > maxDimension || height > maxDimension) {
                    if (width >= height) {
                        maxDimension to (height * maxDimension / width)
                    } else {
                        (width * maxDimension / height) to maxDimension
                    }
                } else {
                    width to height
                }
                
                val scaledBitmap = if (newWidth != width || newHeight != height) {
                    Bitmap.createScaledBitmap(rotatedBitmap, newWidth, newHeight, true)
                } else {
                    rotatedBitmap
                }
                
                // 5. Comprimir a JPEG 70 y convertir a Base64 sin prefijo
                val outputStream = ByteArrayOutputStream()
                scaledBitmap.compress(Bitmap.CompressFormat.JPEG, 70, outputStream)
                val bytes = outputStream.toByteArray()
                
                Base64.encodeToString(bytes, Base64.NO_WRAP)
            } catch (_: Exception) {
                null
            }
        }
    }

    /** Restablece el folio generado para permitir un nuevo reporte. */
    fun resetFolio() {
        _uiState.update { it.copy(folioGenerado = null, errorMessage = null) }
    }
}
