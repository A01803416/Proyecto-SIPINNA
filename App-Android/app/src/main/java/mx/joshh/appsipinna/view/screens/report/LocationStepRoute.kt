/**
 * Ruta para el Paso 1 (Ubicación y Municipio) del formulario de reporte.
 */
package mx.joshh.appsipinna.view.screens.report

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import kotlinx.coroutines.delay
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.model.obtenerDireccion
import mx.joshh.appsipinna.view.navigation.Routes
import mx.joshh.appsipinna.viewmodel.ReportViewModel
import mx.joshh.appsipinna.viewmodel.UbicacionVM
import org.osmdroid.util.GeoPoint

/** Conecta el ReportViewModel y el UbicacionVM con la LocationStepScreen. */
@Composable
fun LocationStepRoute(
    viewModel: ReportViewModel,
    ubicacionVM: UbicacionVM,
    navController: NavController
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val gpsLocation by ubicacionVM.ubicacion.collectAsStateWithLifecycle()
    val context = LocalContext.current

    var pin by remember { mutableStateOf(GeoPoint(uiState.latitud, uiState.longitud)) }
    var direccion by remember { mutableStateOf<String?>(null) }
    var gpsReceived by remember { mutableStateOf(false) }

    var esperandoUbicacion by remember { mutableStateOf(false) }
    var errorUbicacion by remember { mutableStateOf<Int?>(null) }

    LaunchedEffect(gpsLocation) {
        val loc = gpsLocation
        if (loc != null && esperandoUbicacion) {
            esperandoUbicacion = false
            errorUbicacion = null
            pin = GeoPoint(loc.latitude, loc.longitude)
        } else if (loc != null && !gpsReceived) {
            gpsReceived = true
            val newPoint = GeoPoint(loc.latitude, loc.longitude)
            pin = newPoint
            viewModel.onMapClick(newPoint.latitude, newPoint.longitude)
        }
    }

    LaunchedEffect(esperandoUbicacion) {
        if (esperandoUbicacion) {
            delay(15000L)
            if (esperandoUbicacion) {
                esperandoUbicacion = false
                errorUbicacion = R.string.error_ubicacion_no_disponible
            }
        }
    }

    LaunchedEffect(pin) {
        viewModel.onMapClick(pin.latitude, pin.longitude)
        delay(700L)
        direccion = obtenerDireccion(context, pin.latitude, pin.longitude)
    }

    LocationStepScreen(
        centro = pin,
        direccion = direccion,
        idMunicipio = uiState.idMunicipio,
        colonia = uiState.colonia,
        nombreLugar = uiState.nombreLugar,
        tipoActividad = uiState.tipoActividad,
        otroTipoActividad = uiState.otroTipoActividad,
        isStepValid = uiState.isStep1Valid,
        esperandoUbicacion = esperandoUbicacion,
        errorUbicacion = errorUbicacion,
        onPinCambiado = { newPoint ->
            pin = newPoint
        },
        onIdMunicipioChange = viewModel::onIdMunicipioChange,
        onColoniaChange = viewModel::onColoniaChange,
        onNombreLugarChange = viewModel::onNombreLugarChange,
        onTipoActividadChange = viewModel::onTipoActividadChange,
        onOtroTipoActividadChange = viewModel::onOtroTipoActividadChange,
        onUseMyLocationClick = {
            errorUbicacion = null
            val loc = gpsLocation
            if (loc != null) {
                pin = GeoPoint(loc.latitude, loc.longitude)
            } else {
                esperandoUbicacion = true
                ubicacionVM.iniciarActualizaciones()
            }
        },
        onNextClick = { navController.navigate(Routes.REPORT_STEP_2) },
        onBackClick = { navController.popBackStack() }
    )
}
