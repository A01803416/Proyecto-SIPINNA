/**
 * Pantalla de revisión general que muestra el resumen de todos los datos capturados antes de enviar el reporte.
 */
package mx.joshh.appsipinna.view.screens.report

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.model.Horario
import mx.joshh.appsipinna.model.NivelRiesgo
import mx.joshh.appsipinna.model.TipoActividad
import mx.joshh.appsipinna.model.TipoEnvio
import mx.joshh.appsipinna.model.municipiosPrueba
import mx.joshh.appsipinna.view.components.RietiButton
import mx.joshh.appsipinna.view.components.RietiTopAppBar
import mx.joshh.appsipinna.view.theme.RietiTheme
import mx.joshh.appsipinna.viewmodel.ReportUiState

/** Pantalla de revisión de datos del reporte. */
@Composable
fun ReviewScreen(
    state: ReportUiState,
    onEditStep: (Int) -> Unit,
    onSubmit: () -> Unit,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val municipioNombre = municipiosPrueba.find { it.idMunicipio == state.idMunicipio }?.nombreMunicipio ?: ""

    Scaffold(
        topBar = {
            RietiTopAppBar(
                title = stringResource(R.string.titulo_revision),
                onBackClick = onBackClick
            )
        },
        bottomBar = {
            RietiButton(
                text = stringResource(R.string.boton_enviar),
                onClick = onSubmit,
                enabled = !state.isEnviando,
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
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.lg)
        ) {
            ReviewSection(
                title = stringResource(R.string.seccion_ubicacion),
                onEditClick = { onEditStep(1) }
            ) {
                if (municipioNombre.isNotBlank()) {
                    ReviewItem(label = stringResource(R.string.label_municipio), value = municipioNombre)
                }
                ReviewItem(label = stringResource(R.string.label_colonia), value = state.colonia)
                ReviewItem(label = stringResource(R.string.label_referencia_lugar), value = state.nombreLugar)
                state.tipoActividad?.let {
                    ReviewItem(label = stringResource(R.string.label_tipo_actividad), value = stringResource(it.labelRes))
                }
                if (state.tipoActividad == TipoActividad.OTRO && state.otroTipoActividad.isNotBlank()) {
                    ReviewItem(label = stringResource(R.string.label_otro_tipo_actividad), value = state.otroTipoActividad)
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

            ReviewSection(
                title = stringResource(R.string.seccion_detalles),
                onEditClick = { onEditStep(2) }
            ) {
                ReviewItem(label = stringResource(R.string.label_descripcion), value = state.descripcion)
                ReviewItem(label = stringResource(R.string.label_numero_menores), value = state.numeroMenores.toString())
                ReviewItem(label = stringResource(R.string.label_edad_aproximada), value = state.edadAproximada)
                state.horario?.let {
                    ReviewItem(label = stringResource(R.string.label_horario), value = stringResource(it.labelRes))
                }
                ReviewItem(label = stringResource(R.string.label_frecuencia_texto), value = state.frecuencia)
                state.nivelRiesgo?.let {
                    ReviewItem(label = stringResource(R.string.label_nivel_riesgo), value = stringResource(it.labelRes))
                }
                state.peligroInmediato?.let {
                    ReviewItem(
                        label = stringResource(R.string.label_peligro_inmediato),
                        value = if (it) stringResource(R.string.opcion_si) else stringResource(R.string.opcion_no)
                    )
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

            ReviewSection(
                title = stringResource(R.string.seccion_contacto),
                onEditClick = { onEditStep(3) }
            ) {
                ReviewItem(label = stringResource(R.string.label_tipo_envio), value = stringResource(state.tipoEnvio.labelRes))
                if (state.tipoEnvio == TipoEnvio.CON_SEGUIMIENTO) {
                    ReviewItem(label = stringResource(R.string.label_correo), value = state.correo)
                }
            }
        }
    }
}

@Composable
private fun ReviewSection(
    title: String,
    onEditClick: () -> Unit,
    content: @Composable () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.primary
            )
            TextButton(onClick = onEditClick) {
                Text(
                    text = stringResource(R.string.label_editar),
                    style = MaterialTheme.typography.labelLarge
                )
            }
        }
        content()
    }
}

@Composable
private fun ReviewItem(label: String, value: String) {
    Column(modifier = Modifier.padding(vertical = RietiTheme.spacing.xs)) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyLarge
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun ReviewScreenPreview() {
    RietiTheme {
        ReviewScreen(
            state = ReportUiState(
                idMunicipio = 1,
                colonia = "Centro",
                nombreLugar = "Mercado",
                descripcion = "Descripción de prueba con más de veinte caracteres necesarios.",
                tipoActividad = TipoActividad.OTRO,
                otroTipoActividad = "Venta ambulante",
                horario = Horario.MATUTINO,
                frecuencia = "Todos los días por la tarde",
                nivelRiesgo = NivelRiesgo.MEDIO,
                peligroInmediato = true
            ),
            onEditStep = {},
            onSubmit = {},
            onBackClick = {}
        )
    }
}
