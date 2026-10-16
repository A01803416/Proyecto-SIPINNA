/**
 * Ruta para la pantalla de revisión general del reporte antes de enviarlo.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.view.screens.report

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavController
import mx.joshh.appsipinna.view.navigation.Routes
import mx.joshh.appsipinna.viewmodel.ReportViewModel

/** Conecta el ReportViewModel con la ReviewScreen y gestiona el envío. */
@Composable
fun ReviewRoute(
    viewModel: ReportViewModel,
    navController: NavController
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    ReviewScreen(
        state = uiState,
        onEditStep = { step ->
            val route = when (step) {
                1 -> Routes.REPORT_STEP_1
                2 -> Routes.REPORT_STEP_2
                3 -> Routes.REPORT_STEP_3
                else -> Routes.REPORT_STEP_1
            }
            navController.navigate(route) {
                popUpTo(Routes.REPORT_GRAPH)
            }
        },
        onSubmit = {
            viewModel.enviarReporte(context) { _ ->
                navController.navigate(Routes.REPORT_CONFIRMATION) {
                    popUpTo(Routes.REPORT_REVIEW) { inclusive = true }
                }
            }
        },
        onBackClick = { navController.popBackStack() }
    )
}
