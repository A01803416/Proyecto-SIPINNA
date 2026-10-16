/**
 * Indicador visual de progreso por pasos para el formulario de reportes.
 * @author Joshua Martínez, Lian Soto, Diego Sánchez, Maximiliano Arriaga,
 *         Carlos González, Gilberto Marcos
 */
package mx.joshh.appsipinna.view.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import mx.joshh.appsipinna.R
import mx.joshh.appsipinna.view.theme.RietiTheme

/**
 * Barra indicadora de pasos activos y completados en el formulario de reporte.
 * @param currentStep Paso actual en el que se encuentra el usuario (1 basado).
 * @param modifier Modificador de diseño opcional.
 * @param totalSteps Número total de pasos del formulario (por defecto 3).
 */
@Composable
fun StepIndicator(
    currentStep: Int,
    modifier: Modifier = Modifier,
    totalSteps: Int = 3
) {
    val indicatorText = stringResource(R.string.paso_indicador, currentStep, totalSteps)
    
    Column(
        modifier = modifier
            .fillMaxWidth()
            .semantics { 
                contentDescription = indicatorText
            },
        verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.sm)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xs),
            verticalAlignment = Alignment.Bottom
        ) {
            for (i in 1..totalSteps) {
                val isActive = i == currentStep
                val isCompleted = i < currentStep
                
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(if (isActive) RietiTheme.spacing.md else 6.dp)
                        .clip(MaterialTheme.shapes.extraSmall)
                        .background(
                            when {
                                isActive -> MaterialTheme.colorScheme.primary
                                isCompleted -> MaterialTheme.colorScheme.primaryContainer
                                else -> MaterialTheme.colorScheme.outlineVariant
                            }
                        )
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun StepIndicatorPreview() {
    RietiTheme {
        Column(verticalArrangement = Arrangement.spacedBy(RietiTheme.spacing.xxl)) {
            StepIndicator(currentStep = 1)
            StepIndicator(currentStep = 2)
            StepIndicator(currentStep = 3)
        }
    }
}
