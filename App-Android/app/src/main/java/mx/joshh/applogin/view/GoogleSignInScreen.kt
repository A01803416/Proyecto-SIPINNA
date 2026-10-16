package mx.joshh.applogin.view

import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import mx.joshh.applogin.viewmodel.AppVM
import mx.joshh.applogin.model.AuthState


/**
 * Pantalla principal de inicio de sesión con Google.
 * Muestra dinámicamente los componentes de interfaz en función del [AuthState] expuesto por el [viewModel].
 *
 * @param viewModel Instancia del [AppVM] que gestiona las acciones y el estado de la UI.
 * @param modifier Modificador de diseño opcional para personalizar la apariencia del contenedor.
 */
@Composable
fun GoogleSignInScreen(
    viewModel: AppVM,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val authState by viewModel.authState.collectAsState()

    // Manejo de efectos secundarios (Toasts) al cambiar el estado de autenticación
    LaunchedEffect(authState) {
        when (val state = authState) {
            is AuthState.Success -> {
                val name = state.user.displayName ?: state.user.id
                Toast.makeText(context, "Bienvenido: $name", Toast.LENGTH_LONG).show()
            }
            is AuthState.Error -> {
                Toast.makeText(context, state.message, Toast.LENGTH_SHORT).show()
            }
            else -> {}
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        when (val state = authState) {
            is AuthState.Loading -> {
                CircularProgressIndicator()
                Spacer(modifier = Modifier.height(16.dp))
                Text(text = "Procesando autenticación...")
            }

            is AuthState.Success -> {
                Text(
                    text = "Estado: Logueado",
                    style = MaterialTheme.typography.titleMedium
                )
                state.user.displayName?.let { name ->
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(text = "Usuario: $name")
                }
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = { viewModel.signOutFromGoogle(context) }
                ) {
                    Text(text = "Cerrar sesión")
                }
            }

            is AuthState.Idle, is AuthState.Error -> {
                Text(
                    text = "Estado: No logueado",
                    style = MaterialTheme.typography.titleMedium
                )
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = { viewModel.signInWithGoogle(context) }
                ) {
                    Text(text = "Iniciar sesión con Google")
                }
            }
        }
    }
}
