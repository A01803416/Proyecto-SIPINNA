/**
 * Estados de la interfaz de usuario para la pantalla de consulta de folios.
 */
package mx.joshh.appsipinna.viewmodel

import mx.joshh.appsipinna.model.Reporte

sealed interface LookupUiState {
    /** Estado inicial sin consultas realizadas. */
    data object Idle : LookupUiState
    /** Estado de carga mientras se procesa la consulta. */
    data object Loading : LookupUiState
    /** Estado exitoso con el reporte encontrado. */
    data class Success(val reporte: Reporte) : LookupUiState
    /** Estado de error con el mensaje correspondiente. */
    data class Error(val messageRes: Int) : LookupUiState
}
