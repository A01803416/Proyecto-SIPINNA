/**
 * Pantalla del Paso 2 (Detalles) para capturar la descripción, edad, horario, frecuencia, riesgo y peligro.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.view.screens.report

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.tooling.preview.Preview
import mx.joshh.appsipinna.R
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
    horario: String,
    frecuencia: String,
    nivelRiesgo: String,
    peligroInmediato: Boolean?,
    isStepValid: Boolean,
    onDescripcionChange: (String) -> Unit,
    onNumeroMenoresChange: (Int) -> Unit,
    onEdadAproximadaChange: (String) -> Unit,
    onHorarioChange: (String) -> Unit,
    onFrecuenciaChange: (String) -> Unit,
    onNivelRiesgoChange: (String) -> Unit,
    onPeligroInmediatoChange: (Boolean) -> Unit,
    onNextClick: () -> Unit,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val focusManager = LocalFocusManager.current
    val keyboardController = LocalSoftwareKeyboardController.current

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
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = RietiTheme.spacing.screenHorizontal),
            verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xl)
        ) {
            StepIndicator(currentStep = 2)
            
            Text(
                text = stringResource(R.string.paso2_instrucciones),
                style = MaterialTheme.typography.bodyLarge
            )

            RietiTextField(
                value = descripcion,
                onValueChange = onDescripcionChange,
                label = stringResource(R.string.label_descripcion),
                placeholder = stringResource(R.string.placeholder_descripcion),
                singleLine = false,
                minLines = 4,
                maxLength = 255,
                fieldTag = "campo_descripcion"
                // Sin imeAction por ser multilínea
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
                maxLength = 50,
                fieldTag = "campo_edad",
                imeAction = ImeAction.Next,
                onImeAction = { focusManager.moveFocus(FocusDirection.Down) }
            )

            Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)) {
                Text(
                    text = stringResource(R.string.label_horario),
                    style = MaterialTheme.typography.titleSmall
                )
                SelectionChips(
                    options = listOf("Matutino", "Vespertino", "Nocturno", "Variable"),
                    selectedOption = horario,
                    onOptionSelected = onHorarioChange,
                    labelProvider = { it }
                )
            }

            RietiTextField(
                value = frecuencia,
                onValueChange = onFrecuenciaChange,
                label = stringResource(R.string.label_frecuencia_texto),
                placeholder = stringResource(R.string.placeholder_frecuencia_texto),
                maxLength = 50,
                fieldTag = "campo_frecuencia",
                imeAction = ImeAction.Done,
                onImeAction = {
                    keyboardController?.hide()
                    focusManager.clearFocus()
                }
            )

            Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)) {
                Text(
                    text = stringResource(R.string.label_nivel_riesgo),
                    style = MaterialTheme.typography.titleSmall
                )
                SelectionChips(
                    options = listOf("Bajo", "Medio", "Alto"),
                    selectedOption = nivelRiesgo,
                    onOptionSelected = onNivelRiesgoChange,
                    labelProvider = { it }
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
            horario = "Matutino",
            frecuencia = "",
            nivelRiesgo = "Medio",
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
