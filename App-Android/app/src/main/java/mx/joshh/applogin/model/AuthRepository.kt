package mx.joshh.applogin.model

import android.content.Context

/**
 * Interfaz para el repositorio de autenticación.
 * Modela la interacción con servicios de inicio y cierre de sesión.
 */
interface AuthRepository {

    /**
     * Inicia sesión con la cuenta de Google utilizando el id de cliente web.
     *
     * @param context Contexto de la aplicación o actividad necesario para lanzar la interfaz nativa.
     * @param webClientId Identificador del cliente web desde la consola de Google Cloud.
     * @return [Result] con el objeto [GoogleUser] si fue exitoso o una excepción si falló.
     */
    suspend fun signInWithGoogle(context: Context, webClientId: String): Result<GoogleUser>

    /**
     * Cierra la sesión activa de Google borrando las credenciales guardadas en el dispositivo.
     *
     * @param context Contexto de la aplicación o actividad.
     * @return [Result] de tipo [Unit] indicando el resultado de la operación.
     */
    suspend fun signOutFromGoogle(context: Context): Result<Unit>
}
