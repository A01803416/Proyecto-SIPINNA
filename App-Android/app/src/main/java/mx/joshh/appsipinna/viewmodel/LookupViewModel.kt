/**
 * ViewModel encargado de la lógica de consulta de estatus por folio y correo mediante el backend de RIETI.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.gson.JsonParser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import mx.joshh.appsipinna.ConsultaRequest
import mx.joshh.appsipinna.RietiNetworkClient
import java.io.IOException

/**
 * ViewModel de consulta de estatus.
 * Nota de diseño: La consulta por folio y correo devuelve únicamente el estatus actual, fecha de registro y última nota pública para cumplir con los principios de privacidad y minimización de datos personales del ciudadano.
 */
class LookupViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<LookupUiState>(LookupUiState.Idle)
    
    /** Estado reactivo expuesto de la consulta. */
    val uiState: StateFlow<LookupUiState> = _uiState.asStateFlow()

    /**
     * Consulta el estatus de un reporte mediante POST /reportes/consulta (Paso F).
     * @param folio Código de folio ingresado.
     * @param correo Correo electrónico ingresado.
     */
    fun consultarReporte(folio: String, correo: String) {
        val folioLimpio = folio.trim()
        val correoLimpio = correo.trim()
        if (folioLimpio.isBlank() || correoLimpio.isBlank()) return

        viewModelScope.launch {
            _uiState.value = LookupUiState.Loading
            try {
                val response = RietiNetworkClient.api.consultarReporte(
                    ConsultaRequest(folioLimpio, correoLimpio)
                )
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    if (body.idFolioReporte != null) {
                        _uiState.value = LookupUiState.Success(body)
                    } else if (!body.message.isNullOrBlank()) {
                        _uiState.value = LookupUiState.Error(body.message)
                    } else {
                        _uiState.value = LookupUiState.Error("Folio o correo incorrectos")
                    }
                } else {
                    val errorBody = response.errorBody()?.string()
                    val message = try {
                        val obj = JsonParser.parseString(errorBody).asJsonObject
                        if (obj.has("message")) obj.get("message").asString else "Folio o correo incorrectos"
                    } catch (_: Exception) {
                        "Folio o correo incorrectos"
                    }
                    _uiState.value = LookupUiState.Error(message)
                }
            } catch (_: IOException) {
                _uiState.value = LookupUiState.Error("No se pudo conectar con el servidor")
            } catch (_: Exception) {
                _uiState.value = LookupUiState.Error("No se pudo conectar con el servidor")
            }
        }
    }
    
    /**
     * Restablece el estado de consulta al modo inactivo (Idle).
     */
    fun reset() {
        _uiState.value = LookupUiState.Idle
    }
}
