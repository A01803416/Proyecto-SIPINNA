/**
 * Ruta para el Paso 2 (Detalles) del formulario de reporte.
 */
package mx.joshh.appsipinna.view.screens.report

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavController
import mx.joshh.appsipinna.view.navigation.Routes
import mx.joshh.appsipinna.viewmodel.ReportViewModel

/** Conecta el ReportViewModel con la DetailsStepScreen. */
@Composable
fun DetailsStepRoute(
    viewModel: ReportViewModel,
    navController: NavController
) {
    val uiState by viewModel.uiState.collectAsState()

    DetailsStepScreen(
        descripcion = uiState.descripcion,
        numeroMenores = uiState.numeroMenores,
        edadAproximada = uiState.edadAproximada,
        horario = uiState.horario,
        frecuencia = uiState.frecuencia,
        nivelRiesgo = uiState.nivelRiesgo,
        peligroInmediato = uiState.peligroInmediato,
        isStepValid = uiState.isStep2Valid,
        onDescripcionChange = viewModel::onDescripcionChange,
        onNumeroMenoresChange = viewModel::onNumeroMenoresChange,
        onEdadAproximadaChange = viewModel::onEdadAproximadaChange,
        onHorarioChange = viewModel::onHorarioChange,
        onFrecuenciaChange = viewModel::onFrecuenciaTextChange,
        onNivelRiesgoChange = viewModel::onNivelRiesgoChange,
        onPeligroInmediatoChange = viewModel::onPeligroInmediatoChange,
        onNextClick = { navController.navigate(Routes.REPORT_STEP_3) },
        onBackClick = { navController.popBackStack() }
    )
}
