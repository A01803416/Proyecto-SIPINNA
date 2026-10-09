/**
 * ViewModel encargado de la lógica de consulta de estatus por folio y correo.
 */
package mx.joshh.appsipinna.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.model.FakeReportRepository

class LookupViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<LookupUiState>(LookupUiState.Idle)
    val uiState: StateFlow<LookupUiState> = _uiState.asStateFlow()

    /** Consulta un reporte usando folio y correo electrónico. */
    fun consultarReporte(folio: String, correo: String) {
        if (folio.isBlank() || correo.isBlank()) return

        viewModelScope.launch {
            _uiState.value = LookupUiState.Loading
            val reporte = FakeReportRepository.consultarPorFolioYCorreo(folio, correo)
            
            if (reporte != null) {
                _uiState.value = LookupUiState.Success(reporte)
            } else {
                _uiState.value = LookupUiState.Error(R.string.lookup_error_credenciales)
            }
        }
    }
    
    /** Restablece el estado de consulta al modo inactivo (Idle). */
    fun reset() {
        _uiState.value = LookupUiState.Idle
    }
}
