package mx.joshh.applogin.model

/**
 * Representa la información básica del perfil de usuario autenticado mediante Google.
 *
 * @property id Identificador único o dirección de correo electrónico del usuario.
 * @property displayName Nombre completo o nombre visible del usuario (opcional).
 * @property idToken Token JWT de identidad entregado por Google para autenticación con backends o Firebase.
 */
data class GoogleUser(
    val id: String,
    val displayName: String?,
    val idToken: String
)
