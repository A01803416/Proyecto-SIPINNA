/**
 * Ruta para el Paso 3 (Evidencia y Contacto) del formulario de reporte.
 */
package mx.joshh.appsipinna.view.screens.report

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavController
import mx.joshh.appsipinna.view.navigation.Routes
import mx.joshh.appsipinna.viewmodel.ReportViewModel

/** Conecta el ReportViewModel con la EvidenceStepScreen. */
@Composable
fun EvidenceStepRoute(
    viewModel: ReportViewModel,
    navController: NavController
) {
    val uiState by viewModel.uiState.collectAsState()

    EvidenceStepScreen(
        tipoEnvio = uiState.tipoEnvio,
        advertenciaEntendida = uiState.advertenciaEntendida,
        evidenciaUri = uiState.evidenciaUri,
        correo = uiState.correo,
        errorCorreo = uiState.errorCorreo,
        isStepValid = uiState.isStep3Valid,
        onTipoEnvioChange = viewModel::onTipoEnvioChange,
        onAdvertenciaEntendidaChange = viewModel::onAdvertenciaEntendidaChange,
        onAttachEvidenceClick = { viewModel.onAttachEvidence("foto_evidencia_atizapan.jpg") },
        onRemoveEvidenceClick = viewModel::onRemoveEvidence,
        onCorreoChange = viewModel::onCorreoChange,
        onNextClick = { navController.navigate(Routes.REPORT_REVIEW) },
        onBackClick = { navController.popBackStack() }
    )
}
