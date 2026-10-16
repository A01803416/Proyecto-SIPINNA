package mx.joshh.applogin.model

import android.content.Context
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Implementación concreta de [AuthRepository] utilizando la API de [CredentialManager] de Android Jetpack.
 */
class AuthRepositoryImpl : AuthRepository {

    /**
     * Lanza el Bottom Sheet nativo de Google ID Token y autentica al usuario.
     *
     * @param context Contexto necesario para [CredentialManager].
     * @param webClientId Web Client ID de la consola de Google Cloud.
     * @return [Result] que contiene [GoogleUser] en caso de éxito o la excepción correspondiente en error.
     */
    override suspend fun signInWithGoogle(context: Context, webClientId: String): Result<GoogleUser> {
        return withContext(Dispatchers.IO) {
            try {
                val credentialManager = CredentialManager.create(context)

                val googleIdOption = GetGoogleIdOption.Builder()
                    .setFilterByAuthorizedAccounts(false)
                    .setServerClientId(webClientId)
                    .setAutoSelectEnabled(true)
                    .build()

                val request = GetCredentialRequest.Builder()
                    .addCredentialOption(googleIdOption)
                    .build()

                val result = credentialManager.getCredential(context = context, request = request)
                val credential = result.credential

                if (credential is CustomCredential &&
                    credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                ) {
                    val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                    val user = GoogleUser(
                        id = googleIdTokenCredential.id,
                        displayName = googleIdTokenCredential.displayName,
                        idToken = googleIdTokenCredential.idToken
                    )
                    Result.success(user)
                } else {
                    Result.failure(Exception("Credencial recibida no es de tipo Google ID Token"))
                }
            } catch (e: GetCredentialException) {
                Result.failure(e)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    /**
     * Limpia el estado de credenciales activas del usuario en el dispositivo.
     *
     * @param context Contexto para invocar [CredentialManager].
     * @return [Result] de tipo [Unit] indicando éxito o fracaso.
     */
    override suspend fun signOutFromGoogle(context: Context): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                val credentialManager = CredentialManager.create(context)
                val request = ClearCredentialStateRequest()
                credentialManager.clearCredentialState(request)
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}
