/**
 * Pantalla del Paso 2 (Detalles) para capturar la descripción, edad, horario, frecuencia, riesgo y peligro.
 */
package mx.joshh.appsipinna.view.screens.report

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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.model.Horario
import mx.joshh.appsipinna.model.NivelRiesgo
import mx.joshh.appsipinna.view.components.RietiButton
import mx.joshh.appsipinna.view.components.RietiTextField
import mx.joshh.appsipinna.view.components.RietiTopAppBar
import mx.joshh.appsipinna.view.components.SelectionChips
import mx.joshh.appsipinna.view.components.StepIndicator
import mx.joshh.appsipinna.view.components.Stepper
import mx.joshh.appsipinna.view.theme.RietiTheme

/** Pantalla de captura de detalles del caso. */
@Composable
fun DetailsStepScreen(
    descripcion: String,
    numeroMenores: Int,
    edadAproximada: String,
    horario: Horario?,
    frecuencia: String,
    nivelRiesgo: NivelRiesgo?,
    peligroInmediato: Boolean?,
    isStepValid: Boolean,
    onDescripcionChange: (String) -> Unit,
    onNumeroMenoresChange: (Int) -> Unit,
    onEdadAproximadaChange: (String) -> Unit,
    onHorarioChange: (Horario) -> Unit,
    onFrecuenciaChange: (String) -> Unit,
    onNivelRiesgoChange: (NivelRiesgo) -> Unit,
    onPeligroInmediatoChange: (Boolean) -> Unit,
    onNextClick: () -> Unit,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        topBar = {
            RietiTopAppBar(
                title = stringResource(R.string.titulo_reporte),
                onBackClick = onBackClick
            )
        },
        bottomBar = {
            RietiButton(
                text = stringResource(R.string.boton_continuar),
                onClick = onNextClick,
                enabled = isStepValid,
                modifier = Modifier
                    .padding(RietiTheme.spacing.lg)
                    .testTag("btn_continuar")
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
            verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xl)
        ) {
            StepIndicator(currentStep = 2)
            
            Text(
                text = stringResource(R.string.paso2_instrucciones),
                style = MaterialTheme.typography.bodyLarge
            )

            RietiTextField(
                value = descripcion,
                onValueChange = { if (it.length <= 255) onDescripcionChange(it) },
                label = stringResource(R.string.label_descripcion),
                placeholder = stringResource(R.string.placeholder_descripcion),
                singleLine = false,
                minLines = 4,
                fieldTag = "campo_descripcion"
            )

            Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)) {
                Text(
                    text = stringResource(R.string.label_numero_menores),
                    style = MaterialTheme.typography.titleSmall
                )
                Stepper(
                    value = numeroMenores,
                    onValueChange = onNumeroMenoresChange
                )
            }

            RietiTextField(
                value = edadAproximada,
                onValueChange = onEdadAproximadaChange,
                label = stringResource(R.string.label_edad_aproximada),
                placeholder = stringResource(R.string.placeholder_edad_aproximada),
                fieldTag = "campo_edad"
            )

            Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)) {
                Text(
                    text = stringResource(R.string.label_horario),
                    style = MaterialTheme.typography.titleSmall
                )
                SelectionChips(
                    options = Horario.entries,
                    selectedOption = horario,
                    onOptionSelected = onHorarioChange,
                    labelProvider = { stringResource(it.labelRes) }
                )
            }

            RietiTextField(
                value = frecuencia,
                onValueChange = { if (it.length <= 50) onFrecuenciaChange(it) },
                label = stringResource(R.string.label_frecuencia_texto),
                placeholder = stringResource(R.string.placeholder_frecuencia_texto),
                fieldTag = "campo_frecuencia"
            )

            Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)) {
                Text(
                    text = stringResource(R.string.label_nivel_riesgo),
                    style = MaterialTheme.typography.titleSmall
                )
                SelectionChips(
                    options = NivelRiesgo.entries,
                    selectedOption = nivelRiesgo,
                    onOptionSelected = onNivelRiesgoChange,
                    labelProvider = { stringResource(it.labelRes) }
                )
            }

            Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)) {
                Text(
                    text = stringResource(R.string.label_peligro_inmediato),
                    style = MaterialTheme.typography.titleSmall
                )
                SelectionChips(
                    options = listOf(true, false),
                    selectedOption = peligroInmediato,
                    onOptionSelected = onPeligroInmediatoChange,
                    labelProvider = { if (it) stringResource(R.string.opcion_si) else stringResource(R.string.opcion_no) }
                )
            }
        }
    }
}

@Preview
@Composable
private fun DetailsStepScreenPreview() {
    RietiTheme {
        DetailsStepScreen(
            descripcion = "",
            numeroMenores = 1,
            edadAproximada = "",
            horario = null,
            frecuencia = "",
            nivelRiesgo = null,
            peligroInmediato = null,
            isStepValid = false,
            onDescripcionChange = {},
            onNumeroMenoresChange = {},
            onEdadAproximadaChange = {},
            onHorarioChange = {},
            onFrecuenciaChange = {},
            onNivelRiesgoChange = {},
            onPeligroInmediatoChange = {},
            onNextClick = {},
            onBackClick = {}
        )
    }
}
