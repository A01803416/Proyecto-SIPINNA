/**
 * Pantalla de resultados de consulta que muestra el estatus, fecha de registro y última nota pública.
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
import mx.joshh.appsipinna.model.EstatusReporte
import mx.joshh.appsipinna.model.Horario
import mx.joshh.appsipinna.model.NivelRiesgo
import mx.joshh.appsipinna.model.Reporte
import mx.joshh.appsipinna.model.TipoActividad
import mx.joshh.appsipinna.model.TipoEnvio
import mx.joshh.appsipinna.view.components.RietiButton
import mx.joshh.appsipinna.view.components.RietiTopAppBar
import mx.joshh.appsipinna.view.components.StatusChip
import mx.joshh.appsipinna.view.theme.FolioTextStyle
import mx.joshh.appsipinna.view.theme.RietiTheme
import java.time.format.DateTimeFormatter

/** Pantalla de estatus del reporte consultado. */
@Composable
fun ResultScreen(
    reporte: Reporte,
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
                    text = reporte.folio ?: "",
                    style = FolioTextStyle,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = stringResource(
                        R.string.lookup_label_fecha,
                        reporte.fechaRegistro.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                    ),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.md)) {
                Text(
                    text = stringResource(R.string.lookup_label_estatus),
                    style = MaterialTheme.typography.titleMedium
                )
                StatusChip(estatus = reporte.estatus)
            }

            reporte.ultimaNotaPublica?.let { nota ->
                Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xs)) {
                    Text(
                        text = stringResource(R.string.lookup_label_ultima_nota),
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = nota,
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
            reporte = Reporte(
                folio = "RIETI-ATZ-000001",
                idMunicipio = 1,
                colonia = "Centro",
                tipoActividad = TipoActividad.OTRO,
                latitud = 0.0,
                longitud = 0.0,
                nombreLugar = "",
                descripcion = "",
                numeroMenores = 0,
                edadAproximada = "",
                horario = Horario.MATUTINO,
                frecuencia = "Diario",
                nivelRiesgo = NivelRiesgo.MEDIO,
                peligroInmediato = false,
                tipoEnvio = TipoEnvio.CON_SEGUIMIENTO,
                evidenciaUri = null,
                correo = "ciudadano@correo.com",
                estatus = EstatusReporte.EN_SEGUIMIENTO,
                ultimaNotaPublica = "Se realizó una visita al lugar."
            ),
            onBackClick = {}
        )
    }
}
