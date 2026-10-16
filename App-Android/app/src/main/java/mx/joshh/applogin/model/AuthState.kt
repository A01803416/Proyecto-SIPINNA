package mx.joshh.applogin.model

/**
 * Representa los diferentes estados de autenticación e interfaz de usuario de la aplicación.
 */
sealed interface AuthState {

    /**
     * Estado inactivo / inicial. No hay ninguna sesión iniciada ni proceso en curso.
     */
    data object Idle : AuthState

    /**
     * Estado de carga activa durante el proceso de autenticación o cierre de sesión.
     */
    data object Loading : AuthState

    /**
     * Estado exitoso cuando el usuario ha iniciado sesión correctamente.
     *
     * @property user Objeto [GoogleUser] con los datos del perfil autenticado.
     */
    data class Success(val user: GoogleUser) : AuthState

    /**
     * Estado de error cuando la operación de inicio o cierre de sesión falla.
     *
     * @property message Mensaje descriptivo del error ocurrido.
     */
    data class Error(val message: String) : AuthState
}
