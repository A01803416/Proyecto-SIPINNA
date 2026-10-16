/**
 * Pantalla de resultados de consulta que muestra el estatus, fecha de registro y última nota pública.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.view.screens.lookup

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.ReporteConsultaResponse
import mx.joshh.appsipinna.view.components.RietiButton
import mx.joshh.appsipinna.view.components.RietiTopAppBar
import mx.joshh.appsipinna.view.theme.FolioTextStyle
import mx.joshh.appsipinna.view.theme.RietiTheme

/** Pantalla de estatus del reporte consultado. */
@Composable
fun ResultScreen(
    reporte: ReporteConsultaResponse,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        topBar = {
            RietiTopAppBar(
                title = stringResource(R.string.lookup_resultado_titulo),
                onBackClick = onBackClick
            )
        },
        bottomBar = {
            RietiButton(
                text = stringResource(R.string.boton_entendido),
                onClick = onBackClick,
                modifier = Modifier.padding(RietiTheme.spacing.lg)
            )
        },
        containerColor = MaterialTheme.colorScheme.background,
        modifier = modifier
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = RietiTheme.spacing.screenHorizontal)
                .verticalScroll(rememberScrollState())
                .padding(top = RietiTheme.spacing.xl),
            verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xl)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xs)) {
                Text(
                    text = reporte.idFolioReporte ?: "",
                    style = FolioTextStyle,
                    color = MaterialTheme.colorScheme.primary
                )
                if (!reporte.fechaRegistro.isNullOrBlank()) {
                    Text(
                        text = stringResource(R.string.lookup_label_fecha, reporte.fechaRegistro),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            if (!reporte.estatus.isNullOrBlank()) {
                Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.md)) {
                    Text(
                        text = stringResource(R.string.lookup_label_estatus),
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = reporte.estatus,
                        style = MaterialTheme.typography.headlineSmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            if (!reporte.ultimaNotaPublica.isNullOrBlank()) {
                Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xs)) {
                    Text(
                        text = stringResource(R.string.lookup_label_ultima_nota),
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = reporte.ultimaNotaPublica,
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun ResultScreenPreview() {
    RietiTheme {
        ResultScreen(
            reporte = ReporteConsultaResponse(
                idFolioReporte = "RIETI-ATZ-000001",
                estatus = "En seguimiento",
                fechaRegistro = "2026-10-15 16:07:00",
                ultimaNotaPublica = "Se realizó una visita al lugar.",
                message = null
            ),
            onBackClick = {}
        )
    }
}
