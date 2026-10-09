/**
 * Ruta contenedora que conecta el LookupViewModel con la pantalla de consulta de estatus.
 */
package mx.joshh.appsipinna.view.screens.lookup

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.viewmodel.compose.viewModel
import mx.joshh.appsipinna.viewmodel.LookupViewModel
import mx.joshh.appsipinna.viewmodel.LookupUiState

/** Enruta la vista de consulta según el estado del ViewModel (Idle, Loading, Success, Error). */
@Composable
fun LookupRoute(
    navController: androidx.navigation.NavController,
    viewModel: LookupViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    when (val state = uiState) {
        LookupUiState.Idle -> {
            LookupScreen(
                onConsultarClick = { folio, correo -> viewModel.consultarReporte(folio, correo) },
                onBackClick = { navController.popBackStack() }
            )
        }
        LookupUiState.Loading -> {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = stringResource(mx.joshh.appsipinna.R.string.estado_cargando),
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }
        }
        is LookupUiState.Success -> {
            ResultScreen(
                reporte = state.reporte,
                onBackClick = { 
                    viewModel.reset()
                    navController.popBackStack() 
                }
            )
        }
        is LookupUiState.Error -> {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background)
                    .clickable { viewModel.reset() },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = stringResource(state.messageRes),
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}
