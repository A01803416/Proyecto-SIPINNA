/**
 * Actividad principal de la aplicación. Configura el ciclo de vida,
 * inicializa el ViewModel de ubicación y establece el contenedor de navegación.
 */
package mx.joshh.appsipinna

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.navigation.compose.rememberNavController
import mx.joshh.appsipinna.view.navigation.RietiNavGraph
import mx.joshh.appsipinna.view.theme.RietiTheme
import mx.joshh.appsipinna.viewmodel.UbicacionVM

class MainActivity : ComponentActivity() {
    private val ubicacionVM: UbicacionVM by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ubicacionVM.crearAdministradorUbicacion(this)
        enableEdgeToEdge()
        setContent {
            RietiTheme {
                val navController = rememberNavController()
                RietiNavGraph(navController = navController, ubicacionVM = ubicacionVM)
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
}
