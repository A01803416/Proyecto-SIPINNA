package mx.joshh.applogin.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import mx.joshh.applogin.TOKEN_WEB
import mx.joshh.applogin.model.AuthRepository
import mx.joshh.applogin.model.AuthRepositoryImpl
import mx.joshh.applogin.model.AuthState

/**
 * ViewModel que gestiona la lógica de negocio y mantiene el estado de la interfaz de usuario
 * para la autenticación de la aplicación.
 *
 * @property authRepository Instancia del repositorio de autenticación [AuthRepository].
 */
class AppVM(
    private val authRepository: AuthRepository = AuthRepositoryImpl()
) : ViewModel() {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)

    /**
     * Flujo de estado de la interfaz de usuario expuesto como [StateFlow] de solo lectura.
     */
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    /**
     * Inicia el flujo de autenticación con Google.
     * Actualiza el [_authState] a [AuthState.Loading] y posteriormente a [AuthState.Success] o [AuthState.Error].
     *
     * @param context Contexto necesario para lanzar el Bottom Sheet de Credential Manager.
     * @param webClientId Identificador del cliente web de Google Cloud. Por defecto utiliza [TOKEN_WEB].
     */
    fun signInWithGoogle(context: Context, webClientId: String = TOKEN_WEB) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = authRepository.signInWithGoogle(context, webClientId)
            result.onSuccess { user ->
                _authState.value = AuthState.Success(user)
            }.onFailure { error ->
                _authState.value = AuthState.Error(
                    error.localizedMessage ?: "Error al iniciar sesión con Google"
                )
            }
        }
    }

    /**
     * Inicia el proceso de cierre de sesión de la cuenta de Google.
     * Actualiza [_authState] a [AuthState.Idle] en caso de éxito.
     *
     * @param context Contexto necesario para interactuar con Credential Manager.
     */
    fun signOutFromGoogle(context: Context) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = authRepository.signOutFromGoogle(context)
            result.onSuccess {
                _authState.value = AuthState.Idle
            }.onFailure { error ->
                _authState.value = AuthState.Error(
                    error.localizedMessage ?: "Error al cerrar sesión"
                )
            }
        }
    }

    /**
     * Restablece el estado de error a [AuthState.Idle] si el estado actual es [AuthState.Error].
     */
    fun clearError() {
        if (_authState.value is AuthState.Error) {
            _authState.value = AuthState.Idle
        }
    }
}
