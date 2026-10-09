/**
 * Grafo central de navegación para conectar las pantallas de la aplicación.
 */
package mx.joshh.appsipinna.view.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navigation
import mx.joshh.appsipinna.view.screens.home.HomeScreen
import mx.joshh.appsipinna.view.screens.info.InfoScreen
import mx.joshh.appsipinna.view.screens.lookup.LookupRoute
import mx.joshh.appsipinna.view.screens.report.ConfirmationRoute
import mx.joshh.appsipinna.view.screens.report.DetailsStepRoute
import mx.joshh.appsipinna.view.screens.report.EvidenceStepRoute
import mx.joshh.appsipinna.view.screens.report.LocationStepRoute
import mx.joshh.appsipinna.viewmodel.ReportViewModel
import mx.joshh.appsipinna.view.screens.report.ReviewRoute
import mx.joshh.appsipinna.viewmodel.UbicacionVM

/** Configura los destinos y transiciones de navegación del NavHost. */
@Composable
fun RietiNavGraph(navController: NavHostController, ubicacionVM: UbicacionVM) {
    NavHost(
        navController = navController,
        startDestination = Routes.HOME
    ) {
        composable(Routes.HOME) {
            HomeScreen(
                onReportClick = { navController.navigate(Routes.REPORT_GRAPH) },
                onLookupClick = { navController.navigate(Routes.LOOKUP) },
                onInfoClick = { navController.navigate(Routes.INFO) }
            )
        }
        
        composable(Routes.INFO) {
            InfoScreen(onBackClick = { navController.popBackStack() })
        }
        
        // Grafo de reporte
        navigation(
            startDestination = Routes.REPORT_STEP_1,
            route = Routes.REPORT_GRAPH
        ) {
            composable(Routes.REPORT_STEP_1) { backStackEntry ->
                val parentEntry = remember(backStackEntry) {
                    navController.getBackStackEntry(Routes.REPORT_GRAPH)
                }
                val viewModel: ReportViewModel = viewModel(parentEntry)
                LocationStepRoute(viewModel = viewModel, ubicacionVM = ubicacionVM, navController = navController)
            }
            composable(Routes.REPORT_STEP_2) { backStackEntry ->
                val parentEntry = remember(backStackEntry) {
                    navController.getBackStackEntry(Routes.REPORT_GRAPH)
                }
                val viewModel: ReportViewModel = viewModel(parentEntry)
                DetailsStepRoute(viewModel = viewModel, navController = navController)
            }
            composable(Routes.REPORT_STEP_3) { backStackEntry ->
                val parentEntry = remember(backStackEntry) {
                    navController.getBackStackEntry(Routes.REPORT_GRAPH)
                }
                val viewModel: ReportViewModel = viewModel(parentEntry)
                EvidenceStepRoute(viewModel = viewModel, navController = navController)
            }
            composable(Routes.REPORT_REVIEW) { backStackEntry ->
                val parentEntry = remember(backStackEntry) {
                    navController.getBackStackEntry(Routes.REPORT_GRAPH)
                }
                val viewModel: ReportViewModel = viewModel(parentEntry)
                ReviewRoute(viewModel = viewModel, navController = navController)
            }
            composable(Routes.REPORT_CONFIRMATION) { backStackEntry ->
                val parentEntry = remember(backStackEntry) {
                    navController.getBackStackEntry(Routes.REPORT_GRAPH)
                }
                val viewModel: ReportViewModel = viewModel(parentEntry)
                ConfirmationRoute(viewModel = viewModel, navController = navController)
            }
        }
        
        // Consulta de folio
        composable(Routes.LOOKUP) {
            LookupRoute(navController = navController)
        }
    }
}
