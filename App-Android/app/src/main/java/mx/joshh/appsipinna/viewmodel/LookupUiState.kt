/**
 * Estados de la interfaz de usuario para la pantalla de consulta de folios.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.viewmodel

import mx.joshh.appsipinna.ReporteConsultaResponse

/**
 * Interfaz sellada (`sealed interface`) que representa los posibles estados de la pantalla de consulta.
 */
sealed interface LookupUiState {
    /** Estado inicial sin consultas realizadas. */
    data object Idle : LookupUiState
    /** Estado de carga mientras se procesa la consulta con el servidor. */
    data object Loading : LookupUiState
    /** Estado exitoso con la respuesta del reporte encontrado. */
    data class Success(val reporte: ReporteConsultaResponse) : LookupUiState
    /** Estado de error con el mensaje de texto devuelto por el servidor o red. */
    data class Error(val message: String) : LookupUiState
}
