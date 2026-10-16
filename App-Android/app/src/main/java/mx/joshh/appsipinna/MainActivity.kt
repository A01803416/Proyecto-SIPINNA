/**
 * Actividad principal de la aplicación. Configura el ciclo de vida,
 * inicializa el ViewModel de ubicación y establece el contenedor de navegación.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.compose.rememberNavController
import mx.joshh.appsipinna.view.components.OfflineScreen
import mx.joshh.appsipinna.view.navigation.RietiNavGraph
import mx.joshh.appsipinna.view.theme.RietiTheme
import mx.joshh.appsipinna.viewmodel.UbicacionVM

/**
 * Actividad raíz (`ComponentActivity`) de la aplicación.
 * Administra el ciclo de vida del GPS, la conectividad a internet en tiempo real y el contenedor de navegación principal con Jetpack Compose.
 */
class MainActivity : ComponentActivity() {
    private val ubicacionVM: UbicacionVM by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ubicacionVM.crearAdministradorUbicacion(this)
        enableEdgeToEdge()
        setContent {
            RietiTheme {
                val context = LocalContext.current
                var isConnected by remember { mutableStateOf(checkIsConnected(context)) }

                DisposableEffect(context) {
                    val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
                    val callback = object : ConnectivityManager.NetworkCallback() {
                        override fun onAvailable(network: Network) {
                            if (!isTestEnvironment()) isConnected = true
                        }
                        override fun onLost(network: Network) {
                            if (!isTestEnvironment()) isConnected = false
                        }
                        override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) {
                            if (!isTestEnvironment()) {
                                val hasInternet = networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                                isConnected = hasInternet
                            }
                        }
                    }
                    val request = NetworkRequest.Builder()
                        .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                        .build()
                    try {
                        connectivityManager.registerNetworkCallback(request, callback)
                    } catch (_: Exception) {}

                    onDispose {
                        try {
                            connectivityManager.unregisterNetworkCallback(callback)
                        } catch (_: Exception) {}
                    }
                }

                if (!isConnected) {
                    OfflineScreen(
                        onRetry = {
                            isConnected = checkIsConnected(context)
                        }
                    )
                } else {
                    val navController = rememberNavController()
                    RietiNavGraph(navController = navController, ubicacionVM = ubicacionVM)
                }
            }
        }
    }

    override fun onStart() {
        super.onStart()
        ubicacionVM.iniciarActualizaciones()
    }

    override fun onStop() {
        super.onStop()
        ubicacionVM.detenerActualizaciones()
    }

    /** Comprueba si el dispositivo cuenta con conexión activa a internet. */
    private fun checkIsConnected(context: Context): Boolean {
        if (isTestEnvironment()) return true
        try {
            val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val network = cm.activeNetwork ?: return false
            val capabilities = cm.getNetworkCapabilities(network) ?: return false
            return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        } catch (_: Exception) {
            return true
        }
    }

    /** Detecta si la app se está ejecutando dentro de un entorno de pruebas instrumentadas. */
    private fun isTestEnvironment(): Boolean {
        return try {
            Class.forName("androidx.test.platform.app.InstrumentationRegistry")
            true
        } catch (_: Exception) {
            false
        }
    }
}
